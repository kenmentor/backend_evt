const { house_service } = require("../service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

function populatehouse(query) {
  return query.populate({
    path: "host",
    select:
      "userName phoneNumber email adminVerified rank verificationCompleted profileImage role",
  });
}
const get_house_detail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json(badResponse("ID is required"));
    }
    const data = await house_service.get_details(id);
    return res.json(goodResponse(await populatehouse(data)));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

async function get_house(req, res) {
  const mongoose = require("mongoose");
  const {
    type,
    min,
    max,
    searchWord,
    limit,
    lga,
    state,
    id,
    hostId,
    landmark,
    amenities,
    category,
  } = req.query;

  try {
    const data = await house_service.find_house({
      type,
      min: min ? parseInt(min) : undefined,
      max: max ? parseInt(max) : undefined,
      location: decodeURIComponent(searchWord || ""),
      limit: limit ? parseInt(limit) : 50,
      lga,
      state,
      landmark,
      amenities: amenities ? amenities.split(",") : undefined,
      category,
      id,
      hostId,
    });

    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function update_house_view(req, res) {
  const id = req.params.id;
  try {
    const data = await house_service.update_house_view(id);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function upload_house(req, res) {
  try {
    const { files, body, user } = req;
    const userId = user?.id;
    if (!userId) {
      return res.status(401).json(badResponse("Authentication required", 401));
    }
    console.log("=== UPLOAD HOUSE CONTROLLER ===");
    console.log("User ID:", userId);
    console.log("Files received:", files ? Object.keys(files) : "none");
    console.log("Body fields:", Object.keys(body));
    const data = await house_service.upload_house(files, body, userId);
    return res.json(goodResponse(data, "House uploaded successfully"));
  } catch (error) {
    console.error("=== UPLOAD HOUSE ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json(badResponse(error.message, 500, { message: error.message, stack: error.stack }));
  }
}
async function update_house(req, res) {
  try {
    const { body, params } = req;
    const { id } = params;
    if (body.price) {
      body.price = Number(body.price);
    }
    const data = await house_service.update_house(id, body);
    return res.json(goodResponse(data, "House updated successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function delete_house(req, res) {
  const id = req.body.id;
  const data = await user_service.delete();
  return res.json(goodResponse(data));
}

module.exports = {
  upload_house,
  update_house_view,
  get_house,
  get_house_detail,
  update_house,
  delete_house,
};
