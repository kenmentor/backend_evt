const payoutRepository = require("../repositories/payout-repository");
const houseRepository = require("../repositories/house-repository");
const bookingRepository = require("../repositories/booking-repository");

class PayoutService {
  async createPayout(payoutData) {
    const { agentId, propertyId, hostId, amount, commission, bookingId } = payoutData;

    const property = await houseRepository.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    const payout = await payoutRepository.create({
      agentId,
      propertyId,
      propertyTitle: property.title,
      hostId,
      bookingId: bookingId || null,
      amount: amount || 0,
      commission: commission || 0,
      status: "pending",
    });

    return payout;
  }

  async getPayoutById(id) {
    return await payoutRepository.findById(id);
  }

  async getPayoutsByAgentId(agentId) {
    return await payoutRepository.findByAgentId(agentId);
  }

  async getPayoutsByHostId(hostId) {
    return await payoutRepository.findByHostId(hostId);
  }

  async markAsPaid(id) {
    return await payoutRepository.updateStatus(id, "paid");
  }

  async updatePayout(id, updateData) {
    return await payoutRepository.update(id, updateData);
  }

  async getPendingPayoutsForAgent(agentId) {
    return await payoutRepository.getPendingForAgent(agentId);
  }

  async getTotalPendingForAgent(agentId) {
    return await payoutRepository.getTotalPendingForAgent(agentId);
  }

  async createPayoutFromBooking(booking) {
    const property = await houseRepository.findById(booking.houseId);
    if (!property || !property.agent) {
      return null;
    }

    const commission = Math.round(booking.amount * 0.05);

    return await this.createPayout({
      agentId: property.agent,
      propertyId: booking.houseId,
      hostId: property.host,
      bookingId: booking._id,
      amount: booking.amount,
      commission,
    });
  }
}

module.exports = new PayoutService();
