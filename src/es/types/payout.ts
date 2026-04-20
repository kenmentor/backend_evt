export type PayoutEvt =
  | {
      type: 'payoutCreated';
      host: string;
      agentId: string;
      amount: number;
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      performedBy?: string;
    }
  | {
      type: 'payoutApproved';
      performedBy?: string;
    }
  | {
      type: 'payoutRejected';
      reason?: string;
      performedBy?: string;
    }
  | {
      type: 'payoutProcessed';
      transactionRef?: string;
      performedBy?: string;
    };

export type PayoutAgg = {
  host: string;
  agentId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  transactionRef: string;
};

export type PayoutCmd =
  | {
      type: 'create';
      host: string;
      agentId: string;
      amount: number;
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
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
      type: 'process';
      transactionRef?: string;
      performedBy?: string;
    };