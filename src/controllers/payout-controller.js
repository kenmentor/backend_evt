const payoutService = require("../service/payout-service");
const { response } = require("../utility");

const createPayout = async (req, res) => {
  const Response = response;
  try {
    const payout = await payoutService.createPayout(req.body);
    Response.goodResponse.data = payout;
    Response.goodResponse.message = "Payout created successfully";
    return res.status(201).json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = error.message || "Failed to create payout";
    Response.badResponse.status = 400;
    return res.status(400).json(Response.badResponse);
  }
};

const getPayoutById = async (req, res) => {
  const Response = response;
  try {
    const payout = await payoutService.getPayoutById(req.params.id);
    if (!payout) {
      Response.badResponse.message = "Payout not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = payout;
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get payout";
    return res.status(500).json(Response.badResponse);
  }
};

const getPayoutsByAgent = async (req, res) => {
  const Response = response;
  try {
    const payouts = await payoutService.getPayoutsByAgentId(req.params.agentId);
    Response.goodResponse.data = payouts;
    Response.goodResponse.message = "Payouts retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get payouts";
    return res.status(500).json(Response.badResponse);
  }
};

const getPayoutsByHost = async (req, res) => {
  const Response = response;
  try {
    const payouts = await payoutService.getPayoutsByHostId(req.params.hostId);
    Response.goodResponse.data = payouts;
    Response.goodResponse.message = "Payouts retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get payouts";
    return res.status(500).json(Response.badResponse);
  }
};

const markAsPaid = async (req, res) => {
  const Response = response;
  try {
    const payout = await payoutService.markAsPaid(req.params.id);
    if (!payout) {
      Response.badResponse.message = "Payout not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = payout;
    Response.goodResponse.message = "Payout marked as paid";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to mark payout as paid";
    return res.status(500).json(Response.badResponse);
  }
};

const updatePayout = async (req, res) => {
  const Response = response;
  try {
    const payout = await payoutService.updatePayout(req.params.id, req.body);
    if (!payout) {
      Response.badResponse.message = "Payout not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = payout;
    Response.goodResponse.message = "Payout updated successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to update payout";
    return res.status(500).json(Response.badResponse);
  }
};

const getPendingPayouts = async (req, res) => {
  const Response = response;
  try {
    const payouts = await payoutService.getPendingPayoutsForAgent(req.params.agentId);
    Response.goodResponse.data = payouts;
    Response.goodResponse.message = "Pending payouts retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get pending payouts";
    return res.status(500).json(Response.badResponse);
  }
};

const getTotalPending = async (req, res) => {
  const Response = response;
  try {
    const total = await payoutService.getTotalPendingForAgent(req.params.agentId);
    Response.goodResponse.data = { total };
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get total pending";
    return res.status(500).json(Response.badResponse);
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
