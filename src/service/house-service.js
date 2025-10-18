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
  body.thumbnail = thumbnailUrl;
  body.video = video;
  body.images = images;
  body.electricity = Number(body.electricity);
  body.price = Number(body.price);
  body.electricity = Number(body.electricity);
  body.bedroom = Number(body.bedroom);
  body.bathroom = Number(body.bathroom);
  body.area = Number(body.area);
  body.floor = Number(body.floor);
  body.totalFloors = Number(body.totalFloors);
  body.age = Number(body.age[0]);
  body.waterSuply = Boolean(body.waterSuply);

  console.log(
    body.bedroom,
    body.bathrooms,
    body.area,
    body.floor,
    body.totalFloors,
    body.age
  );

  // body.host = Object(body.host);
  console.log("Final body to be saved:", body);
  const data = await newcrudRepositoryExtra.create(body);
  console.log("Saved data:", data);
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
