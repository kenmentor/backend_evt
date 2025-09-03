const { demand_service } = require("../service/");
const { response } = require("../utility");

const get_demand_detail = async (req, res) => {
  console.log("commmmmmmmmm");
  try {
    const { id } = req.params;
    if (!id) {
      const responseData = response.badResponse;
      responseData.message = "ID required";
      return res.json(responseData).status(200);
    }
    console.log(id, "this id jbfyfyuf by");
    const data = await demand_service.get_details(id); // ✅ Pass correct ID
    const responseData = response.goodResponse;
    responseData.data = data;
    res.json(responseData).status(200);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Failed to fetch resource" }); // ✅ Send error response
  }
};
async function get_demand(req, res) {
  console.log("Incoming query params:", req.query);

  // Destructure based on keyword interface (include new fields)
  const { min, max, searchWord, lga, state, amenities, category } = req.query;

  try {
    const data = await demand_service.find_demand({
      min: min ? parseInt(min) : undefined,
      max: max ? parseInt(max) : undefined,
      location: decodeURIComponent(searchWord || ""), // matches frontend

      lga,
      state,
      amenities: amenities ? amenities.split(",") : undefined, // ✅ handle multiple
      category,
    });

    const responseData = response.goodResponse;
    responseData.data = data;
    return res.status(200).json(responseData);
  } catch (error) {
    const responseData = response.badResponse;
    console.error("Error fetching data from DB:", error);
    res.status(500).json(responseData);
  }
}

async function update_demand_view(req, res) {
  const id = await req.body.id;
  try {
    const data = await demand_service.update_demand_view(id);
    const responseData = response.goodResponse;
    responseData.data = data;
    res.json(responseData);
  } catch (erro) {
    const responseData = response.badResponse;
    res.json(responseData);
    console.log("erro happen while updating view ");
    throw erro;
  }
}

async function upload_demand(req, res) {
  try {
    const { body } = req;

    const data = await demand_service.upload_demand(body);

    res.status(200).json({
      status: true,
      message: "House uploaded successfully",
      data,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}

async function update_demand(req, res) {
  try {
    const { files, body } = req;
    console.log("files", files);
    console.log("body", body);
    const data = demand_service.update_demand({ files, body });
    const responseData = response.goodResponse;
    res.json(responseData);
  } catch (err) {
    throw err;
  }
}
async function delete_demand(req, res) {
  console.log("commmmmmmmmm");
  const id = await req.body.id;
  const data = await user_service.delete();
  const responseData = response.goodResponse;
  responseData.data = data;
  res.json(responseData);
}

module.exports = {
  upload_demand,
  update_demand_view,
  get_demand,
  get_demand_detail,
  update_demand,
  delete_demand,
};
