import evtstore from "evtstore";
import Tour, { type ITour } from "../modules/tour";
import mongoose from "mongoose";

const Store = (evtstore as any).Store;

class TourRepository {
  async create(tourData: Partial<ITour> & { _id?: string }) {
    const tourId = tourData._id || new mongoose.Types.ObjectId().toString();
    const tourPayload = {
      ...tourData,
      _id: tourId,
    };
    const stream = Store.stream(`tour-${tourId}`);
    await stream.addEvent({ type: "TourScheduled", payload: tourPayload });
    await stream.commit();
    const tour = new Tour(tourPayload);
    return await tour.save();
  }

  async updateStatus(id: string, status: "scheduled" | "completed" | "cancelled") {
    const stream = Store.stream(`tour-${id}`);
    await stream.addEvent({ type: "TourStatusUpdated", payload: { status } });
    await stream.commit();
    return await Tour.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async findByIdAndUpdate(guestId: string, updateData: Partial<ITour>) {
    const stream = Store.stream(`tour-${guestId}`);
    await stream.addEvent({ type: "TourUpdated", payload: updateData });
    await stream.commit();
    return await Tour.findByIdAndUpdate(
      guestId,
      updateData,
      { new: true }
    );
  }

  async findById(id: string) {
    return await Tour.findById(id);
  }

  async findByGuestId(guestId: string) {
    return await Tour.find({ guestId }).sort({ createdAt: -1 });
  }

  async findByHostId(hostId: string) {
    return await Tour.find({ hostId }).sort({ createdAt: -1 });
  }

  async findByAgentId(agentId: string) {
    return await Tour.find({ agentId }).sort({ createdAt: -1 });
  }

  async findByPropertyId(propertyId: string) {
    return await Tour.find({ propertyId }).sort({ createdAt: -1 });
  }

  async delete(id: string) {
    const stream = Store.stream(`tour-${id}`);
    await stream.addEvent({ type: "TourDeleted", payload: { id } });
    await stream.commit();
    return await Tour.findByIdAndDelete(id);
  }
}

async function sysFromEventStore(tourId: string) {
  const stream = Store.stream(`tour-${tourId}`);
  const events = await stream.getEvents();
  let tourState: Record<string, any> = {};
  for (const event of events) {
    switch (event.type) {
      case "TourScheduled":
        tourState = { ...event.payload };
        break;
      case "TourStatusUpdated":
        tourState.status = event.payload.status;
        break;
      case "TourUpdated":
        tourState = { ...tourState, ...event.payload };
        break;
      case "TourDeleted":
        tourState = {};
        break;
    }
  }
  if (Object.keys(tourState).length === 0) {
    return await Tour.findByIdAndDelete(tourId);
  }
  return await Tour.findByIdAndUpdate(tourId, tourState as any, { new: true });
}

export { sysFromEventStore };
export default new TourRepository();
