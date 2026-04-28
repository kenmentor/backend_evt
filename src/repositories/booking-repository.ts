import crudRepositoryExtra from "./CRUD";
import type { Document, FilterQuery } from "mongoose";

class booking_repe extends crudRepositoryExtra<Document> {
  constructor(module: any) {
    super(module);
  }

  async findOne(object: FilterQuery<Document>) {
    try {
      const data = await this.module.findOne(object);
      return data;
    } catch (error) {
      console.error("Error fetching data from DB:", error);
    }
  }
}

export default booking_repe;
