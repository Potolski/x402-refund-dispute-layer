"use client";

import { useState } from "react";
import { Payment } from "@/lib/types";
import { useRefundRequest } from "@/lib/hooks/useRefundRequest";

interface RefundModalProps {
  payment: Payment;
  onClose: () => void;
  onSuccess: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export function RefundModal({ payment, onClose, onSuccess, onToast }: RefundModalProps) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const { requestRefund, isPending, isSuccess } = useRefundRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for the refund");
      return;
    }

    try {
      if (onToast) onToast("Submitting refund request...", "info");
      await requestRefund(payment.id, reason, evidence);
      if (onToast) onToast("Refund request submitted!", "success");
      onSuccess();
    } catch (error) {
      console.error("Error requesting refund:", error);
      if (onToast) onToast("Failed to submit refund request", "error");
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
          <p className="text-gray-700 mb-6">
            Your refund request has been submitted successfully. It will be reviewed
            by the dispute resolution system.
          </p>
          <button onClick={onSuccess} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Request Refund</h2>
        <p className="text-gray-600 mb-6">
          Payment #{payment.id.toString()} - Please provide a reason for your
          refund request.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder="e.g., Product never shipped, Wrong item received..."
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Evidence (Optional)
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Additional details or evidence..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger flex-1"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Refund Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

