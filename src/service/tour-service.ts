import mongoose from "mongoose";
import { tourCmd } from "../es/commands/tour";
import { queryTours, queryResources, queryUsers } from "../es/queries";
import { projectionHandlers } from "../es/projection";

class TourService {
  async createTour(tourData: any) {
    const { propertyId, guestId, scheduledDate, scheduledTime, notes } = tourData;

    const property = await queryResources.getByAggregateId(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    const guest = await queryUsers.getById(guestId);
    if (!guest) {
      throw new Error("Guest not found");
    }

    const host = await queryUsers.getById(property.host);
    if (!host) {
      throw new Error("Host not found");
    }

    const tourId = new mongoose.Types.ObjectId().toString();

    await tourCmd.request(tourId, {
      propertyId,
      propertyTitle: property.title,
      propertyThumbnail: property.thumbnail || '',
      propertyLocation: property.location || '',
      guestId,
      guestName: guest.userName,
      guestEmail: guest.email || '',
      guestPhone: guest.phoneNumber || tourData.guestPhone || '',
      hostId: property.host,
      hostName: host.userName,
      scheduledDate,
      scheduledTime: scheduledTime || '',
      notes: notes || '',
    });

    return await queryTours.getByAggregateId(tourId);
  }

  async getTourById(id: string) {
    return await queryTours.getByAggregateId(id);
  }

  async getToursByGuestId(guestId: string) {
    return await queryTours.getByGuest(guestId);
  }

  async getToursByHostId(hostId: string) {
    return await queryTours.getByHost(hostId);
  }

  async getToursByAgentId(agentId: string) {
    return await queryTours.getByAgent(agentId);
  }

  async getToursByPropertyId(propertyId: string) {
    return await queryTours.getByProperty(propertyId);
  }

  async updateTourStatus(id: string, status: string) {
    switch (status) {
      case "completed":
        await tourCmd.complete(id, {});
        break;
      case "cancelled":
        await tourCmd.cancel(id, {});
        break;
      default:
        throw new Error("Invalid status");
    }
    await projectionHandlers.tours.runOnce();
    return await queryTours.getByAggregateId(id);
  }

  async updateTour(id: string, updateData: any) {
    if (updateData.scheduledDate) {
      await tourCmd.reschedule(id, {
        scheduledDate: updateData.scheduledDate,
        scheduledTime: updateData.scheduledTime || '',
      });
      await projectionHandlers.tours.runOnce();
    }

    if (updateData.notes) {
      await tourCmd.addNotes(id, { notes: updateData.notes });
      await projectionHandlers.tours.runOnce();
    }

    return await queryTours.getByAggregateId(id);
  }

  async cancelTour(id: string) {
    await tourCmd.cancel(id, {});
    await projectionHandlers.tours.runOnce();
    return await queryTours.getByAggregateId(id);
  }

  async completeTour(id: string) {
    await tourCmd.complete(id, {});
    await projectionHandlers.tours.runOnce();
    return await queryTours.getByAggregateId(id);
  }

  async deleteTour(id: string) {
    await tourCmd.cancel(id, {});
    await projectionHandlers.tours.runOnce();
    return { deleted: true };
  }
}

export default new TourService();
