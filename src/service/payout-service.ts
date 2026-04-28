import mongoose from "mongoose";
import { payoutCmd } from "../es/commands/payout";
import { queryPayouts, queryResources } from "../es/queries";
import { projectionHandlers } from "../es/projection";

class PayoutService {
  async createPayout(payoutData: any) {
    const { agentId, hostId, amount, bookingId } = payoutData;

    const payoutId = new mongoose.Types.ObjectId().toString();

    await payoutCmd.create(payoutId, {
      host: hostId,
      agentId: agentId || '',
      amount: amount || 0,
      bankName: payoutData.bankName || '',
      accountNumber: payoutData.accountNumber || '',
      accountName: payoutData.accountName || '',
    });

    return await queryPayouts.getByAggregateId(payoutId);
  }

  async getPayoutById(id: string) {
    return await queryPayouts.getByAggregateId(id);
  }

  async getPayoutsByAgentId(agentId: string) {
    return await queryPayouts.getByAgent(agentId);
  }

  async getPayoutsByHostId(hostId: string) {
    return await queryPayouts.getByHost(hostId);
  }

  async markAsPaid(id: string) {
    await payoutCmd.process(id, { transactionRef: '' });
    await projectionHandlers.payouts.runOnce();
    return await queryPayouts.getByAggregateId(id);
  }

  async updatePayout(id: string, updateData: any) {
    return await queryPayouts.getByAggregateId(id);
  }

  async getPendingPayoutsForAgent(agentId: string) {
    return await queryPayouts.getPendingForAgent(agentId);
  }

  async getTotalPendingForAgent(agentId: string) {
    const pending = await this.getPendingPayoutsForAgent(agentId);
    return pending.reduce((sum, p) => sum + p.amount, 0);
  }

  async createPayoutFromBooking(booking: any) {
    const property = booking.houseId
      ? await queryResources.getByAggregateId(booking.houseId)
      : null;
    if (!property || !property.host) {
      return null;
    }

    const commission = Math.round(booking.amount * 0.05);

    return await this.createPayout({
      hostId: property.host,
      amount: booking.amount,
      agentId: (property as any).agentId || '',
      bankName: '',
      accountNumber: '',
      accountName: '',
    });
  }
}

export default new PayoutService();
