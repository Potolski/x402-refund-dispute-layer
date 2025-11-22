"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { PaymentList } from "@/components/PaymentList";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { ToastContainer } from "@/components/Toast";
import { usePayments } from "@/lib/hooks/usePayments";
import { useToast } from "@/lib/hooks/useToast";
import { useAccount } from "wagmi";
import { useState } from "react";
import Link from "next/link";
import { MdLock, MdRefresh } from "react-icons/md";

export default function Home() {
  const { isConnected } = useAccount();
  const { payments, isLoading, refetch } = usePayments();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toasts, removeToast, success, error, info } = useToast();

  return (
    <main className="min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                x402 Refund & Dispute Layer
              </h1>
              <p className="text-sm text-gray-600">
                Secure escrow payments with dispute resolution
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-primary hover:text-secondary font-semibold"
              >
                Admin Panel
              </Link>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <MdLock className="text-6xl text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to x402 Refund & Dispute Layer
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              A secure escrow system for crypto payments with built-in refund and
              dispute resolution. Connect your wallet to get started.
            </p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary"
              >
                {showCreateForm ? "View Payments" : "Create New Payment"}
              </button>
              <button 
                onClick={() => {
                  refetch();
                  info("Refreshing payments...");
                }} 
                className="btn-secondary flex items-center gap-2"
              >
                <MdRefresh className="text-lg" /> Refresh
              </button>
            </div>

            {/* Main Content */}
            {showCreateForm ? (
              <div className="max-w-2xl mx-auto">
                <CreatePaymentForm
                  onSuccess={() => {
                    setShowCreateForm(false);
                    success("Payment created successfully!");
                    refetch();
                  }}
                  onToast={(message, type) => {
                    if (type === "success") success(message);
                    else if (type === "error") error(message);
                    else info(message);
                  }}
                />
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="text-sm text-blue-700 font-semibold">
                      Total Payments
                    </div>
                    <div className="text-3xl font-bold text-blue-900 mt-1">
                      {payments.length}
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="text-sm text-yellow-700 font-semibold">
                      Pending
                    </div>
                    <div className="text-3xl font-bold text-yellow-900 mt-1">
                      {payments.filter((p) => p.status === 0).length}
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="text-sm text-orange-700 font-semibold">
                      Disputed
                    </div>
                    <div className="text-3xl font-bold text-orange-900 mt-1">
                      {payments.filter((p) => p.status === 2).length}
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="text-sm text-green-700 font-semibold">
                      Completed
                    </div>
                    <div className="text-3xl font-bold text-green-900 mt-1">
                      {payments.filter((p) => p.status === 1).length}
                    </div>
                  </div>
                </div>

                {/* Payments List */}
                <PaymentList
                  payments={payments}
                  isLoading={isLoading}
                  onRefetch={refetch}
                  onToast={(message, type) => {
                    if (type === "success") success(message);
                    else if (type === "error") error(message);
                    else info(message);
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

