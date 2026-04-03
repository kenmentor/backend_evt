const payoutService = require("../service/payout-service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

const createPayout = async (req, res) => {
  try {
    const payout = await payoutService.createPayout(req.body);
    return res.status(201).json(goodResponse(payout, "Payout created successfully"));
  } catch (error) {
    return res.status(400).json(badResponse(error.message || "Failed to create payout", 400));
  }
};

const getPayoutById = async (req, res) => {
  try {
    const payout = await payoutService.getPayoutById(req.params.id);
    if (!payout) {
      return res.status(404).json(badResponse("Payout not found", 404));
    }
    return res.json(goodResponse(payout));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getPayoutsByAgent = async (req, res) => {
  try {
    const payouts = await payoutService.getPayoutsByAgentId(req.params.agentId);
    return res.json(goodResponse(payouts, "Payouts retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getPayoutsByHost = async (req, res) => {
  try {
    const payouts = await payoutService.getPayoutsByHostId(req.params.hostId);
    return res.json(goodResponse(payouts, "Payouts retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const markAsPaid = async (req, res) => {
  try {
    const payout = await payoutService.markAsPaid(req.params.id);
    if (!payout) {
      return res.status(404).json(badResponse("Payout not found", 404));
    }
    return res.json(goodResponse(payout, "Payout marked as paid"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const updatePayout = async (req, res) => {
  try {
    const payout = await payoutService.updatePayout(req.params.id, req.body);
    if (!payout) {
      return res.status(404).json(badResponse("Payout not found", 404));
    }
    return res.json(goodResponse(payout, "Payout updated successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getPendingPayouts = async (req, res) => {
  try {
    const payouts = await payoutService.getPendingPayoutsForAgent(req.params.agentId);
    return res.json(goodResponse(payouts, "Pending payouts retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getTotalPending = async (req, res) => {
  try {
    const total = await payoutService.getTotalPendingForAgent(req.params.agentId);
    return res.json(goodResponse({ total }));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

module.exports = {
  createPayout,
  getPayoutById,
  getPayoutsByAgent,
  getPayoutsByHost,
  markAsPaid,
  updatePayout,
  getPendingPayouts,
  getTotalPending,
};
