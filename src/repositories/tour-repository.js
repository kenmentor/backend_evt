const Tour = require("../modules/tour");

class TourRepository {
  async create(tourData) {
    const tour = new Tour(tourData);
    return await tour.save();
  }

  async findById(id) {
    return await Tour.findById(id);
  }

  async findByGuestId(guestId) {
    return await Tour.find({ guestId }).sort({ createdAt: -1 });
  }

  async findByHostId(hostId) {
    return await Tour.find({ hostId }).sort({ createdAt: -1 });
  }

  async findByAgentId(agentId) {
    return await Tour.find({ agentId }).sort({ createdAt: -1 });
  }

  async findByPropertyId(propertyId) {
    return await Tour.find({ propertyId }).sort({ createdAt: -1 });
  }

  async updateStatus(id, status) {
    return await Tour.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async update(id, updateData) {
    return await Tour.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async delete(id) {
    return await Tour.findByIdAndDelete(id);
  }
}

module.exports = new TourRepository();
