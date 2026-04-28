import { Request, Response } from "express";
import { booking_service } from "../service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

async function get_booking_details(req: Request, res: Response) {
  const role = req.query.role as string;
  const idObject = req.params;

  if (!(idObject.userId && idObject.bookingId)) {
    return res.status(400).json(badResponse("Booking id is required", 400));
  }
  try {
    const data = await booking_service.get_booking_details(idObject, role);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function get_all_booking(req: Request, res: Response) {
  const role = req.query.role as string;
  try {
    const userId = req.params.userId as string;
    const data = await booking_service.get_all_booking(userId, role);
    const updatedBookings = data.map((b: any) => {
      const checkInDate = new Date(b.checkIn);
      const expired = b.expiredDate
        ? new Date(b.expiredDate)
        : new Date(checkInDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      return { ...b, expiredDate: expired.toISOString() };
    });
    return res.json(goodResponse(updatedBookings));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function create_booking(req: Request, res: Response) {
  try {
    const bodyObject = req.body;
    const data = await booking_service.create_booking(bodyObject);
    return res.json(goodResponse(data, "Booking created successfully"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

export {
  get_booking_details,
  get_all_booking,
  create_booking,
};
