import crudRepositoryExtra from "./CRUD";
import type { Document, FilterQuery } from "mongoose";

class verification_repo extends crudRepositoryExtra<Document> {
  constructor(module: any) {
    super(module);
  }

  findOne(object: FilterQuery<Document>) {
    const data = this.module.findOne(object);
    return data;
  }
}

export default verification_repo;
