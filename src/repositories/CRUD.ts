import mongoose, { type Model, type Document, type FilterQuery, type UpdateQuery } from "mongoose";
import { sendVerificationEmail } from "../utility/mail-trap/emails";

class crudRepositoryExtra<T extends Document> {
  module: Model<T>;

  constructor(module: Model<T>) {
    this.module = module;
    const connectDB = require("../utility/connectDb").default;
    connectDB();
    console.log("get-details-constructor ");
  }

  async updateAny(object: FilterQuery<T>): Promise<T | null | undefined> {
    try {
      const verifiedUser = await this.module.findOneAndUpdate(object, {} as UpdateQuery<T>);
      return verifiedUser;
    } catch (error) {
      console.error("Error fetching data from DB:", error);
    }
  }

  async find(object: FilterQuery<T>): Promise<T[]> {
    try {
      const data = await this.module.find(object);
      return data;
    } catch (error) {
      console.error("Error fetching data from DB:", error);
      return [];
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const data = await this.module.find();
      return data;
    } catch (error) {
      console.error("Error fetching data from DB:", error);
      return [];
    }
  }

  async update(key: string, object: UpdateQuery<T>): Promise<T | null> {
    try {
      const data = await this.module.findByIdAndUpdate(key, object);
      return data;
    } catch (error) {
      console.error("Error fetching data from DB:update -id");
      return null;
    }
  }

  async findById(id: string): Promise<T> {
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID is not valid");
    }

    console.log(id, "one");
    try {
      const data = await this.module.findById(id);
      console.log(id, "two");
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

  async create(object: Partial<T> & { email?: string; verifyToken?: string; userName?: string }): Promise<T> {
    const count = await this.module.countDocuments();
    try {
      const newmodule = new this.module({ ...object, pioneer: count < 100 });
      if (newmodule.get("email") && newmodule.get("verifyToken") && newmodule.get("userName")) {
        await sendVerificationEmail(
          newmodule.get("email"),
          newmodule.get("verifyToken"),
          newmodule.get("userName")
        );
      }
      const data = await newmodule.save();
      return data;
    } catch (err) {
      console.log("error while creating data -crud");
      throw err;
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      const data = await this.module.findByIdAndDelete(id);
      return data;
    } catch (err) {
      console.log("error while deleting data -crud");
      throw err;
    }
  }

  async findOne(object: FilterQuery<T>): Promise<T | null> {
    return await this.module.findOne(object);
  }
}

export default crudRepositoryExtra;
