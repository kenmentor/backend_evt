import mongoose from "mongoose";
import { userCmd } from "../es/commands/user";
import { queryUsers } from "../es/queries";
import { projectionHandlers } from "../es/projection";

interface UserFilter {
  location?: string;
  type?: string;
  role?: string;
  adminVerified?: boolean;
  limit?: string | number;
  bardge?: string | number;
  [key: string]: any;
}

class user_repo {
  async find(query: Record<string, any>) {
    return queryUsers.getAll();
  }

  async findOne(query: Record<string, any>) {
    if (query.email) return queryUsers.getByEmail(query.email);
    if (query.phoneNumber) return queryUsers.getByPhone(query.phoneNumber);
    const all = await queryUsers.getAll();
    return all.find(u => Object.entries(query).every(([k, v]) => (u as any)[k] === v)) || null;
  }

  async findById(id: string) {
    return queryUsers.getByAggregateId(id);
  }

  async create(data: Record<string, any>) {
    const userId = data._id || new mongoose.Types.ObjectId().toString();
    await userCmd.create(userId, {
      email: data.email || '',
      userName: data.userName || '',
      phoneNumber: data.phoneNumber || '',
    });
    await projectionHandlers.users.runOnce();
    return queryUsers.getByAggregateId(userId);
  }

  async filter(filter: UserFilter) {
    try {
      if (filter.location && filter.location !== "undefined") {
        const allUsers = await queryUsers.getAll();
        const filtered = allUsers.filter(
          (u: any) =>
            (u as any).location && (u as any).location.toLowerCase().includes(filter.location!.toLowerCase())
        );
        return filtered;
      }

      const limit = Number(filter.limit) || 50;
      const page = Number(filter.bardge) || 1;
      const skip = (page - 1) * limit;

      const results = await queryUsers.getAll();
      return results.slice(skip, skip + limit);
    } catch (error) {
      console.error("Error filtering data:", error);
      throw error;
    }
  }
}

export default user_repo;
