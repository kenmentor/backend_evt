import { Request, Response } from "express";
import tourService from "../service/tour-service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

const createTour = async (req: Request, res: Response) => {
  try {
    const tour = await tourService.createTour(req.body);
    return res.status(201).json(goodResponse(tour, "Tour scheduled successfully"));
  } catch (error: any) {
    return res.status(400).json(badResponse(error.message || "Failed to create tour", 400));
  }
};

const getTourById = async (req: Request, res: Response) => {
  try {
    const tour = await tourService.getTourById(req.params.id as string);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByGuest = async (req: Request, res: Response) => {
  try {
    const tours = await tourService.getToursByGuestId(req.params.guestId as string);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByHost = async (req: Request, res: Response) => {
  try {
    const tours = await tourService.getToursByHostId(req.params.hostId as string);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByAgent = async (req: Request, res: Response) => {
  try {
    const tours = await tourService.getToursByAgentId(req.params.agentId as string);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByProperty = async (req: Request, res: Response) => {
  try {
    const tours = await tourService.getToursByPropertyId(req.params.propertyId as string);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const updateTourStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      return res.status(400).json(badResponse("Invalid status", 400));
    }
    const tour = await tourService.updateTourStatus(req.params.id as string, status);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour status updated successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const cancelTour = async (req: Request, res: Response) => {
  try {
    const tour = await tourService.cancelTour(req.params.id as string);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour cancelled successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const completeTour = async (req: Request, res: Response) => {
  try {
    const tour = await tourService.completeTour(req.params.id as string);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour completed successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const deleteTour = async (req: Request, res: Response) => {
  try {
    const tour = await tourService.deleteTour(req.params.id as string);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour deleted successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

export {
  createTour,
  getTourById,
  getToursByGuest,
  getToursByHost,
  getToursByAgent,
  getToursByProperty,
  updateTourStatus,
  cancelTour,
  completeTour,
  deleteTour,
};
