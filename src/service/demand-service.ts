import mongoose from "mongoose";
import { demandCmd } from "../es/commands/demand";
import { queryDemands } from "../es/queries";
import { projectionHandlers } from "../es/projection";

export async function find_demand(object: any) {
  if (object.category) {
    return await queryDemands.getByCategory(object.category);
  }
  if (object.location) {
    return await queryDemands.getByLocation(object.location);
  }
  if (object.min !== undefined || object.max !== undefined) {
    return await queryDemands.getByPriceRange(object.min || 0, object.max || 999999999);
  }
  return await queryDemands.getAll();
}

export async function update_demand(object: any) {
  return await queryDemands.getByAggregateId(object.id);
}

export async function get_details(id: string) {
  return await queryDemands.getByAggregateId(id);
}

export async function update_demand_view(id: string) {
  return { views: 0 };
}

export async function upload_demand(body: any) {
  const demandId = new mongoose.Types.ObjectId().toString();

  await demandCmd.create(demandId, {
    guest: body.guest,
    category: body.category || body.type || '',
    minPrice: typeof body.price === 'number' ? body.price : 0,
    maxPrice: typeof body.price === 'number' ? body.price : 0,
    location: body.state || body.location || '',
    description: body.description || '',
  });

  await projectionHandlers.demands.runOnce();
  return await queryDemands.getByAggregateId(demandId);
}
