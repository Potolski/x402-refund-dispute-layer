"use client";

import { Payment, PaymentStatus } from "@/lib/types";
import { MdCreate, MdHourglassEmpty, MdGavel, MdCheckCircle, MdUndo, MdCancel, MdAccessTime } from "react-icons/md";

interface PaymentTimelineProps {
  payment: Payment;
}

export function PaymentTimeline({ payment }: PaymentTimelineProps) {
  const steps = [
    {
      label: "Created",
      status: PaymentStatus.Pending,
      icon: "📝",
      active: true,
    },
    {
      label: "Pending",
      status: PaymentStatus.Pending,
      icon: "⏳",
      active: payment.status >= PaymentStatus.Pending,
    },
    {
      label: "Resolution",
      status: PaymentStatus.Disputed,
      icon: payment.status === PaymentStatus.Disputed ? "⚖️" : "✓",
      active: payment.status >= PaymentStatus.Completed,
      isDisputed: payment.status === PaymentStatus.Disputed,
    },
  ];

  const getFinalStep = () => {
    switch (payment.status) {
      case PaymentStatus.Completed:
        return { label: "Completed", icon: <MdCheckCircle className="text-xl" />, color: "bg-green-500" };
      case PaymentStatus.Refunded:
        return { label: "Refunded", icon: <MdUndo className="text-xl" />, color: "bg-blue-500" };
      case PaymentStatus.Rejected:
        return { label: "Rejected", icon: <MdCancel className="text-xl" />, color: "bg-red-500" };
      case PaymentStatus.Disputed:
        return { label: "Disputed", icon: <MdGavel className="text-xl" />, color: "bg-orange-500" };
      default:
        return { label: "In Progress", icon: <MdHourglassEmpty className="text-xl" />, color: "bg-yellow-500" };
    }
  };

  const finalStep = getFinalStep();
  const isComplete = payment.status >= PaymentStatus.Completed;

  // Calculate time remaining for dispute
  const disputeDeadline = Number(payment.disputeDeadline) * 1000; // Convert to ms
  const now = Date.now();
  const timeRemaining = disputeDeadline - now;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">Payment Timeline</h4>
      
      {/* Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          {/* Step 1: Created */}
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              true ? "bg-primary text-white" : "bg-gray-300"
            }`}>
              <MdCreate className="text-xl" />
            </div>
            <span className="text-xs mt-2 font-medium">Created</span>
          </div>

          {/* Connector Line */}
          <div className={`flex-1 h-1 -mx-2 ${
            payment.status >= PaymentStatus.Pending ? "bg-primary" : "bg-gray-300"
          }`}></div>

          {/* Step 2: Pending/Disputed */}
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              payment.status === PaymentStatus.Disputed
                ? "bg-orange-500 text-white animate-pulse"
                : payment.status >= PaymentStatus.Pending
                ? "bg-primary text-white"
                : "bg-gray-300"
            }`}>
              {payment.status === PaymentStatus.Disputed ? (
                <MdGavel className="text-xl" />
              ) : (
                <MdHourglassEmpty className="text-xl" />
              )}
            </div>
            <span className="text-xs mt-2 font-medium">
              {payment.status === PaymentStatus.Disputed ? "Disputed" : "Pending"}
            </span>
          </div>

          {/* Connector Line */}
          <div className={`flex-1 h-1 -mx-2 ${
            isComplete ? finalStep.color : "bg-gray-300"
          }`}></div>

          {/* Step 3: Final Status */}
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isComplete ? finalStep.color + " text-white" : "bg-gray-300"
            }`}>
              {finalStep.icon}
            </div>
            <span className="text-xs mt-2 font-medium">{finalStep.label}</span>
          </div>
        </div>

        {/* Time Remaining (if pending) */}
        {payment.status === PaymentStatus.Pending && timeRemaining > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800 font-medium flex items-center gap-1">
                <MdAccessTime className="text-lg" /> Time to Contest:
              </span>
              <span className="text-sm font-bold text-yellow-900">
                {daysRemaining}d {hoursRemaining}h remaining
              </span>
            </div>
            <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, (timeRemaining / (14 * 24 * 60 * 60 * 1000)) * 100))}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {payment.status === PaymentStatus.Disputed && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 flex items-center gap-2">
              <MdGavel className="text-lg flex-shrink-0" />
              This payment is under review. An admin will resolve the dispute soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

