"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { DisputeResolver } from "@/components/DisputeResolver";
import { usePaymentsByStatus } from "@/lib/hooks/usePayments";
import { PaymentStatus } from "@/lib/types";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config/contracts";
import Link from "next/link";
import { useState } from "react";
import { useResolveDispute } from "@/lib/hooks/useResolveDispute";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { payments: disputedPayments, isLoading, error } = usePaymentsByStatus(
    PaymentStatus.Disputed
  );
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const { batchResolve, isPending: isBatchPending } = useResolveDispute();

  // Check if user is owner or resolver
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
  });

  const { data: resolver } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "resolver",
  });

  const isAuthorized =
    address &&
    (address.toLowerCase() === (owner as string)?.toLowerCase() ||
      address.toLowerCase() === (resolver as string)?.toLowerCase());

  const toggleSelection = (paymentId: string) => {
    const newSet = new Set(selectedPayments);
    if (newSet.has(paymentId)) {
      newSet.delete(paymentId);
    } else {
      newSet.add(paymentId);
    }
    setSelectedPayments(newSet);
  };

  const handleBatchApprove = async () => {
    if (selectedPayments.size === 0) return;
    try {
      const ids = Array.from(selectedPayments).map((id) => BigInt(id));
      const approvals = new Array(ids.length).fill(true);
      await batchResolve(ids, approvals);
      setSelectedPayments(new Set());
    } catch (error) {
      console.error("Error batch approving:", error);
    }
  };

  const handleBatchReject = async () => {
    if (selectedPayments.size === 0) return;
    try {
      const ids = Array.from(selectedPayments).map((id) => BigInt(id));
      const approvals = new Array(ids.length).fill(false);
      await batchResolve(ids, approvals);
      setSelectedPayments(new Set());
    } catch (error) {
      console.error("Error batch rejecting:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Panel - Dispute Resolution
              </h1>
              <p className="text-sm text-gray-600">
                Review and resolve payment disputes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-primary hover:text-secondary font-semibold"
              >
                ← Back to Dashboard
              </Link>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Admin Access Required
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to access the admin panel
            </p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        ) : !isAuthorized ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">⛔</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Unauthorized Access
            </h2>
            <p className="text-gray-600 mb-4">
              You are not authorized to access the admin panel.
            </p>
            <p className="text-sm text-gray-500">
              Connected as: {address}
            </p>
            <p className="text-sm text-gray-500">
              Contract Owner: {owner as string}
            </p>
            <p className="text-sm text-gray-500">
              Resolver: {resolver as string}
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="text-sm text-orange-700 font-semibold">
                  Pending Disputes
                </div>
                <div className="text-4xl font-bold text-orange-900 mt-2">
                  {isLoading ? "..." : disputedPayments.length}
                </div>
              </div>
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-sm text-blue-700 font-semibold">
                  Selected
                </div>
                <div className="text-4xl font-bold text-blue-900 mt-2">
                  {selectedPayments.size}
                </div>
              </div>
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="text-sm text-purple-700 font-semibold">
                  Your Role
                </div>
                <div className="text-lg font-bold text-purple-900 mt-2">
                  {address?.toLowerCase() === (owner as string)?.toLowerCase()
                    ? "Owner & Resolver"
                    : "Resolver"}
                </div>
              </div>
            </div>

            {/* Batch Actions */}
            {selectedPayments.size > 0 && (
              <div className="card mb-6 bg-blue-50 border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-blue-900">
                      Batch Actions ({selectedPayments.size} selected)
                    </h3>
                    <p className="text-sm text-blue-700">
                      Resolve multiple disputes at once
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBatchApprove}
                      disabled={isBatchPending}
                      className="btn-success"
                    >
                      Approve All Selected
                    </button>
                    <button
                      onClick={handleBatchReject}
                      disabled={isBatchPending}
                      className="btn-danger"
                    >
                      Reject All Selected
                    </button>
                    <button
                      onClick={() => setSelectedPayments(new Set())}
                      className="btn-secondary"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Disputed Payments */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Error Loading Disputes
                </h3>
                <p className="text-gray-500">{error.message}</p>
              </div>
            ) : disputedPayments.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Pending Disputes
                </h3>
                <p className="text-gray-500">
                  All disputes have been resolved. Great work!
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Disputed Payments
                  </h2>
                  <button
                    onClick={() => {
                      if (selectedPayments.size === disputedPayments.length) {
                        setSelectedPayments(new Set());
                      } else {
                        setSelectedPayments(
                          new Set(disputedPayments.map((p) => p.id.toString()))
                        );
                      }
                    }}
                    className="btn-secondary text-sm"
                  >
                    {selectedPayments.size === disputedPayments.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {disputedPayments.map((payment) => (
                    <div key={payment.id.toString()} className="relative">
                      <input
                        type="checkbox"
                        checked={selectedPayments.has(payment.id.toString())}
                        onChange={() => toggleSelection(payment.id.toString())}
                        className="absolute top-4 right-4 w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary z-10"
                      />
                      <DisputeResolver
                        payment={payment}
                        onSuccess={() => window.location.reload()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

