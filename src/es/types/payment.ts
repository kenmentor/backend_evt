export type PaymentEvt =
  | {
      type: 'paymentInitiated';
      host: string;
      guest: string;
      house: string;
      note?: string;
      amount: number;
      method?: string;
      paymentRef: string;
      performedBy?: string;
    }
  | {
      type: 'paymentCompleted';
      performedBy?: string;
    }
  | {
      type: 'paymentFailed';
      performedBy?: string;
    }
  | {
      type: 'paymentRefunded';
      refundAmount: number;
      performedBy?: string;
    }
  | {
      type: 'paymentRefundRequested';
      performedBy?: string;
    };

export type PaymentAgg = {
  host: string;
  guest: string;
  house: string;
  note: string;
  amount: number;
  method: string;
  refund: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'refund_requested';
  paymentRef: string;
};

export type PaymentCmd =
  | {
      type: 'initiate';
      host: string;
      guest: string;
      house: string;
      note?: string;
      amount: number;
      method?: string;
      paymentRef: string;
      performedBy?: string;
    }
  | {
      type: 'complete';
      performedBy?: string;
    }
  | {
      type: 'fail';
      performedBy?: string;
    }
  | {
      type: 'requestRefund';
      performedBy?: string;
    }
  | {
      type: 'refund';
      refundAmount: number;
      performedBy?: string;
    };