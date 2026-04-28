const Payout = require("../modules/payout");
const mongoose = require("mongoose");

class PayoutRepository {
  async create(payoutData) {
    const payout = new Payout(payoutData);
    return await payout.save();
  }

  async findById(id) {
    return await Payout.findById(id);
  }

  async findByAgentId(agentId) {
    return await Payout.find({ agentId })
      .populate("propertyId", "title thumbnail")
      .populate("hostId", "userName email")
      .sort({ createdAt: -1 });
  }

  async findByHostId(hostId) {
    return await Payout.find({ hostId })
      .populate("propertyId", "title thumbnail")
      .populate("agentId", "userName email")
      .sort({ createdAt: -1 });
  }

  async findByPropertyId(propertyId) {
    return await Payout.find({ propertyId });
  }

  async updateStatus(id, status) {
    const updateData = { status };
    if (status === "paid") {
      updateData.paidDate = new Date();
    }
    return await Payout.findByIdAndUpdate(id, updateData, { new: true });
  }

  async update(id, updateData) {
    return await Payout.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getPendingForAgent(agentId) {
    return await Payout.find({ agentId, status: "pending" })
      .populate("propertyId", "title")
      .sort({ createdAt: -1 });
  }

  async getTotalPendingForAgent(agentId) {
    const result = await Payout.aggregate([
      { $match: { agentId: new mongoose.Types.ObjectId(agentId), status: "pending" } },
      { $group: { _id: null, total: { $sum: "$commission" } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}

module.exports = new PayoutRepository();
