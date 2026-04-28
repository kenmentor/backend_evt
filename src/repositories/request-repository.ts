import crudRepositoryExtra from "./CRUD";
import type { Document } from "mongoose";

class booking_repe extends crudRepositoryExtra<Document> {
  constructor(module: any) {
    super(module);
  }
}

export default booking_repe;
