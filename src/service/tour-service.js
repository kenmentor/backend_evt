/**
 * Tour Service - Event Sourcing Version
 */

const { getRepos } = require("../event-sourcing");
const mongoose = require("mongoose");

function getTourRepo() {
  const { tourEventRepo } = getRepos();
  return tourEventRepo;
}

function getResourceRepo() {
  const { resourceEventRepo } = getRepos();
  return resourceEventRepo;
}

function getUserRepo() {
  const { userEventRepo } = getRepos();
  return userEventRepo;
}

class TourService {
  async createTour(tourData) {
    const { propertyId, guestId, scheduledDate, scheduledTime, notes } = tourData;
    const repo = getTourRepo();
    const resourceRepo = getResourceRepo();
    const userRepo = getUserRepo();

    const property = await resourceRepo.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    const guest = await userRepo.findById(guestId);
    if (!guest) {
      throw new Error("Guest not found");
    }

    const host = await userRepo.findById(property.host);
    if (!host) {
      throw new Error("Host not found");
    }

    const tourId = new mongoose.Types.ObjectId().toString();
    
    await repo.create({
      _id: tourId,
      propertyId,
      propertyTitle: property.title,
      propertyThumbnail: property.thumbnail || "",
      propertyLocation: property.location || "",
      guestId,
      guestName: guest.userName,
      guestEmail: guest.email || "",
      guestPhone: guest.phoneNumber || tourData.guestPhone || "",
      hostId: property.host,
      hostName: host.userName,
      agentId: property.agentId || null,
      agentName: "",
      scheduledDate,
      scheduledTime: scheduledTime || "",
      notes: notes || "",
    });

    return await repo.findById(tourId);
  }

  async getTourById(id) {
    const repo = getTourRepo();
    return await repo.findById(id);
  }

  async getToursByGuestId(guestId) {
    const repo = getTourRepo();
    return await repo.find({ guestId });
  }

  async getToursByHostId(hostId) {
    const repo = getTourRepo();
    return await repo.find({ hostId });
  }

  async getToursByAgentId(agentId) {
    const repo = getTourRepo();
    return await repo.find({ agentId });
  }

  async getToursByPropertyId(propertyId) {
    const repo = getTourRepo();
    return await repo.find({ propertyId });
  }

  async updateTourStatus(id, status) {
    const repo = getTourRepo();
    
    switch (status) {
      case 'completed':
        await repo.commands.complete(id);
        break;
      case 'cancelled':
        await repo.commands.cancel(id);
        break;
      default:
        throw new Error("Invalid status");
    }
    
    await repo.handler.runOnce();
    return await repo.findById(id);
  }

  async updateTour(id, updateData) {
    const repo = getTourRepo();
    
    if (updateData.scheduledDate) {
      await repo.commands.reschedule(id, {
        scheduledDate: updateData.scheduledDate,
        scheduledTime: updateData.scheduledTime,
      });
      await repo.handler.runOnce();
    }
    
    if (updateData.notes) {
      await repo.commands.addNotes(id, { notes: updateData.notes });
      await repo.handler.runOnce();
    }
    
    return await repo.findById(id);
  }

  async cancelTour(id) {
    const repo = getTourRepo();
    await repo.commands.cancel(id);
    await repo.handler.runOnce();
    return await repo.findById(id);
  }

  async completeTour(id) {
    const repo = getTourRepo();
    await repo.commands.complete(id);
    await repo.handler.runOnce();
    return await repo.findById(id);
  }

  async deleteTour(id) {
    const repo = getTourRepo();
    await repo.commands.cancel(id);
    await repo.handler.runOnce();
    return { deleted: true };
  }
}

module.exports = new TourService();
