import crudRepositoryExtra from "./CRUD";
import type { Document } from "mongoose";

class request_repe extends crudRepositoryExtra<Document> {
  constructor(module: any) {
    super(module);
  }
}

export default request_repe;
