const tourRepository = require("../repositories/tour-repository");
const houseRepository = require("../repositories/house-repository");
const userRepository = require("../repositories/user-repository");

class TourService {
  async createTour(tourData) {
    const { propertyId, guestId, scheduledDate, scheduledTime, notes } = tourData;

    const property = await houseRepository.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    const guest = await userRepository.findById(guestId);
    if (!guest) {
      throw new Error("Guest not found");
    }

    const host = await userRepository.findById(property.host);
    if (!host) {
      throw new Error("Host not found");
    }

    const tour = await tourRepository.create({
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
      agentId: property.agent || null,
      agentName: property.agent ? (await userRepository.findById(property.agent))?.userName || "" : "",
      scheduledDate,
      scheduledTime: scheduledTime || "",
      notes: notes || "",
      status: "scheduled",
    });

    return tour;
  }

  async getTourById(id) {
    return await tourRepository.findById(id);
  }

  async getToursByGuestId(guestId) {
    return await tourRepository.findByGuestId(guestId);
  }

  async getToursByHostId(hostId) {
    return await tourRepository.findByHostId(hostId);
  }

  async getToursByAgentId(agentId) {
    return await tourRepository.findByAgentId(agentId);
  }

  async getToursByPropertyId(propertyId) {
    return await tourRepository.findByPropertyId(propertyId);
  }

  async updateTourStatus(id, status) {
    return await tourRepository.updateStatus(id, status);
  }

  async updateTour(id, updateData) {
    return await tourRepository.update(id, updateData);
  }

  async cancelTour(id) {
    return await tourRepository.updateStatus(id, "cancelled");
  }

  async completeTour(id) {
    return await tourRepository.updateStatus(id, "completed");
  }

  async deleteTour(id) {
    return await tourRepository.delete(id);
  }
}

module.exports = new TourService();
