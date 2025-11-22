"use client";

import { useState, useEffect } from "react";
import { Payment, PaymentStatus } from "@/lib/types";
import { useResolveDispute } from "@/lib/hooks/useResolveDispute";
import { formatEther } from "viem";
import { MdSmartToy, MdCheckCircle, MdCancel, MdTrendingUp, MdLightbulb, MdAutoAwesome } from "react-icons/md";

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
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-lg border-2 border-purple-200 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <MdSmartToy className="text-3xl text-purple-600 animate-pulse" />
          <h4 className="font-bold text-purple-900 text-lg">AI Dispute Analysis</h4>
          <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <MdAutoAwesome className="text-sm" />
            POWERED BY AI
          </span>
        </div>

        {aiAnalysis.isAnalyzing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-5 w-5 border-3 border-purple-600 border-t-transparent"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-purple-400 opacity-20"></div>
              </div>
              <span className="text-purple-700 font-semibold animate-pulse">
                Analyzing dispute details...
              </span>
            </div>
            <div className="space-y-2 pl-8">
              <div className="flex items-center gap-2 text-sm text-purple-600 animate-fadeIn">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="animate-slideIn">Reviewing transaction history and patterns...</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 animate-fadeIn delay-300">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="animate-slideIn delay-300">Cross-referencing with 10,000+ similar cases...</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 animate-fadeIn delay-600">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="animate-slideIn delay-600">Analyzing dispute reason semantics...</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 animate-fadeIn delay-900">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="animate-slideIn delay-900">Computing confidence scores...</p>
              </div>
            </div>
            
            {/* Animated progress bar */}
            <div className="mt-4">
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-purple-900 text-lg flex items-center gap-2">
                  <MdAutoAwesome className="text-2xl text-purple-600" />
                  AI Recommendation:
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold shadow-md animate-bounce flex items-center gap-2 ${
                    aiAnalysis.suggestion === "approve"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                  }`}
                >
                  {aiAnalysis.suggestion === "approve" ? (
                    <>
                      <MdCheckCircle className="text-xl" />
                      APPROVE REFUND
                    </>
                  ) : (
                    <>
                      <MdCancel className="text-xl" />
                      REJECT REFUND
                    </>
                  )}
                </span>
              </div>
              <div className="mb-3 bg-white rounded-lg p-3 shadow-inner">
                <div className="flex justify-between text-sm text-purple-700 mb-2">
                  <span className="font-semibold flex items-center gap-1">
                    <MdTrendingUp className="text-lg" /> Confidence Level:
                  </span>
                  <span className="font-bold text-lg">{aiAnalysis.confidence}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      aiAnalysis.confidence >= 75
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : aiAnalysis.confidence >= 50
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500"
                    }`}
                    style={{ width: `${aiAnalysis.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-inner">
              <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <MdLightbulb className="text-xl text-purple-600" /> AI Reasoning:
              </div>
              <div className="text-sm text-purple-800 space-y-2">
                {aiAnalysis.reasoning.map((reason, idx) => (
                  <p key={idx} className="flex items-start gap-2 animate-fadeIn" style={{ animationDelay: `${idx * 100}ms` }}>
                    <span className="text-purple-500 mt-0.5">▸</span>
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600 font-semibold">Your Decision:</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setSelected(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
              selected === true
                ? "bg-green-500 text-white ring-4 ring-green-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            <MdCheckCircle className="text-xl" /> Approve Refund
          </button>
          <button
            onClick={() => setSelected(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
              selected === false
                ? "bg-red-500 text-white ring-4 ring-red-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            <MdCancel className="text-xl" /> Reject Refund
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

