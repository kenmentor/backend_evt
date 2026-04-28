import mongoose from "mongoose";
import { requestCmd } from "../es/commands/request";
import { queryRequests } from "../es/queries";
import { projectionHandlers } from "../es/projection";

export async function create_request(object: any) {
  const requestId = new mongoose.Types.ObjectId().toString();

  await requestCmd.create(requestId, {
    guest: object.guestId,
    host: object.hostId,
    house: object.houseId,
    checkIn: object.checkIn || '',
    checkOut: object.checkOut || '',
    guests: object.guests || 1,
    totalPrice: object.totalPrice || 0,
    note: object.note || '',
  });

  return await queryRequests.getByAggregateId(requestId);
}

export async function delete_request(id: string) {
  await requestCmd.cancel(id, {});
  await projectionHandlers.requests.runOnce();
  return { deleted: true };
}

export async function get_all_request(userId: string, role: string) {
  if (role === "guest") {
    return await queryRequests.getByGuest(userId);
  } else if (role === "host") {
    return await queryRequests.getByHost(userId);
  }
  return await queryRequests.getAll();
}

export async function get_request_details(id: string) {
  return await queryRequests.getByAggregateId(id);
}

export async function alreadyExit(object: any) {
  const all = await queryRequests.getAll();
  return all.find(r =>
    r.guest === object.guestId && r.house === object.houseId && r.status === 'pending'
  ) || null;
}

export async function update_request(id: string, object: any) {
  if (object.accepted !== undefined) {
    if (object.accepted) {
      await requestCmd.approve(id, {});
    } else {
      await requestCmd.reject(id, {});
    }
    await projectionHandlers.requests.runOnce();
  }
  return await queryRequests.getByAggregateId(id);
}
