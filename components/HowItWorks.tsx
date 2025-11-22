"use client";

import { MdAccountBalance, MdShoppingCart, MdGavel, MdCheckCircle } from "react-icons/md";

export function HowItWorks() {
  const steps = [
    {
      icon: <MdShoppingCart className="text-4xl" />,
      title: "Create Payment",
      description: "Buyer creates an escrowed payment. Funds are locked in the smart contract, not sent directly to the seller.",
      color: "from-blue-500 to-blue-600",
      delay: "0ms",
    },
    {
      icon: <MdAccountBalance className="text-4xl" />,
      title: "Funds Held Safely",
      description: "Money stays in escrow for up to 14 days. Both parties can see the commitment, but funds remain secure.",
      color: "from-purple-500 to-purple-600",
      delay: "200ms",
    },
    {
      icon: <MdGavel className="text-4xl" />,
      title: "Dispute or Complete",
      description: "If there's an issue, buyer requests a refund. AI analyzes the dispute and admin resolves it fairly.",
      color: "from-orange-500 to-orange-600",
      delay: "400ms",
    },
    {
      icon: <MdCheckCircle className="text-4xl" />,
      title: "Resolution",
      description: "Funds automatically go to the right party: refund to buyer if approved, or payment to seller if rejected.",
      color: "from-green-500 to-green-600",
      delay: "600ms",
    },
  ];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure crypto payments with refund protection in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative animate-fadeIn"
              style={{ animationDelay: step.delay }}
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700 shadow-lg z-10">
                {index + 1}
              </div>

              {/* Card */}
              <div className="card hover:shadow-xl transition-all duration-300 h-full border-2 border-transparent hover:border-primary">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Arrow (hidden on mobile, shown on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-6-6l6 6-6 6" stroke="#7B3FE4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full font-semibold">
            <MdCheckCircle className="text-xl" />
            Protected by smart contracts on Polygon
          </div>
        </div>
      </div>
    </div>
  );
}

