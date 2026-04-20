export type RequestEvt =
  | {
      type: 'requestCreated';
      guest: string;
      host: string;
      house: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      totalPrice: number;
      note?: string;
      performedBy?: string;
    }
  | {
      type: 'requestApproved';
      performedBy?: string;
    }
  | {
      type: 'requestRejected';
      reason?: string;
      performedBy?: string;
    }
  | {
      type: 'requestCancelled';
      performedBy?: string;
    };

export type RequestAgg = {
  guest: string;
  host: string;
  house: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  note: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
};

export type RequestCmd =
  | {
      type: 'create';
      guest: string;
      host: string;
      house: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      totalPrice: number;
      note?: string;
      performedBy?: string;
    }
  | {
      type: 'approve';
      performedBy?: string;
    }
  | {
      type: 'reject';
      reason?: string;
      performedBy?: string;
    }
  | {
      type: 'cancel';
      performedBy?: string;
    };