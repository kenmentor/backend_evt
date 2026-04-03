const tourService = require("../service/tour-service");
const { response } = require("../utility");

const createTour = async (req, res) => {
  const Response = response;
  try {
    const tour = await tourService.createTour(req.body);
    Response.goodResponse.data = tour;
    Response.goodResponse.message = "Tour scheduled successfully";
    return res.status(201).json(Response.goodResponse);
  } catch (error) {
    console.error("Error creating tour:", error);
    Response.badResponse.message = error.message || "Failed to create tour";
    Response.badResponse.status = 400;
    return res.status(400).json(Response.badResponse);
  }
};

const getTourById = async (req, res) => {
  const Response = response;
  try {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      Response.badResponse.message = "Tour not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = tour;
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get tour";
    return res.status(500).json(Response.badResponse);
  }
};

const getToursByGuest = async (req, res) => {
  const Response = response;
  try {
    const tours = await tourService.getToursByGuestId(req.params.guestId);
    Response.goodResponse.data = tours;
    Response.goodResponse.message = "Tours retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get tours";
    return res.status(500).json(Response.badResponse);
  }
};

const getToursByHost = async (req, res) => {
  const Response = response;
  try {
    const tours = await tourService.getToursByHostId(req.params.hostId);
    Response.goodResponse.data = tours;
    Response.goodResponse.message = "Tours retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get tours";
    return res.status(500).json(Response.badResponse);
  }
};

const getToursByAgent = async (req, res) => {
  const Response = response;
  try {
    const tours = await tourService.getToursByAgentId(req.params.agentId);
    Response.goodResponse.data = tours;
    Response.goodResponse.message = "Tours retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get tours";
    return res.status(500).json(Response.badResponse);
  }
};

const getToursByProperty = async (req, res) => {
  const Response = response;
  try {
    const tours = await tourService.getToursByPropertyId(req.params.propertyId);
    Response.goodResponse.data = tours;
    Response.goodResponse.message = "Tours retrieved successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to get tours";
    return res.status(500).json(Response.badResponse);
  }
};

const updateTourStatus = async (req, res) => {
  const Response = response;
  try {
    const { status } = req.body;
    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      Response.badResponse.message = "Invalid status";
      Response.badResponse.status = 400;
      return res.status(400).json(Response.badResponse);
    }
    const tour = await tourService.updateTourStatus(req.params.id, status);
    if (!tour) {
      Response.badResponse.message = "Tour not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = tour;
    Response.goodResponse.message = "Tour status updated successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to update tour status";
    return res.status(500).json(Response.badResponse);
  }
};

const cancelTour = async (req, res) => {
  const Response = response;
  try {
    const tour = await tourService.cancelTour(req.params.id);
    if (!tour) {
      Response.badResponse.message = "Tour not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = tour;
    Response.goodResponse.message = "Tour cancelled successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to cancel tour";
    return res.status(500).json(Response.badResponse);
  }
};

const completeTour = async (req, res) => {
  const Response = response;
  try {
    const tour = await tourService.completeTour(req.params.id);
    if (!tour) {
      Response.badResponse.message = "Tour not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = tour;
    Response.goodResponse.message = "Tour completed successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to complete tour";
    return res.status(500).json(Response.badResponse);
  }
};

const deleteTour = async (req, res) => {
  const Response = response;
  try {
    const tour = await tourService.deleteTour(req.params.id);
    if (!tour) {
      Response.badResponse.message = "Tour not found";
      Response.badResponse.status = 404;
      return res.status(404).json(Response.badResponse);
    }
    Response.goodResponse.data = tour;
    Response.goodResponse.message = "Tour deleted successfully";
    return res.json(Response.goodResponse);
  } catch (error) {
    Response.badResponse.message = "Failed to delete tour";
    return res.status(500).json(Response.badResponse);
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
