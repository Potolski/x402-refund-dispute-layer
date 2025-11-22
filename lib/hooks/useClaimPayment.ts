"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";

export function useClaimPayment() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPayment = async (paymentId: bigint) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "claimPayment",
        args: [paymentId],
      });
    } catch (err) {
      console.error("Error claiming payment:", err);
      throw err;
    }
  };

  return {
    claimPayment,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

