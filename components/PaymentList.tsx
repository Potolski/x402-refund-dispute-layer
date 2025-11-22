"use client";

import { Payment, PaymentStatus } from "@/lib/types";
import { PaymentCard } from "./PaymentCard";
import { PaymentListSkeleton } from "./LoadingSkeleton";
import { useState } from "react";
import { useAccount } from "wagmi";
import { MdInbox } from "react-icons/md";

interface PaymentListProps {
  payments: Payment[];
  isLoading: boolean;
  onRefetch?: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export function PaymentList({ payments, isLoading, onRefetch, onToast }: PaymentListProps) {
  const { address } = useAccount();
  const [filter, setFilter] = useState<"all" | "sent" | "received" | "disputed">(
    "all"
  );

  if (isLoading) {
    return <PaymentListSkeleton />;
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        <MdInbox className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No payments yet
        </h3>
        <p className="text-gray-500">
          Create your first escrowed payment to get started
        </p>
      </div>
    );
  }

  const filteredPayments = payments.filter((payment) => {
    if (!address) return true;
    
    switch (filter) {
      case "sent":
        return payment.sender.toLowerCase() === address.toLowerCase();
      case "received":
        return payment.receiver.toLowerCase() === address.toLowerCase();
      case "disputed":
        return payment.status === PaymentStatus.Disputed;
      default:
        return true;
    }
  });

  // Sort by timestamp, newest first
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <div>
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All ({payments.length})
        </button>
        <button
          onClick={() => setFilter("sent")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "sent"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Sent
        </button>
        <button
          onClick={() => setFilter("received")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "received"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Received
        </button>
        <button
          onClick={() => setFilter("disputed")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === "disputed"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Disputed
        </button>
      </div>

      {sortedPayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payments found for this filter
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPayments.map((payment) => (
            <PaymentCard
              key={payment.id.toString()}
              payment={payment}
              onRefetch={onRefetch}
              onToast={onToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}

