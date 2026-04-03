const { resourceDB } = require("../modules");
const { house_repository, crudRepository } = require("../repositories");
const { connectDB } = require("../utility");
const { v2: cloudinary } = require("cloudinary");

require("dotenv").config();

const newcrudRepositoryExtra = new house_repository(resourceDB);

async function find_house(object) {
  await connectDB();
  return newcrudRepositoryExtra.filter(object);
}

async function update_house(id, object) {
  return newcrudRepositoryExtra.update(id, object);
}

async function get_details(id) {
  return newcrudRepositoryExtra.getDetail(id);
}

async function update_house_view(id) {
  try {
    const data = await newcrudRepositoryExtra.update(
      id,
      { $inc: { view: 1 } },
      { new: true }
    );
    return { views: data };
  } catch (err) {
    console.error("Error while updating house view:", err);
    throw err;
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function upload_house(files, body, userId) {
  await connectDB();
  console.log("=== UPLOAD HOUSE SERVICE ===");
  console.log("User ID from middleware:", userId);
  console.log("Files:", files);
  console.log("Body:", body);

  if (!userId) {
    throw new Error("User not authenticated");
  }

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

  const houseData = {
    ...body,
    thumbnail: thumbnailUrl,
    video: video,
    images: images,
    price: Number(body.price),
    bedroom: Number(body.bedroom),
    bathroom: Number(body.bathroom),
    host: userId,
  };

  if (!houseData.thumbnail && images.length > 0) {
    houseData.thumbnail = images[0].url;
  }

  console.log("Final house data to be saved:", houseData);
  
  const data = await newcrudRepositoryExtra.create(houseData);
  console.log("Saved data:", data);
  return data;
}

module.exports = {
  find_house,
  update_house_view,
  upload_house,
  get_details,
  update_house,
};
