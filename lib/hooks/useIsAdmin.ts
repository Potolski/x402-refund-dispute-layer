"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";
import { useAccount } from "wagmi";

export function useIsAdmin() {
  const { address } = useAccount();
  
  const { data: isAdmin, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isAdmin",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isAdmin: isAdmin as boolean | undefined,
    isLoading,
    error,
  };
}

