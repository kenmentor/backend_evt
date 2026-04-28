const crudRepositoryExtra = require("./CRUD");
const mongoose = require("mongoose");
class demand_repo extends crudRepositoryExtra {
  constructor(module) {
    super(module);
  }
  async getDetail(id) {
    console.log("get-details-crud ");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("id is not valid ");
    }

    try {
      console.log(id);
      const data = await this.module.findById(Object(id));
      console.log(data);
      if (!data) {
        throw new Error("Resource not found");
      }

      return data;
    } catch (error) {
      console.error("Error fetching resource:", error);
      throw new Error("Failed to fetch resource");
    }
  }

  async filter(filter) {
    try {
      let query = {};

      const textFilters = ["location", "type", "state", "lga"];

      let textSearch = [];
      textFilters.forEach((field) => {
        if (filter[field] && filter[field] !== "undefined") {
          textSearch.push(filter[field]);
        }
      });

      if (textSearch.length > 0) {
        query.$text = { $search: textSearch.join(" ") };
      }

      // 🆔 Exclude a specific demand by ID (if provided)
      if (filter.id && filter.id !== "undefined") {
        query._id = { $ne: mongoose.Types.ObjectId(filter.id) };
      }

      // 💰 Price filter with tolerance
      let min = Number(filter.min);
      let max = Number(filter.max);

      if (!isNaN(min) || !isNaN(max)) {
        query.price = {};
        if (!isNaN(min)) query.price.$gte = min;
        if (!isNaN(max)) query.price.$lte = max;

        // 🔥 Smart tolerance: expand price range if no results
        if (
          Object.keys(query.price).length &&
          !(await this.module.exists(query))
        ) {
          query.price.$gte = isNaN(min) ? 0 : Math.max(0, min - 50000); // -₦50k tolerance
          query.price.$lte = isNaN(max) ? Number.MAX_SAFE_INTEGER : max + 50000; // +₦50k tolerance
        }
      }

      // 🛠 Amenities filter (AND logic)
      if (filter.amenities && filter.amenities !== "undefined") {
        const amenitiesArray = filter.amenities.split(",").map((a) => a.trim());
        query.amenities = { $all: amenitiesArray };
      }

      // 📄 Pagination
      const limit = Number(filter.limit) || 50;
      const page = Number(filter.bardge) || 1;
      const skip = (page - 1) * limit;

      // 📊 Weighted sorting: prioritize text score (if available), then newest
      const sort = query.$text
        ? { score: { $meta: "textScore" }, createdAt: -1 }
        : { createdAt: -1 };

      // 🐛 Debugging
      console.log("✅ Advanced Final Query:", query);
      console.log("📌 Pagination:", { limit, page, skip });

      // 🚀 Execute query
      const projection = query.$text ? { score: { $meta: "textScore" } } : {};

      const results = await this.module
        .find(query, projection)
        .limit(limit)
        .skip(skip)
        .sort(sort);

      // 📉 Fallback: if no results, return recent listings
      if (results.length === 0) {
        console.log("not found dddddddddddddddddddd");
        // Try a looser match first (any field that contains search terms)
        const looseQuery = {
          $or: textFilters
            .filter((field) => filter[field] && filter[field] !== "undefined")
            .map((field) => ({
              [field]: { $regex: new RegExp(filter[field], "i") },
            })),
        };

        let looseResults = [];
        if (looseQuery.$or.length > 0) {
          looseResults = await this.module
            .find(looseQuery)
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });
        }

        return looseResults;
      }

      return results;
    } catch (error) {
      console.error("❌ Error filtering data:", error);
      throw error;
    }
  }

  async losefilter(filter) {
    function queryBuilder(filter) {
      let query = {
        $or: [],
      };
    }
    this.module
      .find(queryBuilder(filter))
      .limit(filter.limit)
      .skip(filter.limit * filter.bardge - 1)
      .exec((err, demand) => {
        return demand;
      });
  }
}
module.exports = demand_repo;
