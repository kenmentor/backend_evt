import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { resourceCmd } from "../es/commands/resource";
import { queryResources } from "../es/queries";
import { projectionHandlers } from "../es/projection";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function find_house(object: any) {
  if (object.role) {
    const all = await queryResources.getAll();
    return all.filter((h: any) => (h as any).role === object.role);
  }
  if (object.location) {
    const all = await queryResources.getAll();
    return all.filter((h: any) => h.location && h.location.includes(object.location));
  }
  if (object.state) {
    return await queryResources.getByState(object.state);
  }
  if (object.category) {
    return await queryResources.getByCategory(object.category);
  }
  return await queryResources.getAll();
}

export async function update_house(id: string, object: any) {
  if (object.avaliable !== undefined) {
    await resourceCmd.setAvailability(id, { avaliable: object.avaliable });
    await projectionHandlers.resources.runOnce();
  }

  if (object.price) {
    await resourceCmd.updatePrice(id, { price: object.price });
    await projectionHandlers.resources.runOnce();
  }

  return await queryResources.getByAggregateId(id);
}

export async function get_details(id: string) {
  return await queryResources.getByAggregateId(id);
}

export async function update_house_view(id: string) {
  try {
    await resourceCmd.recordView(id, {});
    await projectionHandlers.resources.runOnce();
    const house = await queryResources.getByAggregateId(id);
    return { views: house ? house.views : 0 };
  } catch (err) {
    console.error("Error while updating house view:", err);
    throw err;
  }
}

export async function upload_house(files: any, body: any, userId: string) {
  console.log("=== UPLOAD HOUSE SERVICE ===");
  console.log("User ID from middleware:", userId);
  console.log("Files:", files);
  console.log("Body:", body);

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const uploadBufferToCloudinary = (fileBuffer: Buffer, folder: string = "default"): Promise<any> => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          timeout: 600000,
        },
        (error: any, result: any) => {
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

  let images: any[] = [];
  if (files.files?.length > 0) {
    images = await Promise.all(
      files.files.map((file: any) =>
        uploadBufferToCloudinary(file.buffer, "images").then((result: any) => ({
          url: result.secure_url,
          type: file.mimetype,
        }))
      )
    );
  }

  console.log("Uploaded URLs:", { thumbnailUrl, video, images });

  const houseId = new mongoose.Types.ObjectId().toString();

  await resourceCmd.create(houseId, {
    host: userId,
    title: body.title,
    description: body.description,
    houseType: body.type,
    category: body.category,
    price: body.price || '',
    address: body.address || '',
    state: body.state || '',
    lga: body.lga || '',
    location: body.location || '',
    bedrooms: Number(body.bedroom) || 1,
    bathrooms: Number(body.bathroom) || 1,
    furnishing: body.furnishing || '',
    amenities: body.amenities || [],
    images: images,
    thumbnail: thumbnailUrl || images[0]?.url,
    video: video,
  });

  console.log("House created with ID:", houseId);
  await projectionHandlers.resources.runOnce();
  return await queryResources.getByAggregateId(houseId);
}
