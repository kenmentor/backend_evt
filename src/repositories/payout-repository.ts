import Payout, { type IPayout } from "../modules/payout";
import mongoose from "mongoose";

class PayoutRepository {
  async create(payoutData: Partial<IPayout>) {
    const payout = new Payout(payoutData);
    return await payout.save();
  }

  async findById(id: string) {
    return await Payout.findById(id);
  }

  async findByAgentId(agentId: string) {
    return await Payout.find({ agentId })
      .populate("propertyId", "title thumbnail")
      .populate("hostId", "userName email")
      .sort({ createdAt: -1 });
  }

  async findByHostId(hostId: string) {
    return await Payout.find({ hostId })
      .populate("propertyId", "title thumbnail")
      .populate("agentId", "userName email")
      .sort({ createdAt: -1 });
  }

  async findByPropertyId(propertyId: string) {
    return await Payout.find({ propertyId });
  }

  async updateStatus(id: string, status: "pending" | "paid") {
    const updateData: Record<string, any> = { status };
    if (status === "paid") {
      updateData.paidDate = new Date();
    }
    return await Payout.findByIdAndUpdate(id, updateData, { new: true });
  }

  async update(id: string, updateData: Partial<IPayout>) {
    return await Payout.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getPendingForAgent(agentId: string) {
    return await Payout.find({ agentId, status: "pending" })
      .populate("propertyId", "title")
      .sort({ createdAt: -1 });
  }

  async getTotalPendingForAgent(agentId: string) {
    const result = await Payout.aggregate([
      { $match: { agentId: new mongoose.Types.ObjectId(agentId), status: "pending" } },
      { $group: { _id: null, total: { $sum: "$commission" } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}

export default new PayoutRepository();
