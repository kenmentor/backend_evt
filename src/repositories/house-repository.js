const crudRepositoryExtra = require("./CRUD");
const mongoose = require("mongoose");
class house_repo extends crudRepositoryExtra {
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

      // 🔎 Location & Keyword filters (fuzzy match)
      const textFilters = [
        "location",
        "type",
        "category",
        "state",
        "lga",
        "landmark",
      ];
      textFilters.forEach((field) => {
        if (filter[field] && filter[field] !== "undefined") {
          query[field] = { $regex: new RegExp(filter[field], "i") }; // fuzzy, case-insensitive
        }
      });

      // 🆔 Exclude a specific house by ID (if provided)
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

      // 📊 Weighted sorting: prioritize type/location matches, then newest
      const sort = { score: { $meta: "textScore" }, createdAt: -1 };

      // 🐛 Debugging
      console.log("✅ Advanced Final Query:", query);
      console.log("📌 Pagination:", { limit, page, skip });

      // 🚀 Execute query
      const results = await this.module
        .find(query, { score: { $meta: "textScore" } }) // include text relevance
        .limit(limit)
        .skip(skip)
        .sort(sort);

      // 📉 Fallback: if no results, return recent listings
      if (results.length === 0) {
        return await this.module
          .find()
          .limit(limit)
          .skip(skip)
          .sort({ createdAt: -1 });
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
      .exec((err, house) => {
        return house;
      });
  }
}
module.exports = house_repo;
