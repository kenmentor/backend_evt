import { Request, Response } from "express";
import mongoose from "mongoose";
import { house_service } from "../service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

function populatehouse(query: any) {
  return query.populate({
    path: "host",
    select:
      "userName phoneNumber email adminVerified rank verificationCompleted profileImage role",
  });
}
const get_house_detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(badResponse("ID is required"));
    }
    const data = await house_service.get_details(id);
    return res.json(goodResponse(await populatehouse(data)));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};

async function get_house(req: Request, res: Response) {
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
      min: min ? parseInt(min as string) : undefined,
      max: max ? parseInt(max as string) : undefined,
      location: decodeURIComponent((searchWord as string) || ""),
      limit: limit ? parseInt(limit as string) : 50,
      lga,
      state,
      landmark,
      amenities: amenities ? (amenities as string).split(",") : undefined,
      category,
      id,
      hostId,
    });

    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function update_house_view(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const data = await house_service.update_house_view(id);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function upload_house(req: Request, res: Response) {
  try {
    const { files, body, user } = req as any;
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
  } catch (error: any) {
    console.error("=== UPLOAD HOUSE ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json(badResponse(error.message, 500, { message: error.message, stack: error.stack }));
  }
}
async function update_house(req: Request, res: Response) {
  try {
    const { body, params } = req;
    const id = params.id as string;
    if (body.price) {
      body.price = Number(body.price);
    }
    const data = await house_service.update_house(id, body);
    return res.json(goodResponse(data, "House updated successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function delete_house(req: Request, res: Response) {
  const id = req.body.id;
  const data = await (house_service as any).delete();
  return res.json(goodResponse(data));
}

export {
  upload_house,
  update_house_view,
  get_house,
  get_house_detail,
  update_house,
  delete_house,
};
