const { booking_service } = require("../service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;

async function get_booking_details(req, res) {
  const role = req.query.role;
  const idObject = req.params;

  if (!(idObject.userId && idObject.bookingId)) {
    return res.status(400).json(badResponse("Booking id is required", 400));
  }
  try {
    const data = await booking_service.get_booking_details(idObject, role);
    return res.json(goodResponse(data));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function get_all_booking(req, res) {
  const role = req.query.role;
  try {
    const userId = req.params.userId;
    const data = await booking_service.get_all_booking(userId, role);
    const updatedBookings = data.map((b) => {
      const checkInDate = new Date(b.checkIn);
      const expired = b.expiredDate
        ? new Date(b.expiredDate)
        : new Date(checkInDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      return { ...b, expiredDate: expired.toISOString() };
    });
    return res.json(goodResponse(updatedBookings));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function create_booking(req, res) {
  const role = req.query.role;
  try {
    const bodyObject = req.body;
    const data = await booking_service.create_booking(bodyObject, role);
    return res.json(goodResponse(data, "Booking created successfully"));
  } catch (error) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

module.exports = {
  get_booking_details,
  get_all_booking,
  create_booking,
};
