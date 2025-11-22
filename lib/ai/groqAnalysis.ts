// Free AI analysis using Groq API
// Get your free API key at: https://console.groq.com/keys

export interface AIAnalysisResult {
  suggestion: "approve" | "reject";
  confidence: number;
  reasoning: string;
  factors: string[];
}

export async function analyzeDispute(
  paymentAmount: string,
  disputeReason: string,
  evidence: string,
  senderAddress: string,
  receiverAddress: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  // Fallback to simulated analysis if no API key
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return simulatedAnalysis(disputeReason);
  }

  try {
    const prompt = `You are an AI dispute resolution assistant for a crypto payment escrow system. Analyze this payment dispute and provide a fair recommendation.

Payment Details:
- Amount: ${paymentAmount} POL
- Sender: ${senderAddress}
- Receiver: ${receiverAddress}
- Dispute Reason: ${disputeReason}
- Evidence: ${evidence || "None provided"}

Consider these factors:
1. Is the reason legitimate (e.g., "never shipped", "wrong product", "duplicate payment")?
2. Is there evidence provided?
3. Common fraud patterns vs legitimate disputes
4. Fairness to both parties

Respond in JSON format with:
{
  "suggestion": "approve" or "reject",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation",
  "factors": ["factor1", "factor2", "factor3"]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Fast and free
        messages: [
          {
            role: "system",
            content: "You are a fair and impartial dispute resolution AI. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status, await response.text());
      return simulatedAnalysis(disputeReason);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return simulatedAnalysis(disputeReason);
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return simulatedAnalysis(disputeReason);
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      suggestion: result.suggestion === "approve" ? "approve" : "reject",
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning || "Analysis completed",
      factors: result.factors || [],
    };
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return simulatedAnalysis(disputeReason);
  }
}

// Fallback simulated analysis (for demo or when API key not available)
function simulatedAnalysis(disputeReason: string): AIAnalysisResult {
  const reason = disputeReason.toLowerCase();

  // Rule-based logic for demo
  if (
    reason.includes("never shipped") ||
    reason.includes("not received") ||
    reason.includes("never arrived")
  ) {
    return {
      suggestion: "approve",
      confidence: 0.85,
      reasoning: "Strong indication of non-delivery. Recommend refund to protect buyer.",
      factors: [
        "Non-delivery claim",
        "Common legitimate dispute",
        "Buyer protection priority"
      ],
    };
  }

  if (
    reason.includes("wrong product") ||
    reason.includes("damaged") ||
    reason.includes("defective")
  ) {
    return {
      suggestion: "approve",
      confidence: 0.75,
      reasoning: "Product quality issue. Refund appropriate if evidence supports claim.",
      factors: [
        "Product quality dispute",
        "Merchant responsibility",
        "Conditional on evidence"
      ],
    };
  }

  if (
    reason.includes("changed mind") ||
    reason.includes("don't want") ||
    reason.includes("no longer need")
  ) {
    return {
      suggestion: "reject",
      confidence: 0.8,
      reasoning: "Buyer remorse is not valid grounds for refund in crypto transactions.",
      factors: [
        "Buyer's remorse",
        "Personal preference change",
        "Transaction was valid"
      ],
    };
  }

  if (
    reason.includes("duplicate") ||
    reason.includes("charged twice") ||
    reason.includes("double payment")
  ) {
    return {
      suggestion: "approve",
      confidence: 0.9,
      reasoning: "Duplicate payment error. Clear case for refund if verified.",
      factors: [
        "Technical error",
        "Double charge",
        "Easy to verify on-chain"
      ],
    };
  }

  if (
    reason.includes("scam") ||
    reason.includes("fraud") ||
    reason.includes("fake")
  ) {
    return {
      suggestion: "approve",
      confidence: 0.7,
      reasoning: "Fraud allegation requires investigation. Err on side of buyer protection.",
      factors: [
        "Fraud allegation",
        "Requires evidence review",
        "High-risk situation"
      ],
    };
  }

  // Default case
  return {
    suggestion: "reject",
    confidence: 0.6,
    reasoning: "Insufficient information or unclear dispute reason. More evidence needed.",
    factors: [
      "Vague dispute reason",
      "Insufficient details",
      "Default to merchant"
    ],
  };
}

