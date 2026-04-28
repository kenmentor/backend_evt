const tourService = require("../service/tour-service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

const createTour = async (req, res) => {
  try {
    const tour = await tourService.createTour(req.body);
    return res.status(201).json(goodResponse(tour, "Tour scheduled successfully"));
  } catch (error) {
    return res.status(400).json(badResponse(error.message || "Failed to create tour", 400));
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByGuest = async (req, res) => {
  try {
    const tours = await tourService.getToursByGuestId(req.params.guestId);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByHost = async (req, res) => {
  try {
    const tours = await tourService.getToursByHostId(req.params.hostId);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByAgent = async (req, res) => {
  try {
    const tours = await tourService.getToursByAgentId(req.params.agentId);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const getToursByProperty = async (req, res) => {
  try {
    const tours = await tourService.getToursByPropertyId(req.params.propertyId);
    return res.json(goodResponse(tours, "Tours retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const updateTourStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      return res.status(400).json(badResponse("Invalid status", 400));
    }
    const tour = await tourService.updateTourStatus(req.params.id, status);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour status updated successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const cancelTour = async (req, res) => {
  try {
    const tour = await tourService.cancelTour(req.params.id);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour cancelled successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const completeTour = async (req, res) => {
  try {
    const tour = await tourService.completeTour(req.params.id);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour completed successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const deleteTour = async (req, res) => {
  try {
    const tour = await tourService.deleteTour(req.params.id);
    if (!tour) {
      return res.status(404).json(badResponse("Tour not found", 404));
    }
    return res.json(goodResponse(tour, "Tour deleted successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

module.exports = {
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
