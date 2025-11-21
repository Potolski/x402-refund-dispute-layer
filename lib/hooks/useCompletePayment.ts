"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";

export function useCompletePayment() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const completePayment = async (paymentId: bigint) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "completePayment",
        args: [paymentId],
      });
    } catch (err) {
      console.error("Error completing payment:", err);
      throw err;
    }
  };

  return {
    completePayment,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

