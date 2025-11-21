export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Disputed = 2,
  Refunded = 3,
  Rejected = 4,
}

export interface Payment {
  id: bigint;
  sender: string;
  receiver: string;
  amount: bigint;
  status: PaymentStatus;
  timestamp: bigint;
  disputeDeadline: bigint;
  disputeReason: string;
  evidence: string;
}

