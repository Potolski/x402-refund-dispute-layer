"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";

export function useRefundRequest() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const requestRefund = async (
    paymentId: bigint,
    reason: string,
    evidence: string = ""
  ) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "requestRefund",
        args: [paymentId, reason, evidence],
      });
    } catch (err) {
      console.error("Error requesting refund:", err);
      throw err;
    }
  };

  return {
    requestRefund,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

