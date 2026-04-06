/**
 * House Service - Event Sourcing Version
 * 
 * Uses event sourcing for resource/house operations.
 */

const { getRepos } = require("../event-sourcing");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getResourceRepo() {
  const { resourceEventRepo } = getRepos();
  return resourceEventRepo;
}

async function find_house(object) {
  const repo = getResourceRepo();
  
  // Handle filter cases
  if (object.role) {
    return await repo.find({ role: object.role });
  }
  if (object.location) {
    // For regex search, return all and filter in memory for now
    const all = await repo.findAll();
    return all.filter(h => h.location && h.location.includes(object.location));
  }
  if (object.state) {
    return await repo.find({ state: object.state });
  }
  if (object.category) {
    return await repo.find({ category: object.category });
  }
  
  return await repo.findAll();
}

async function update_house(id, object) {
  const repo = getResourceRepo();
  
  // Handle different update fields
  if (object.avaliable !== undefined) {
    await repo.commands.setAvailability(id, { avaliable: object.avaliable });
    await repo.handler.runOnce();
  }
  
  if (object.price) {
    await repo.commands.updatePrice(id, { price: object.price });
    await repo.handler.runOnce();
  }
  
  return await repo.findById(id);
}

async function get_details(id) {
  const repo = getResourceRepo();
  return await repo.findById(id);
}

async function update_house_view(id) {
  try {
    const repo = getResourceRepo();
    await repo.commands.recordView(id);
    await repo.handler.runOnce();
    const house = await repo.findById(id);
    return { views: house ? house.views : 0 };
  } catch (err) {
    console.error("Error while updating house view:", err);
    throw err;
  }
}

async function upload_house(files, body, userId) {
  console.log("=== UPLOAD HOUSE SERVICE ===");
  console.log("User ID from middleware:", userId);
  console.log("Files:", files);
  console.log("Body:", body);

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const repo = getResourceRepo();

  const uploadBufferToCloudinary = (fileBuffer, folder = "default") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          timeout: 600000,
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(fileBuffer);
    });
  };

  let thumbnailUrl = "";
  if (files.thumbnail?.length > 0) {
    const result = await uploadBufferToCloudinary(
      files.thumbnail[0].buffer,
      "thumbnails"
    );
    thumbnailUrl = result.secure_url;
  }
  
  let video = "";
  if (files.video?.length > 0) {
    const result = await uploadBufferToCloudinary(
      files.video[0].buffer,
      "video"
    );
    video = result.secure_url;
  }

  let images = [];
  if (files.files?.length > 0) {
    images = await Promise.all(
      files.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, "images").then((result) => ({
          url: result.secure_url,
          type: file.mimetype,
        }))
      )
    );
  }

  console.log("Uploaded URLs:", { thumbnailUrl, video, images });

  const mongoose = require('mongoose');
  const houseId = new mongoose.Types.ObjectId().toString();

  // Create house via event sourcing
  data = await repo.create({
    _id: houseId,
    host: userId,
    title: body.title,
    description: body.description,
    type: body.type,
    category: body.category,
    price: body.price,
    address: body.address,
    state: body.state,
    lga: body.lga,
    location: body.location,
    bedrooms: Number(body.bedroom) || 1,
    bathrooms: Number(body.bathroom) || 1,
    furnishing: body.furnishing,
    amenities: body.amenities ,
    images: images,
    thumbnail: thumbnailUrl || images[0]?.url,
    video: video,
  });

  console.log("House created with ID:", houseId);
  return await repo.findById(houseId);
}

module.exports = {
  find_house,
  update_house_view,
  upload_house,
  get_details,
  update_house,
};
