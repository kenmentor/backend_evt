const { requst_service } = require("../service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

const create_request = async (req, res) => {
  const body = req.body;
  try {
    const already = await requst_service.alreadyExit({
      host: body.hostId,
      guest: body.guestId,
      house: body.houseId,
    });
    const bookingSelf = body.hostId === body.guestId;
    if (!already && bookingSelf) {
      const data = await requst_service.create_request({
        hostId: body.hostId,
        guestId: body.guestId,
        houseId: body.houseId,
      });
      return res.json(goodResponse(data, "Request created successfully"));
    }
    if (already) {
      return res.status(401).json(badResponse("You have already sent a request", 401));
    }
    return res.status(401).json(badResponse("You can't book your own house", 401));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};
const delete_request = async (req, res) => {
  const request_id = req.params.requestId;
  try {
    const data = await requst_service.delete_request(request_id);
    return res.json(goodResponse(data, "Request deleted successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};
const update_request = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.query;
  try {
    const data = await requst_service.update_request(requestId, {
      accepted: status === "1",
    });
    return res.json(goodResponse(data, "Request updated successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};
const get_request_details = async (req, res) => {
  const requestId = req.params.id;
  try {
    const data = await requst_service.get_request_details(requestId);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

const get_all_request = async (req, res) => {
  const userId = req.params.userId;
  const role = req.query.role;
  try {
    const data = await requst_service.get_all_request(userId, role);
    return res.json(goodResponse(data, "Request list retrieved successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

module.exports = {
  create_request: create_request,
  update_request: update_request,
  delete_request: delete_request,
  get_request_details: get_request_details,
  get_all_request: get_all_request,
};
