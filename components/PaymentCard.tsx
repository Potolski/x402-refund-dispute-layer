"use client";

import { Payment, PaymentStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { PaymentTimeline } from "./PaymentTimeline";
import { PaymentDetailModal } from "./PaymentDetailModal";
import { formatEther } from "viem";
import { useState } from "react";
import { RefundModal } from "./RefundModal";
import { useAccount } from "wagmi";
import { useCompletePayment } from "@/lib/hooks/useCompletePayment";
import { MdExpandMore, MdExpandLess, MdInfo } from "react-icons/md";

interface PaymentCardProps {
  payment: Payment;
  onRefetch?: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export function PaymentCard({ payment, onRefetch, onToast }: PaymentCardProps) {
  const { address } = useAccount();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { completePayment, isPending: isCompleting } = useCompletePayment();

  const isSender = address?.toLowerCase() === payment.sender.toLowerCase();
  const isReceiver = address?.toLowerCase() === payment.receiver.toLowerCase();

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleComplete = async () => {
    try {
      if (onToast) onToast("Completing payment...", "info");
      await completePayment(payment.id);
      if (onToast) onToast("Payment completed successfully!", "success");
      if (onRefetch) onRefetch();
    } catch (error) {
      console.error("Error completing payment:", error);
      if (onToast) onToast("Failed to complete payment", "error");
    }
  };

  const canRequestRefund =
    isSender && payment.status === PaymentStatus.Pending;
  const canComplete =
    (isSender || isReceiver) && payment.status === PaymentStatus.Pending;

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">
              Payment #{payment.id.toString()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(payment.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetailModal(true)}
              className="text-primary hover:text-secondary transition-colors p-1"
              title="View details"
            >
              <MdInfo className="text-2xl" />
            </button>
            <StatusBadge status={payment.status} />
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm md:text-base">Amount:</span>
            <span className="font-bold text-base md:text-lg text-primary">
              {formatEther(payment.amount)} MATIC
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-gray-600 text-sm md:text-base">From:</span>
            <span className="font-mono text-xs md:text-sm text-right">
              {formatAddress(payment.sender)}
              {isSender && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                  You
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-gray-600 text-sm md:text-base">To:</span>
            <span className="font-mono text-xs md:text-sm text-right">
              {formatAddress(payment.receiver)}
              {isReceiver && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                  You
                </span>
              )}
            </span>
          </div>

          {payment.disputeReason && (
            <div className="pt-3 border-t">
              <span className="text-gray-600 font-semibold">Dispute Reason:</span>
              <p className="text-gray-800 mt-1">{payment.disputeReason}</p>
              {payment.evidence && (
                <p className="text-gray-600 text-sm mt-2">
                  Evidence: {payment.evidence}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Timeline Toggle */}
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-sm text-primary hover:text-secondary font-semibold mt-3 flex items-center gap-1 transition-colors"
        >
          {showTimeline ? "Hide" : "Show"} Timeline
          {showTimeline ? <MdExpandLess className="text-lg" /> : <MdExpandMore className="text-lg" />}
        </button>

        {showTimeline && (
          <div className="mt-3">
            <PaymentTimeline payment={payment} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {canRequestRefund && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="btn-danger flex-1 text-sm md:text-base"
            >
              Request Refund
            </button>
          )}
          {canComplete && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="btn-success flex-1 text-sm md:text-base"
            >
              {isCompleting ? "Processing..." : "Complete Payment"}
            </button>
          )}
        </div>
      </div>

      {showRefundModal && (
        <RefundModal
          payment={payment}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            setShowRefundModal(false);
            if (onRefetch) onRefetch();
          }}
          onToast={onToast}
        />
      )}

      {showDetailModal && (
        <PaymentDetailModal
          payment={payment}
          onClose={() => setShowDetailModal(false)}
          userAddress={address}
        />
      )}
    </>
  );
}

