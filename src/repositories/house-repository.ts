import crudRepositoryExtra from "./CRUD";
import mongoose, { type Document } from "mongoose";
import type { IResource } from "../modules/resource";

export interface SearchPropertiesFilter {
  limit?: string | number;
  bardge?: string | number;
  searchWord?: string;
  hostId?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
  type?: string;
  category?: string;
  state?: string;
  lga?: string;
  landmark?: string;
  amenities?: string;
}

class house_repo extends crudRepositoryExtra<Document> {
  declare module: mongoose.Model<IResource>;

  constructor(module: mongoose.Model<IResource>) {
    super(module);
  }

  async getDetail(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid resource ID format");
    }

    try {
      const data = await this.module
        .findOne({ _id: id as any, avaliable: true })
        .populate("host", "phoneNumber  _id userName email avatar");

      if (!data) {
        throw new Error("Resource not found");
      }

      return data;
    } catch (error: any) {
      console.error("Error fetching resource:", error.message);
      throw new Error(error.message || "Failed to fetch resource");
    }
  }

  async create(object: Partial<IResource>) {
    const count = await this.module.countDocuments();
    try {
      const newmodule = new this.module({ ...object });
      const data = await newmodule.save();
      return data;
    } catch (err) {
      console.log("error while creating data -crud");
      throw err;
    }
  }

  async searchProperties(filter: SearchPropertiesFilter) {
    console.log("Search filter:", filter);

    try {
      const limit = Number(filter.limit) || 50;
      const page = Number(filter.bardge) || 1;
      const skip = (page - 1) * limit;

      let query: Record<string, any> = { avaliable: true };
      let sortOption: any = { createdAt: -1 };
      let projection: Record<string, any> = {};

      const searchWord = filter.searchWord?.trim();
      const hasSearchWord = searchWord && searchWord !== "undefined" && searchWord.length > 0;

      if (filter.hostId && filter.hostId !== "undefined") {
        query.host = filter.hostId;
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
      }

      if (filter.type && filter.type !== "undefined" && filter.type !== "all") {
        query.type = filter.type;
      }
      if (filter.category && filter.category !== "undefined" && filter.category !== "all") {
        query.category = filter.category;
      }
      if (filter.state && filter.state !== "undefined" && filter.state !== "all") {
        query.state = filter.state;
      }
      if (filter.lga && filter.lga !== "undefined" && filter.lga !== "all") {
        query.lga = filter.lga;
      }
      if (filter.landmark && filter.landmark !== "undefined") {
        query.landmark = filter.landmark;
      }

      if (filter.amenities && filter.amenities !== "undefined") {
        const amenitiesArray = filter.amenities.split(",").map((a) => a.trim());
        query.amenities = { $in: amenitiesArray };
      }

      if (hasSearchWord) {
        query.$text = { $search: searchWord };
        sortOption = { score: { $meta: "textScore" }, createdAt: -1 };
        projection = { score: { $meta: "textScore" } };
      }

      let results = await this.module
        .find(query, projection)
        .limit(limit)
        .skip(skip)
        .sort(sortOption);

      if (results.length > 0) {
        console.log("✅ Text search results:", results.length);
        return results;
      }

      if (hasSearchWord) {
        const fuzzyRegex = new RegExp(searchWord!.split(" ").filter((w) => w.length > 1).join("|"), "i");
        const fuzzyQuery: Record<string, any> = {
          ...query,
          $or: [
            { title: fuzzyRegex },
            { address: fuzzyRegex },
            { location: fuzzyRegex },
            { description: fuzzyRegex },
          ],
        };
        delete fuzzyQuery.$text;

        results = await this.module
          .find(fuzzyQuery)
          .limit(limit)
          .skip(skip)
          .sort({ createdAt: -1 });

        if (results.length > 0) {
          console.log("✅ Fuzzy search results:", results.length);
          return results;
        }
      }

      if (!isNaN(min) || !isNaN(max)) {
        const relaxedPriceQuery: Record<string, any> = { ...query };
        delete relaxedPriceQuery.$text;
        relaxedPriceQuery.price = {};
        if (!isNaN(min)) relaxedPriceQuery.price.$gte = Math.max(0, min - 200000);
        if (!isNaN(max)) relaxedPriceQuery.price.$lte = max + 200000;

        results = await this.module
          .find(relaxedPriceQuery)
          .limit(limit)
          .skip(skip)
          .sort({ createdAt: -1 });

        if (results.length > 0) {
          console.log("✅ Relaxed price search results:", results.length);
          return results;
        }
      }

      delete query.$text;
      results = await this.module
        .find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      console.log("✅ Filter-only search results:", results.length);
      return results;
    } catch (error) {
      console.error("❌ Error in searchProperties:", error);
      throw error;
    }
  }

  async filter(filter: SearchPropertiesFilter) {
    return this.searchProperties(filter);
  }

  async losefilter(filter: SearchPropertiesFilter) {
    function queryBuilder(filter: SearchPropertiesFilter) {
      let query: Record<string, any> = {
        avaliable: true,
        $or: [],
      };
      return query;
    }
    this.module
      .find(queryBuilder(filter))
      .limit(Number(filter.limit) || 50)
      .skip((Number(filter.limit) || 50) * (Number(filter.bardge) || 1) - 1)
      .then((house: any) => {
        return house;
      });
  }
}

export default house_repo;
