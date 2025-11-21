"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";
import { Payment } from "@/lib/types";
import { useEffect, useState } from "react";

export function usePayments() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllPayments",
  });

  // Watch for payment events and refresh
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "PaymentCreated",
    onLogs: () => {
      setRefreshKey((prev) => prev + 1);
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "PaymentCompleted",
    onLogs: () => {
      setRefreshKey((prev) => prev + 1);
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "RefundRequested",
    onLogs: () => {
      setRefreshKey((prev) => prev + 1);
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "DisputeResolved",
    onLogs: () => {
      setRefreshKey((prev) => prev + 1);
    },
  });

  // Refetch when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  const payments = (data as Payment[] | undefined) || [];

  return {
    payments,
    isLoading,
    error,
    refetch,
  };
}

export function usePaymentsByStatus(status: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getPaymentsByStatus",
    args: [status],
  });

  const payments = (data as Payment[] | undefined) || [];

  return {
    payments,
    isLoading,
    error,
  };
}

export function usePayment(paymentId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getPayment",
    args: [paymentId],
  });

  return {
    payment: data as Payment | undefined,
    isLoading,
    error,
  };
}

