"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { PaymentList } from "@/components/PaymentList";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { StatsOverview } from "@/components/StatsOverview";
import { EmptyState } from "@/components/EmptyState";
import { ToastContainer } from "@/components/Toast";
import { DemoModeToggle } from "@/components/DemoModeToggle";
import { usePayments } from "@/lib/hooks/usePayments";
import { useToast } from "@/lib/hooks/useToast";
import { generateDemoPayments, isDemoMode } from "@/lib/demoData";
import { useAccount } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MdRefresh, MdAdminPanelSettings } from "react-icons/md";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { payments: realPayments, isLoading: realLoading, refetch } = usePayments();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const { toasts, removeToast, success, error, info } = useToast();
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    setDemoEnabled(isDemoMode());
  }, []);

  const { payments, isLoading } = useMemo(() => {
    if (demoEnabled && address) {
      return {
        payments: generateDemoPayments(address),
        isLoading: false,
      };
    }
    return {
      payments: realPayments,
      isLoading: realLoading,
    };
  }, [demoEnabled, address, realPayments, realLoading]);

  return (
    <main className="min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DemoModeToggle onToggle={setDemoEnabled} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                x402 Refund & Dispute Layer
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Secure escrow payments with dispute resolution
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="btn-secondary flex items-center gap-2 text-sm md:text-base"
                >
                  <MdAdminPanelSettings className="text-lg md:text-xl" />
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected ? (
          <>
            <HeroSection />
            <HowItWorks />
            <EmptyState
              icon="lock"
              title="Connect Your Wallet"
              description="Connect your wallet to create secure escrowed payments, request refunds, and manage disputes with AI-powered resolution."
              action={{
                label: "Connect Wallet",
                onClick: () => {}, // RainbowKit handles this automatically
              }}
            />
          </>
        ) : (
          <>
            {/* Hero Section for Connected Users */}
            {!showCreateForm && payments.length === 0 && (
              <>
                <HeroSection />
                <HowItWorks />
              </>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary w-full sm:w-auto"
              >
                {showCreateForm ? "View Payments" : "Create New Payment"}
              </button>
              <button 
                onClick={() => {
                  refetch();
                  info("Refreshing payments...");
                }} 
                className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
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
                {/* Stats Dashboard */}
                <StatsOverview payments={payments} />

                {/* Old Stats - Keep for reference but hidden */}
                <div className="hidden grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

