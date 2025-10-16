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

// const cloudinary = require("cloudinary").v2;

// const resourceDB = require("../models/resource");
// const connectDB = require("../config/db");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : null,
  } // Hide secret in log
);
async function upload_house(files, body) {
  await connectDB();
  console.log("UPLOAD SERVICE ");
  console.log(files);
  console.log(body);
  const uploadBufferToCloudinary = (fileBuffer, folder = "default") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          timeout: 600000, // 10 minutes
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
      files.thumbnail[0].buffer,
      "video"
    );
    video = result.secure_url;
  }

  let gallery = [];
  if (files.files?.length > 0) {
    gallery = await Promise.all(
      files.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, "gallery").then((result) => ({
          url: result.secure_url,
          type: file.mimetype,
        }))
      )
    );
  }

  body.thumbnail = thumbnailUrl;
  body.video = video;
  body.gallery = gallery;
  body.electricity = Number(body.electricity);
  body.price = Number(body.price);
  body.electricity = Number(body.electricity);
  body.bedrooms = Number(body.bedrooms);
  body.bathrooms = Number(body.bathrooms);
  body.area = Number(body.area);
  body.floor = Number(body.floor);
  body.totalFloors = Number(body.totalFloors);

  body.waterSuply = Boolean(body.waterSuply);
  // body.host = Object(body.host);

  const data = await newcrudRepositoryExtra.create(body);
  await data.save();
  return data;
}

module.exports = {
  find_house,
  update_house_view,
  upload_house,
  get_details,
  update_house,
};
