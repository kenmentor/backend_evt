import crudRepositoryExtra from "./CRUD";
import mongoose, { type Document } from "mongoose";

export interface DemandFilter {
  limit?: string | number;
  bardge?: string | number;
  location?: string;
  type?: string;
  state?: string;
  lga?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
  amenities?: string;
}

class demand_repo extends crudRepositoryExtra<Document> {
  constructor(module: any) {
    super(module);
  }

  async getDetail(id: string) {
    console.log("get-details-crud ");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("id is not valid ");
    }

    try {
      console.log(id);
      const data = await this.module.findById(new mongoose.Types.ObjectId(id));
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

  async filter(filter: DemandFilter) {
    try {
      let query: Record<string, any> = {};

      const textFilters = ["location", "type", "state", "lga"];

      let textSearch: string[] = [];
      textFilters.forEach((field) => {
        if ((filter as any)[field] && (filter as any)[field] !== "undefined") {
          textSearch.push((filter as any)[field]);
        }
      });

      if (textSearch.length > 0) {
        query.$text = { $search: textSearch.join(" ") };
      }

      if (filter.id && filter.id !== "undefined") {
        query._id = { $ne: new mongoose.Types.ObjectId(filter.id) };
      }

      let min = Number(filter.min);
      let max = Number(filter.max);

      if (!isNaN(min) || !isNaN(max)) {
        query.price = {};
        if (!isNaN(min)) query.price.$gte = min;
        if (!isNaN(max)) query.price.$lte = max;

        if (
          Object.keys(query.price).length &&
          !(await this.module.exists(query))
        ) {
          query.price.$gte = isNaN(min) ? 0 : Math.max(0, min - 50000);
          query.price.$lte = isNaN(max) ? Number.MAX_SAFE_INTEGER : max + 50000;
        }
      }

      if (filter.amenities && filter.amenities !== "undefined") {
        const amenitiesArray = filter.amenities.split(",").map((a) => a.trim());
        query.amenities = { $all: amenitiesArray };
      }

      const limit = Number(filter.limit) || 50;
      const page = Number(filter.bardge) || 1;
      const skip = (page - 1) * limit;

      const sort: any = query.$text
        ? { score: { $meta: "textScore" }, createdAt: -1 }
        : { createdAt: -1 };

      console.log("✅ Advanced Final Query:", query);
      console.log("📌 Pagination:", { limit, page, skip });

      const projection = query.$text ? { score: { $meta: "textScore" } } : {};

      const results = await this.module
        .find(query, projection)
        .limit(limit)
        .skip(skip)
        .sort(sort);

      if (results.length === 0) {
        console.log("not found dddddddddddddddddddd");
        const looseQuery: Record<string, any> = {
          $or: textFilters
            .filter((field) => (filter as any)[field] && (filter as any)[field] !== "undefined")
            .map((field) => ({
              [field]: { $regex: new RegExp((filter as any)[field], "i") },
            })),
        };

        let looseResults: any[] = [];
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

  async losefilter(filter: DemandFilter) {
    function queryBuilder(filter: DemandFilter) {
      let query: Record<string, any> = {
        $or: [],
      };
      return query;
    }
    this.module
      .find(queryBuilder(filter))
      .limit(Number(filter.limit) || 50)
      .skip((Number(filter.limit) || 50) * (Number(filter.bardge) || 1) - 1)
      .then((demand: any) => {
        return demand;
      });
  }
}

export default demand_repo;
