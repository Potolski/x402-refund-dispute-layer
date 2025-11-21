"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";
import { parseEther } from "viem";

export function useCreatePayment() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPayment = async (receiverAddress: string, amount: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "createPayment",
        args: [receiverAddress as `0x${string}`],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("Error creating payment:", err);
      throw err;
    }
  };

  return {
    createPayment,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

