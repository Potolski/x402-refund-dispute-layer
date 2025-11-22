import { Payment, PaymentStatus } from "./types";

export const generateDemoPayments = (userAddress: string): Payment[] => {
  const now = Math.floor(Date.now() / 1000);
  const otherAddress1 = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1";
  const otherAddress2 = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  const otherAddress3 = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0";

  return [
    {
      id: BigInt(0),
      sender: userAddress,
      receiver: otherAddress1,
      amount: BigInt("1500000000000000000"), // 1.5 MATIC
      status: PaymentStatus.Completed,
      timestamp: BigInt(now - 86400 * 5), // 5 days ago
      disputeDeadline: BigInt(now - 86400 * 5 + 14 * 86400),
      disputeReason: "",
      evidence: "",
    },
    {
      id: BigInt(1),
      sender: otherAddress2,
      receiver: userAddress,
      amount: BigInt("2300000000000000000"), // 2.3 MATIC
      status: PaymentStatus.Pending,
      timestamp: BigInt(now - 86400 * 2), // 2 days ago
      disputeDeadline: BigInt(now - 86400 * 2 + 14 * 86400),
      disputeReason: "",
      evidence: "",
    },
    {
      id: BigInt(2),
      sender: userAddress,
      receiver: otherAddress3,
      amount: BigInt("5000000000000000000"), // 5 MATIC
      status: PaymentStatus.Disputed,
      timestamp: BigInt(now - 86400 * 7), // 7 days ago
      disputeDeadline: BigInt(now - 86400 * 7 + 14 * 86400),
      disputeReason: "Product never shipped - tracking shows no movement for 5 days",
      evidence: "Order #12345, expected delivery was 3 days ago",
    },
    {
      id: BigInt(3),
      sender: otherAddress1,
      receiver: userAddress,
      amount: BigInt("750000000000000000"), // 0.75 MATIC
      status: PaymentStatus.Refunded,
      timestamp: BigInt(now - 86400 * 10), // 10 days ago
      disputeDeadline: BigInt(now - 86400 * 10 + 14 * 86400),
      disputeReason: "Item was defective - unable to use as described",
      evidence: "Photos showing damage upon arrival",
    },
    {
      id: BigInt(4),
      sender: userAddress,
      receiver: otherAddress2,
      amount: BigInt("1000000000000000000"), // 1 MATIC
      status: PaymentStatus.Pending,
      timestamp: BigInt(now - 86400), // 1 day ago
      disputeDeadline: BigInt(now - 86400 + 14 * 86400),
      disputeReason: "",
      evidence: "",
    },
    {
      id: BigInt(5),
      sender: otherAddress3,
      receiver: userAddress,
      amount: BigInt("3200000000000000000"), // 3.2 MATIC
      status: PaymentStatus.Completed,
      timestamp: BigInt(now - 86400 * 15), // 15 days ago
      disputeDeadline: BigInt(now - 86400 * 15 + 14 * 86400),
      disputeReason: "",
      evidence: "",
    },
    {
      id: BigInt(6),
      sender: userAddress,
      receiver: otherAddress1,
      amount: BigInt("4500000000000000000"), // 4.5 MATIC
      status: PaymentStatus.Disputed,
      timestamp: BigInt(now - 86400 * 3), // 3 days ago
      disputeDeadline: BigInt(now - 86400 * 3 + 14 * 86400),
      disputeReason: "Wrong item received - ordered blue, got red",
      evidence: "Photos of wrong color item",
    },
    {
      id: BigInt(7),
      sender: otherAddress2,
      receiver: userAddress,
      amount: BigInt("1800000000000000000"), // 1.8 MATIC
      status: PaymentStatus.Completed,
      timestamp: BigInt(now - 86400 * 20), // 20 days ago
      disputeDeadline: BigInt(now - 86400 * 20 + 14 * 86400),
      disputeReason: "",
      evidence: "",
    },
  ];
};

export const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("demoMode") === "true";
};

export const setDemoMode = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem("demoMode", "true");
  } else {
    localStorage.removeItem("demoMode");
  }
};

