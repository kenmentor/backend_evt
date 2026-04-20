export type BookingEvt =
  | {
      type: 'bookingCreated';
      host: string;
      guest: string;
      house: string;
      amount: number;
      paymentId?: string;
      checkIn: string;
      checkOut: string;
      platformFee: number;
      performedBy?: string;
    }
  | {
      type: 'bookingConfirmed';
      performedBy?: string;
    }
  | {
      type: 'bookingCancelled';
      performedBy?: string;
    }
  | {
      type: 'bookingCompleted';
      performedBy?: string;
    }
  | {
      type: 'bookingExpired';
      performedBy?: string;
    }
  | {
      type: 'bookingPaymentUpdated';
      paymentId: string;
      performedBy?: string;
    }
  | {
      type: 'bookingDatesChanged';
      checkIn: string;
      checkOut: string;
      performedBy?: string;
    };

export type BookingAgg = {
  host: string;
  guest: string;
  house: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  paymentId: string;
  checkIn: string;
  checkOut: string;
  platformFee: number;
  expiredDate: Date;
};

export type BookingCmd =
  | {
      type: 'create';
      host: string;
      guest: string;
      house: string;
      amount: number;
      paymentId?: string;
      checkIn: string;
      checkOut: string;
      platformFee: number;
      performedBy?: string;
    }
  | {
      type: 'confirm';
      performedBy?: string;
    }
  | {
      type: 'cancel';
      performedBy?: string;
    }
  | {
      type: 'complete';
      performedBy?: string;
    }
  | {
      type: 'expire';
      performedBy?: string;
    }
  | {
      type: 'updatePayment';
      paymentId: string;
      performedBy?: string;
    }
  | {
      type: 'changeDates';
      checkIn: string;
      checkOut: string;
      performedBy?: string;
    };