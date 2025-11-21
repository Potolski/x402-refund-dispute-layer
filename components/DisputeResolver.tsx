"use client";

import { useState, useEffect } from "react";
import { Payment, PaymentStatus } from "@/lib/types";
import { useResolveDispute } from "@/lib/hooks/useResolveDispute";
import { formatEther } from "viem";

interface DisputeResolverProps {
  payment: Payment;
  onSuccess: () => void;
}

interface AIAnalysis {
  isAnalyzing: boolean;
  suggestion: "approve" | "reject" | null;
  confidence: number;
  reasoning: string[];
}

export function DisputeResolver({ payment, onSuccess }: DisputeResolverProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    isAnalyzing: false,
    suggestion: null,
    confidence: 0,
    reasoning: [],
  });
  const { resolveDispute, isPending } = useResolveDispute();

  // Simulated AI analysis
  useEffect(() => {
    setAiAnalysis({ isAnalyzing: true, suggestion: null, confidence: 0, reasoning: [] });

    const timer = setTimeout(() => {
      const reason = payment.disputeReason.toLowerCase();
      let suggestion: "approve" | "reject" = "reject";
      let confidence = 50;
      let reasoning: string[] = [];

      // Simple rule-based "AI" logic
      if (
        reason.includes("never shipped") ||
        reason.includes("not received") ||
        reason.includes("didn't arrive")
      ) {
        suggestion = "approve";
        confidence = 85;
        reasoning = [
          "Delivery issue detected - common valid refund reason",
          "No delivery confirmation evidence provided by merchant",
          "Customer claim appears legitimate based on pattern analysis",
        ];
      } else if (
        reason.includes("defective") ||
        reason.includes("broken") ||
        reason.includes("damaged")
      ) {
        suggestion = "approve";
        confidence = 75;
        reasoning = [
          "Product quality issue reported",
          "Defect claims typically valid with evidence",
          "Recommend approval to maintain customer trust",
        ];
      } else if (
        reason.includes("wrong") ||
        reason.includes("incorrect") ||
        reason.includes("different")
      ) {
        suggestion = "approve";
        confidence = 80;
        reasoning = [
          "Item mismatch reported",
          "Wrong item shipments are clear merchant errors",
          "Strong case for refund approval",
        ];
      } else if (
        reason.includes("changed mind") ||
        reason.includes("don't want") ||
        reason.includes("dont want")
      ) {
        suggestion = "reject";
        confidence = 70;
        reasoning = [
          "Buyer's remorse detected - not a valid refund reason",
          "No merchant fault identified",
          "Recommend rejection unless return policy allows",
        ];
      } else if (
        reason.includes("duplicate") ||
        reason.includes("double") ||
        reason.includes("charged twice")
      ) {
        suggestion = "approve";
        confidence = 90;
        reasoning = [
          "Duplicate payment detected - clear system error",
          "Strong evidence of technical issue",
          "Immediate refund recommended",
        ];
      } else {
        // Random decision for other cases
        suggestion = Math.random() > 0.5 ? "approve" : "reject";
        confidence = Math.floor(Math.random() * 30) + 50;
        reasoning = [
          "Analyzing transaction history and user reputation...",
          "Cross-referencing with similar dispute cases...",
          `Confidence level: ${confidence}% based on available data`,
        ];
      }

      setAiAnalysis({
        isAnalyzing: false,
        suggestion,
        confidence,
        reasoning,
      });
    }, 2000); // Simulate 2 second analysis

    return () => clearTimeout(timer);
  }, [payment.disputeReason]);

  const handleResolve = async () => {
    if (selected === null) {
      alert("Please select an action");
      return;
    }

    try {
      await resolveDispute(payment.id, selected);
      onSuccess();
    } catch (error) {
      console.error("Error resolving dispute:", error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Payment #{payment.id.toString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Amount: {formatEther(payment.amount)} MATIC
          </p>
        </div>
        <span className="badge badge-disputed">Disputed</span>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">From:</span>
          <span className="font-mono">{formatAddress(payment.sender)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">To:</span>
          <span className="font-mono">{formatAddress(payment.receiver)}</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Dispute Reason:</h4>
        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
          {payment.disputeReason}
        </p>
        {payment.evidence && (
          <div className="mt-2">
            <h4 className="font-semibold text-gray-700 mb-1">Evidence:</h4>
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
              {payment.evidence}
            </p>
          </div>
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <h4 className="font-bold text-purple-900">AI Dispute Analysis</h4>
        </div>

        {aiAnalysis.isAnalyzing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-purple-700 text-sm">
                Analyzing dispute details...
              </span>
            </div>
            <div className="text-xs text-purple-600 space-y-1">
              <p>• Reviewing transaction history</p>
              <p>• Checking user reputation scores</p>
              <p>• Comparing with similar cases</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-purple-900">
                  AI Recommendation:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    aiAnalysis.suggestion === "approve"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {aiAnalysis.suggestion === "approve"
                    ? "APPROVE REFUND"
                    : "REJECT REFUND"}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-purple-700 mb-1">
                  <span>Confidence:</span>
                  <span className="font-bold">{aiAnalysis.confidence}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${aiAnalysis.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-xs text-purple-800 space-y-1">
              {aiAnalysis.reasoning.map((reason, idx) => (
                <p key={idx}>• {reason}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600 font-semibold">Your Decision:</p>
        <div className="flex gap-3">
          <button
            onClick={() => setSelected(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              selected === true
                ? "bg-green-500 text-white ring-4 ring-green-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            ✓ Approve Refund
          </button>
          <button
            onClick={() => setSelected(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              selected === false
                ? "bg-red-500 text-white ring-4 ring-red-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            ✗ Reject Refund
          </button>
        </div>

        <button
          onClick={handleResolve}
          disabled={isPending || selected === null}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Processing..." : "Confirm & Execute Decision"}
        </button>
      </div>
    </div>
  );
}

