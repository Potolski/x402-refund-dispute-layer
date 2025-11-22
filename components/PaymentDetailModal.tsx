"use client";

import { Payment, PaymentStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { PaymentTimeline } from "./PaymentTimeline";
import { formatEther } from "viem";
import { MdClose, MdContentCopy, MdOpenInNew, MdPerson, MdAccountBalanceWallet } from "react-icons/md";
import { useState } from "react";

interface PaymentDetailModalProps {
  payment: Payment;
  onClose: () => void;
  userAddress?: string;
}

export function PaymentDetailModal({ payment, onClose, userAddress }: PaymentDetailModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isSender = userAddress?.toLowerCase() === payment.sender.toLowerCase();
  const isReceiver = userAddress?.toLowerCase() === payment.receiver.toLowerCase();

  const getPolygonScanUrl = () => {
    return `https://amoy.polygonscan.com/address/${payment.sender}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Payment Details</h2>
            <p className="text-purple-100">ID #{payment.id.toString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex justify-between items-center">
            <StatusBadge status={payment.status} />
            <div className="text-right">
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-3xl font-bold text-primary">
                {formatEther(payment.amount)} MATIC
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MdPerson className="text-blue-600 text-xl" />
                <span className="font-semibold text-blue-900">Sender</span>
                {isSender && (
                  <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-700 flex-1">
                  {formatAddress(payment.sender)}
                </span>
                <button
                  onClick={() => copyToClipboard(payment.sender, "sender")}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy address"
                >
                  <MdContentCopy className="text-lg" />
                </button>
                <a
                  href={`https://amoy.polygonscan.com/address/${payment.sender}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="View on PolygonScan"
                >
                  <MdOpenInNew className="text-lg" />
                </a>
              </div>
              {copied === "sender" && (
                <span className="text-xs text-green-600 mt-1 block">Copied!</span>
              )}
            </div>

            {/* Receiver */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MdAccountBalanceWallet className="text-green-600 text-xl" />
                <span className="font-semibold text-green-900">Receiver</span>
                {isReceiver && (
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-700 flex-1">
                  {formatAddress(payment.receiver)}
                </span>
                <button
                  onClick={() => copyToClipboard(payment.receiver, "receiver")}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Copy address"
                >
                  <MdContentCopy className="text-lg" />
                </button>
                <a
                  href={`https://amoy.polygonscan.com/address/${payment.receiver}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="View on PolygonScan"
                >
                  <MdOpenInNew className="text-lg" />
                </a>
              </div>
              {copied === "receiver" && (
                <span className="text-xs text-green-600 mt-1 block">Copied!</span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Payment Timeline</h3>
            <PaymentTimeline payment={payment} />
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-gray-800 mb-2">Important Dates</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(payment.timestamp)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dispute Deadline:</span>
              <span className="font-medium">{formatDate(payment.disputeDeadline)}</span>
            </div>
            {payment.status === PaymentStatus.Pending && (
              <div className="mt-2 pt-2 border-t">
                <span className="text-xs text-gray-600">
                  Time remaining: {Math.max(0, Math.floor((Number(payment.disputeDeadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))} days
                </span>
              </div>
            )}
          </div>

          {/* Dispute Info */}
          {payment.disputeReason && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">Dispute Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-semibold text-orange-800">Reason:</span>
                  <p className="text-sm text-orange-900 mt-1">{payment.disputeReason}</p>
                </div>
                {payment.evidence && (
                  <div>
                    <span className="text-sm font-semibold text-orange-800">Evidence:</span>
                    <p className="text-sm text-orange-900 mt-1">{payment.evidence}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full btn-secondary py-3"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

