import { Request, Response } from "express";
import payoutService from "../service/payout-service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

const createPayout = async (req: Request, res: Response) => {
  try {
    const payout = await payoutService.createPayout(req.body);
    return res.status(201).json(goodResponse(payout, "Payout created successfully"));
  } catch (error: any) {
    return res.status(400).json(badResponse(error.message || "Failed to create payout", 400));
  }
};

const getPayoutById = async (req: Request, res: Response) => {
  try {
    const payout = await payoutService.getPayoutById(req.params.id as string);
    if (!payout) {
      return res.status(404).json(badResponse("Payout not found", 404));
    }
    return res.json(goodResponse(payout));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getPayoutsByAgent = async (req: Request, res: Response) => {
  try {
    const payouts = await payoutService.getPayoutsByAgentId(req.params.agentId as string);
    return res.json(goodResponse(payouts, "Payouts retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getPayoutsByHost = async (req: Request, res: Response) => {
  try {
    const payouts = await payoutService.getPayoutsByHostId(req.params.hostId as string);
    return res.json(goodResponse(payouts, "Payouts retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const markAsPaid = async (req: Request, res: Response) => {
  try {
    const payout = await payoutService.markAsPaid(req.params.id as string);
    if (!payout) {
      return res.status(404).json(badResponse("Payout not found", 404));
    }
    return res.json(goodResponse(payout, "Payout marked as paid"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const updatePayout = async (req: Request, res: Response) => {
  try {
    const payout = await payoutService.updatePayout(req.params.id as string, req.body);
    if (!payout) {
      return res.status(404).json(badResponse("Payout not found", 404));
    }
    return res.json(goodResponse(payout, "Payout updated successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getPendingPayouts = async (req: Request, res: Response) => {
  try {
    const payouts = await payoutService.getPendingPayoutsForAgent(req.params.agentId as string);
    return res.json(goodResponse(payouts, "Pending payouts retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getTotalPending = async (req: Request, res: Response) => {
  try {
    const total = await payoutService.getTotalPendingForAgent(req.params.agentId as string);
    return res.json(goodResponse({ total }));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

export {
  createPayout,
  getPayoutById,
  getPayoutsByAgent,
  getPayoutsByHost,
  markAsPaid,
  updatePayout,
  getPendingPayouts,
  getTotalPending,
};
