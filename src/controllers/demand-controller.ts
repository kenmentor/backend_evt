import { Request, Response } from "express";
import { demand_service } from "../service/";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

const get_demand_detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(badResponse("ID is required", 400));
    }
    const data = await demand_service.get_details(id);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
};
async function get_demand(req: Request, res: Response) {
  const { min, max, searchWord, lga, state, amenities, category } = req.query;

  try {
    const data = await demand_service.find_demand({
      min: min ? parseInt(min as string) : undefined,
      max: max ? parseInt(max as string) : undefined,
      location: decodeURIComponent((searchWord as string) || ""),
      lga,
      state,
      amenities: amenities ? (amenities as string).split(",") : undefined,
      category,
    });

    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function update_demand_view(req: Request, res: Response) {
  const id = req.body.id;
  try {
    const data = await demand_service.update_demand_view(id);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function upload_demand(req: Request, res: Response) {
  try {
    const { body } = req;
    const data = await demand_service.upload_demand(body);
    return res.json(goodResponse(data, "Demand uploaded successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function update_demand(req: Request, res: Response) {
  try {
    const { files, body } = req as any;
    const data = demand_service.update_demand({ files, body });
    return res.json(goodResponse(data, "Demand updated successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function delete_demand(req: Request, res: Response) {
  const id = req.body.id;
  const data = await (demand_service as any).delete();
  return res.json(goodResponse(data));
}

export {
  upload_demand,
  update_demand_view,
  get_demand,
  get_demand_detail,
  update_demand,
  delete_demand,
};
