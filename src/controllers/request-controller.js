const { requst_service } = require("../service");

const { response } = require("../utility");

const create_request = async (req, res) => {
  const Response = response;
  const body = req.body;
  try {
    const already = await requst_service.alreadyExit({
      host: body.hostId,
      guest: body.guestId,
      house: body.houseId,
    });
    console.log(already, "hello");
    const bookingSelf = body.hostId === body.guestId;
    if (!already && bookingSelf) {
      const data = await requst_service.create_request({
        hostId: body.hostId,
        guestId: body.guestId,
        houseId: body.houseId,
      });
      Response.goodResponse.data = data;
      Response.goodResponse.message = "usesfully created request ";
      console.log("passed");
      return res.json(Response.goodResponse);
    }
    if (already) {
      Response.badResponse.message = "you have already sent a request ";
      Response.badResponse.status = 401;
      return res.status(401).json(Response.badResponse);
    }
    Response.badResponse.message = "you cant book you house  ";
    Response.badResponse.status = 401;
    return res.status(401).json(Response.badResponse);
  } catch (error) {
    return res.json(Response.badResponse);
  }
};
const delete_request = async (req, res) => {
  const request_id = await req.params.requestId;
  const Response = response;
  try {
    data = await requst_service.delete_request(request_id);
    Response.goodResponse.data = data;
    Response.goodResponse.message = "usesfully created request ";
    return res.json(Response.goodResponse);
  } catch (error) {
    return res.json(Response.badResponse);
  }
};
const update_request = async (req, res) => {
  const Response = response;
  const { requestId } = req.params;
  const { status } = req.query;
  try {
    console.log({ accepted: status === "1", req: req.query.status });
    const data = await requst_service.update_request(requestId, {
      accepted: status === "1",
    });
    const responseObj = (Response.goodResponse.data = data);
    Response.goodResponse.message = "usesfully created request ";
    return res.json(Response.goodResponse);
  } catch (error) {
    return res.json(Response.badResponse);
  }
};
const get_request_details = async (req, res) => {
  const Response = response;
  const requestId = await req.params.id;
  try {
    const data = await requst_service.get_request_details(requestId);
    Response.goodResponse.data = data;
    Response.goodResponse.message = "usesfully created request ";
    return res.json(Response.goodResponse);
  } catch (error) {
    return res.json(Response.badResponse);
  }
};

const get_all_request = async (req, res) => {
  const Response = response;

  const userId = await req.params.userId;
  const role = await req.query.role;
  console.log(userId, role);
  try {
    const data = await requst_service.get_all_request(userId, role);

    Response.goodResponse.message = "usesfully retrived request list  ";
    Response.goodResponse.data = data;
    return res.json(Response.goodResponse);
  } catch (error) {
    return res.json(Response.badResponse);
  }
};

module.exports = {
  create_request: create_request,
  update_request: update_request,
  delete_request: delete_request,
  get_request_details: get_request_details,
  get_all_request: get_all_request,
};
