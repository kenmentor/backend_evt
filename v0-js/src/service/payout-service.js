/**
 * Payout Service - Event Sourcing Version
 */

const { getRepos } = require("../event-sourcing");
const mongoose = require("mongoose");

function getPayoutRepo() {
  const { payoutEventRepo } = getRepos();
  return payoutEventRepo;
}

function getResourceRepo() {
  const { resourceEventRepo } = getRepos();
  return resourceEventRepo;
}

class PayoutService {
  async createPayout(payoutData) {
    const { agentId, propertyId, hostId, amount, commission, bookingId } = payoutData;
    const repo = getPayoutRepo();
    const resourceRepo = getResourceRepo();

    const property = await resourceRepo.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    const payoutId = new mongoose.Types.ObjectId().toString();
    
    await repo.create({
      _id: payoutId,
      agentId,
      propertyId,
      propertyTitle: property.title,
      hostId,
      bookingId: bookingId || null,
      amount: amount || 0,
      commission: commission || 0,
    });

    return await repo.findById(payoutId);
  }

  async getPayoutById(id) {
    const repo = getPayoutRepo();
    return await repo.findById(id);
  }

  async getPayoutsByAgentId(agentId) {
    const repo = getPayoutRepo();
    return await repo.find({ agentId });
  }

  async getPayoutsByHostId(hostId) {
    const repo = getPayoutRepo();
    return await repo.find({ hostId });
  }

  async markAsPaid(id) {
    const repo = getPayoutRepo();
    await repo.commands.markPaid(id);
    await repo.handler.runOnce();
    return await repo.findById(id);
  }

  async updatePayout(id, updateData) {
    const repo = getPayoutRepo();
    // Handle update if needed
    return await repo.findById(id);
  }

  async getPendingPayoutsForAgent(agentId) {
    const repo = getPayoutRepo();
    const all = await repo.find({ agentId });
    return all.filter(p => p.status === 'pending');
  }

  async getTotalPendingForAgent(agentId) {
    const pending = await this.getPendingPayoutsForAgent(agentId);
    return pending.reduce((sum, p) => sum + p.amount, 0);
  }

  async createPayoutFromBooking(booking) {
    const resourceRepo = getResourceRepo();
    const property = await resourceRepo.findById(booking.houseId);
    if (!property || !property.agentId) {
      return null;
    }

    const commission = Math.round(booking.amount * 0.05);

    return await this.createPayout({
      agentId: property.agentId,
      propertyId: booking.houseId,
      hostId: property.host,
      bookingId: booking._id,
      amount: booking.amount,
      commission,
    });
  }
}

module.exports = new PayoutService();
