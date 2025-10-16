const { house_service } = require("../service");
const { response } = require("../utility");

function populatehouse(query) {
  return query.populate({
    path: "host",
    select:
      "userName phoneNumber email adminVerified rank verificationCompleted profileImage",
  });
}
const get_house_detail = async (req, res) => {
  console.log();
  try {
    const { id } = req.params;
    if (!id) {
      const responseData = response.badResponse;
      responseData.message = "ID required";
      return res.json(responseData).status(200);
    }
    console.log(id, "this id jbfyfyuf by");
    const data = await house_service.get_details(id); // ✅ Pass correct ID
    const responseData = response.goodResponse;
    responseData.data = await populatehouse(data);
    console.log(responseData, "response data");
    res.json(responseData).status(200);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Failed to fetch resource" }); // ✅ Send error response
  }
};
async function get_house(req, res) {
  console.log("Incoming query params:", req.query);

  // Destructure based on keyword interface (include new fields)
  const {
    type,
    min,
    max,
    searchWord,
    limit,
    lga,
    state,
    landmark,
    amenities, // ✅ new
    category, // ✅ new
  } = req.query;

  try {
    const data = await house_service.find_house({
      type,
      min: min ? parseInt(min) : undefined,
      max: max ? parseInt(max) : undefined,
      location: decodeURIComponent(searchWord || ""), // matches frontend
      limit: limit ? parseInt(limit) : 50,
      lga,
      state,
      landmark,
      amenities: amenities ? amenities.split(",") : undefined, // ✅ handle multiple
      category, // ✅ optional filter
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

async function update_house_view(req, res) {
  console.log("commmmmmmmmm");
  const id = await req.params.id;
  try {
    const data = await house_service.update_house_view(id);
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

async function upload_house(req, res) {
  try {
    const { files, body } = req;

    console.log(body, "fjbbjbjbjjb");

    const data = await house_service.upload_house(files, body);

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
async function update_house(req, res) {
  try {
    const { body, params } = req;
    const { id } = params;

    if (body.price) {
      body.price = Number(body.price);
    }

    const data = await house_service.update_house(id, body);

    const responseData = {
      ...response.goodResponse,
      data,
    };

    res.json(responseData);
  } catch (err) {
    console.error("Update house error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update house",
      error: err.message,
    });
  }
}

async function delete_house(req, res) {
  console.log("commmmmmmmmm");
  const id = await req.body.id;
  const data = await user_service.delete();
  const responseData = response.goodResponse;
  responseData.data = data;
  res.json(responseData);
}

module.exports = {
  upload_house,
  update_house_view,
  get_house,
  get_house_detail,
  update_house,
  delete_house,
};
