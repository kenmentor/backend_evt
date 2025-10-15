const { booking_repo } = require("../repositories");
const { bookingDB } = require("../modules");
const house_service = require("./house-service");
const Booking_repo = new booking_repo(bookingDB);

//////////////////////// CREATE BOOKING ////////////////////////
async function create_booking(object) {
  // Get the house details (for price, etc.)
  const house = await house_service.get_details(object.houseId);

  const data = await Booking_repo.create({
    host: object.hostId,
    guest: object.guestId,
    house: object.houseId,
    checkIn: object.checkIn,
    checkOut: object.checkOut,
    paymentId: object.paymentId,
    status: object.status,
    amount: house.price,
  });

  return data;
}

//////////////////////// DELETE BOOKING ////////////////////////
function delete_booking(id) {
  return Booking_repo.delete(Object(id));
}

//////////////////////// POPULATE COMMON FIELDS ////////////////////////
function populateBooking(query) {
  return query
    .populate({
      path: "host",
      select:
        "userName phoneNumber email adminVerified rank verificationCompleted profileImage",
    })
    .populate({
      path: "guest",
      select: "userName phoneNumber email",
    })
    .populate({
      path: "house",
      select: "title address state type description host",
      populate: {
        path: "host",
        select: "userName phoneNumber email", // Get host details too
      },
    })
    .populate({
      path: "paymentId",
      select:
        "amount refund lateFee totalAmount method transactionId status paymentStatus",
    });
}

//////////////////////// GET ALL BOOKINGS ////////////////////////
function get_all_booking(id, role) {
  let filter = {};
  if (role === "guest") filter = { guest: Object(id) };
  else if (role === "host") filter = { host: Object(id) };
  else return [];

  const query = Booking_repo.find(filter);
  return populateBooking(query);
}

//////////////////////// GET SINGLE BOOKING ////////////////////////
function get_booking_details(object, role) {
  let filter = {};
  if (role === "guest") {
    filter = { _id: object.bookingId, guest: object.userId };
  } else if (role === "host") {
    filter = { _id: object.bookingId, host: object.userId };
  } else {
    return {};
  }

  const query = Booking_repo.findOne(filter);
  return populateBooking(query);
}

module.exports = {
  create_booking,
  delete_booking,
  get_all_booking,
  get_booking_details,
};
