const { demand_service } = require("../service/");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

const get_demand_detail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json(badResponse("ID is required", 400));
    }
    const data = await demand_service.get_details(id);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};
async function get_demand(req, res) {
  const { min, max, searchWord, lga, state, amenities, category } = req.query;

  try {
    const data = await demand_service.find_demand({
      min: min ? parseInt(min) : undefined,
      max: max ? parseInt(max) : undefined,
      location: decodeURIComponent(searchWord || ""),
      lga,
      state,
      amenities: amenities ? amenities.split(",") : undefined,
      category,
    });

    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function update_demand_view(req, res) {
  const id = req.body.id;
  try {
    const data = await demand_service.update_demand_view(id);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function upload_demand(req, res) {
  try {
    const { body } = req;
    const data = await demand_service.upload_demand(body);
    return res.json(goodResponse(data, "Demand uploaded successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function update_demand(req, res) {
  try {
    const { files, body } = req;
    const data = demand_service.update_demand({ files, body });
    return res.json(goodResponse(data, "Demand updated successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function delete_demand(req, res) {
  const id = req.body.id;
  const data = await user_service.delete();
  return res.json(goodResponse(data));
}

module.exports = {
  upload_demand,
  update_demand_view,
  get_demand,
  get_demand_detail,
  update_demand,
  delete_demand,
};
