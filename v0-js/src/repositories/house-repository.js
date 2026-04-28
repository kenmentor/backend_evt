const crudRepositoryExtra = require("./CRUD");
const mongoose = require("mongoose");
class house_repo extends crudRepositoryExtra {
  constructor(module) {
    super(module);
  }
  async getDetail(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid resource ID format");
    }

    try {
      const data = await this.module
        .findOne({ _id: id, avaliable: true })
        .populate("host", "phoneNumber  _id userName email avatar");
      // populate only phoneNumber, exclude _id

      if (!data) {
        throw new Error("Resource not found");
      }

      return data;
    } catch (error) {
      console.error("Error fetching resource:", error.message);
      throw new Error(error.message || "Failed to fetch resource");
    }
  }
  async create(object) {
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
  
  async searchProperties(filter) {
    console.log("Search filter:", filter);
    
    try {
      const limit = Number(filter.limit) || 50;
      const page = Number(filter.bardge) || 1;
      const skip = (page - 1) * limit;
      
      let query = { avaliable: true };
      let sortOption = { createdAt: -1 };
      let projection = {};
      
      const searchWord = filter.searchWord?.trim();
      const hasSearchWord = searchWord && searchWord !== "undefined" && searchWord.length > 0;
      
      // Build query based on filters
      if (filter.hostId && filter.hostId !== "undefined") {
        query.host = filter.hostId;
      }
      
      if (filter.id && filter.id !== "undefined") {
        query._id = { $ne: mongoose.Types.ObjectId(filter.id) };
      }
      
      // Price filter
      let min = Number(filter.min);
      let max = Number(filter.max);
      if (!isNaN(min) || !isNaN(max)) {
        query.price = {};
        if (!isNaN(min)) query.price.$gte = min;
        if (!isNaN(max)) query.price.$lte = max;
      }
      
      // Exact filters
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
      
      // Amenities filter
      if (filter.amenities && filter.amenities !== "undefined") {
        const amenitiesArray = filter.amenities.split(",").map((a) => a.trim());
        query.amenities = { $in: amenitiesArray };
      }
      
      // 🔍 Search with text index (weighted)
      if (hasSearchWord) {
        query.$text = { $search: searchWord };
        sortOption = { score: { $meta: "textScore" }, createdAt: -1 };
        projection = { score: { $meta: "textScore" } };
      }
      
      // First attempt with text search
      let results = await this.module
        .find(query, projection)
        .limit(limit)
        .skip(skip)
        .sort(sortOption);
      
      if (results.length > 0) {
        console.log("✅ Text search results:", results.length);
        return results;
      }
      
      // Second attempt: Fuzzy regex search with word boundaries
      if (hasSearchWord) {
        const fuzzyRegex = new RegExp(searchWord.split(" ").filter(w => w.length > 1).join("|"), "i");
        const fuzzyQuery = {
          ...query,
          $or: [
            { title: fuzzyRegex },
            { address: fuzzyRegex },
            { location: fuzzyRegex },
            { description: fuzzyRegex },
          ]
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
      
      // Third attempt: Partial match with relaxed price
      if (!isNaN(min) || !isNaN(max)) {
        const relaxedPriceQuery = { ...query };
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
      
      // Fourth attempt: Just filters without text search
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

  // Keep original filter method for backward compatibility
  async filter(filter) {
    return this.searchProperties(filter);
  }
  
  async losefilter(filter) {
    function queryBuilder(filter) {
      let query = {
        avaliable: true,
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
