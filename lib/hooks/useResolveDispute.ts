"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";

export function useResolveDispute() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const resolveDispute = async (paymentId: bigint, approve: boolean) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "resolveDispute",
        args: [paymentId, approve],
      });
    } catch (err) {
      console.error("Error resolving dispute:", err);
      throw err;
    }
  };

  const batchResolve = async (paymentIds: bigint[], approvals: boolean[]) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "batchResolve",
        args: [paymentIds, approvals],
      });
    } catch (err) {
      console.error("Error batch resolving disputes:", err);
      throw err;
    }
  };

  return {
    resolveDispute,
    batchResolve,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

