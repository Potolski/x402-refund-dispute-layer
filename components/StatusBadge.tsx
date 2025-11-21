"use client";

import { PaymentStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case PaymentStatus.Pending:
        return { label: "Pending", className: "badge-pending" };
      case PaymentStatus.Completed:
        return { label: "Completed", className: "badge-completed" };
      case PaymentStatus.Disputed:
        return { label: "Disputed", className: "badge-disputed" };
      case PaymentStatus.Refunded:
        return { label: "Refunded", className: "badge-refunded" };
      case PaymentStatus.Rejected:
        return { label: "Rejected", className: "badge-rejected" };
      default:
        return { label: "Unknown", className: "badge" };
    }
  };

  const { label, className } = getStatusConfig();

  return <span className={`badge ${className}`}>{label}</span>;
}

