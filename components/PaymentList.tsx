"use client";

import { Payment, PaymentStatus } from "@/lib/types";
import { PaymentCard } from "./PaymentCard";
import { PaymentListSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { useState } from "react";
import { useAccount } from "wagmi";

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
      <EmptyState
        icon="inbox"
        title="No Payments Yet"
        description="Create your first escrowed payment to experience secure crypto transactions with refund protection."
      />
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
        <EmptyState
          icon="inbox"
          title="No Payments Found"
          description="No payments match your current filter. Try selecting a different filter option."
        />
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

