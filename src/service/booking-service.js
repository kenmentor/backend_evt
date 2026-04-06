/**
 * Booking Service - Event Sourcing Version
 * 
 * Uses event sourcing for all booking operations.
 */

const { getRepos } = require("../event-sourcing");
const house_service = require("./house-service");

function getBookingRepo() {
  const { bookingEventRepo } = getRepos();
  return bookingEventRepo;
}

function getResourceRepo() {
  const { resourceEventRepo } = getRepos();
  return resourceEventRepo;
}

function getUserRepo() {
  const { userEventRepo } = getRepos();
  return userEventRepo;
}

function getPaymentRepo() {
  const { paymentEventRepo } = getRepos();
  return paymentEventRepo;
}

async function create_booking(object) {
  const bookingRepo = getBookingRepo();
  const resourceRepo = getResourceRepo();
  
  // Get the house details
  const house = await house_service.get_details(object.houseId);
  
  // Set house as unavailable
  await house_service.update_house(object.houseId, { avaliable: false });
  
  // Create booking via event sourcing
  const mongoose = require('mongoose');
  const bookingId = object.bookingId || new mongoose.Types.ObjectId().toString();
  
  await bookingRepo.create({
    _id: bookingId,
    host: object.hostId,
    guest: object.guestId,
    house: object.houseId,
    checkIn: object.checkIn,
    checkOut: object.checkOut,
    paymentId: object.paymentId,
    status: object.status || 'pending',
    amount: house.price,
    platformFee: object.platformFee || 0,
  });
  
  return await bookingRepo.findById(bookingId);
}

async function delete_booking(id) {
  const bookingRepo = getBookingRepo();
  
  // Soft delete via command
  await bookingRepo.commands.delete(id);
  await bookingRepo.handler.runOnce();
  
  return { deleted: true };
}

async function get_all_booking(id, role) {
  const bookingRepo = getBookingRepo();
  
  let filter = {};
  if (role === "guest") {
    filter = { guest: id };
  } else if (role === "host") {
    filter = { host: id };
  } else {
    return [];
  }
  
  const bookings = await bookingRepo.find(filter);
  
  // Populate related data
  return await populateBookings(bookings);
}

async function get_booking_details(object, role) {
  const bookingRepo = getBookingRepo();
  
  let filter = { _id: object.bookingId };
  if (role === "guest") {
    filter.guest = object.userId;
  } else if (role === "host") {
    filter.host = object.userId;
  } else {
    return {};
  }
  
  const booking = await bookingRepo.findOne(filter);
  
  if (!booking) return {};
  
  return await populateBooking(booking);
}

async function populateBooking(booking) {
  if (!booking) return booking;
  
  const userRepo = getUserRepo();
  const resourceRepo = getResourceRepo();
  const paymentRepo = getPaymentRepo();
  
  // Populate host
  if (booking.host) {
    const host = await userRepo.findById(booking.host);
    if (host) {
      booking.host = {
        _id: host._id,
        userName: host.userName,
        phoneNumber: host.phoneNumber,
        email: host.email,
        adminVerified: host.adminVerified,
        rank: host.rank,
        verificationCompleted: host.verificationCompleted,
        profileImage: host.profileImage,
      };
    }
  }
  
  // Populate guest
  if (booking.guest) {
    const guest = await userRepo.findById(booking.guest);
    if (guest) {
      booking.guest = {
        _id: guest._id,
        userName: guest.userName,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
      };
    }
  }
  
  // Populate house
  if (booking.house) {
    const house = await resourceRepo.findById(booking.house);
    if (house) {
      // Get host for house
      let houseHost = null;
      if (house.host) {
        const hostUser = await userRepo.findById(house.host);
        if (hostUser) {
          houseHost = {
            _id: hostUser._id,
            userName: hostUser.userName,
            phoneNumber: hostUser.phoneNumber,
            email: hostUser.email,
          };
        }
      }
      
      booking.house = {
        _id: house._id,
        title: house.title,
        address: house.address,
        state: house.state,
        type: house.type,
        description: house.description,
        host: houseHost,
      };
    }
  }
  
  // Populate payment
  if (booking.paymentId) {
    const payment = await paymentRepo.findById(booking.paymentId);
    if (payment) {
      booking.paymentId = {
        _id: payment._id,
        amount: payment.amount,
        refund: payment.refund,
        method: payment.method,
        transactionId: payment.transactionId,
        status: payment.status,
        paymentStatus: payment.paymentStatus,
      };
    }
  }
  
  return booking;
}

async function populateBookings(bookings) {
  const populated = [];
  for (const booking of bookings) {
    const p = await populateBooking(booking);
    populated.push(p);
  }
  return populated;
}

module.exports = {
  create_booking,
  delete_booking,
  get_all_booking,
  get_booking_details,
};
