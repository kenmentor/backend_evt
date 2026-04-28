import * as house_service from "./house-service";
import mongoose from "mongoose";
import { bookingCmd } from "../es/commands/booking";
import { queryBookings, queryUsers, queryResources, queryPayments } from "../es/queries";
import { projectionHandlers } from "../es/projection";

export async function create_booking(object: any) {
  const house = await house_service.get_details(object.houseId);

  await house_service.update_house(object.houseId, { avaliable: false });

  const bookingId = object.bookingId || new mongoose.Types.ObjectId().toString();

  await bookingCmd.create(bookingId, {
    host: object.hostId,
    guest: object.guestId,
    house: object.houseId,
    checkIn: object.checkIn,
    checkOut: object.checkOut,
    paymentId: object.paymentId,
    amount: (house as any).price,
    platformFee: object.platformFee || 0,
  });

  await projectionHandlers.bookings.runOnce();
  return await queryBookings.getByAggregateId(bookingId);
}

export async function delete_booking(id: string) {
  await bookingCmd.cancel(id, {});
  await projectionHandlers.bookings.runOnce();
  return { deleted: true };
}

export async function get_all_booking(id: string, role: string) {
  let bookings: any[] = [];
  if (role === "guest") {
    bookings = await queryBookings.getByGuest(id);
  } else if (role === "host") {
    bookings = await queryBookings.getByHost(id);
  } else {
    return [];
  }

  return await populateBookings(bookings);
}

export async function get_booking_details(object: any, role: string) {
  const booking = await queryBookings.getByAggregateId(object.bookingId);

  if (!booking) return {};
  if (role === "guest" && booking.guest !== object.userId) return {};
  if (role === "host" && booking.host !== object.userId) return {};

  return await populateBooking(booking);
}

async function populateBooking(booking: any) {
  if (!booking) return booking;

  if (booking.host) {
    const host = await queryUsers.getByAggregateId(booking.host);
    if (host) {
      booking.host = {
        _id: host.userId,
        userName: (host as any).userName,
        phoneNumber: (host as any).phoneNumber,
        email: (host as any).email,
        adminVerified: (host as any).adminVerified,
        rank: (host as any).rank,
        verificationCompleted: (host as any).verificationCompleted,
        profileImage: (host as any).profileImage,
      };
    }
  }

  if (booking.guest) {
    const guest = await queryUsers.getByAggregateId(booking.guest);
    if (guest) {
      booking.guest = {
        _id: guest.userId,
        userName: (guest as any).userName,
        phoneNumber: (guest as any).phoneNumber,
        email: (guest as any).email,
      };
    }
  }

  if (booking.house) {
    const house = await queryResources.getByAggregateId(booking.house);
    if (house) {
      let houseHost: any = null;
      if ((house as any).host) {
        const hostUser = await queryUsers.getByAggregateId((house as any).host);
        if (hostUser) {
          houseHost = {
            _id: hostUser.userId,
            userName: (hostUser as any).userName,
            phoneNumber: (hostUser as any).phoneNumber,
            email: (hostUser as any).email,
          };
        }
      }

      booking.house = {
        _id: house.resourceId,
        title: (house as any).title,
        address: (house as any).address,
        state: (house as any).state,
        houseType: (house as any).houseType,
        description: (house as any).description,
        host: houseHost,
      };
    }
  }

  if (booking.paymentId) {
    const payment = await queryPayments.getByAggregateId(booking.paymentId);
    if (payment) {
      booking.paymentId = {
        _id: payment.paymentId,
        amount: (payment as any).amount,
        refund: (payment as any).refund,
        method: (payment as any).method,
        transactionId: (payment as any).transactionRef,
        status: (payment as any).status,
      };
    }
  }

  return booking;
}

async function populateBookings(bookings: any[]) {
  const populated: any[] = [];
  for (const booking of bookings) {
    const p = await populateBooking(booking);
    populated.push(p);
  }
  return populated;
}
