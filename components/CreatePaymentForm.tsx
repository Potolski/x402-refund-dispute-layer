"use client";

import { useState } from "react";
import { useCreatePayment } from "@/lib/hooks/useCreatePayment";
import { isAddress } from "viem";
import { MdCheckCircle } from "react-icons/md";

interface CreatePaymentFormProps {
  onSuccess?: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export function CreatePaymentForm({ onSuccess, onToast }: CreatePaymentFormProps) {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const { createPayment, isPending, isSuccess } = useCreatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!isAddress(receiver)) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      if (onToast) onToast("Creating payment...", "info");
      await createPayment(receiver, amount);
      setReceiver("");
      setAmount("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating payment:", error);
      if (onToast) onToast("Failed to create payment", "error");
    }
  };

  if (isSuccess) {
    return (
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-xl font-bold text-green-700 mb-2 flex items-center gap-2">
          <MdCheckCircle className="text-2xl" />
          Payment Created Successfully!
        </h3>
        <p className="text-green-600 mb-4">
          Your escrowed payment has been created. The funds are securely held until
          the payment is completed or disputed.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-success"
        >
          Create Another Payment
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Create Escrowed Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Receiver Address *
          </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="input-field font-mono"
            placeholder="0x..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The address that will receive the payment
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Amount (MATIC) *
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder="0.0"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Funds will be held in escrow until completed or disputed
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? "Creating Payment..." : "Create Payment"}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Funds are held securely in the escrow contract</li>
          <li>• You have 14 days to request a refund if needed</li>
          <li>• Either party can complete the payment to release funds</li>
          <li>• Disputes are resolved by the admin/AI system</li>
        </ul>
      </div>
    </div>
  );
}

