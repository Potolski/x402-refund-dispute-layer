"use client";

import { MdSecurity, MdGavel, MdSpeed, MdVerified } from "react-icons/md";

export function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-primary via-purple-600 to-secondary text-white py-16 px-4 rounded-2xl mb-8 shadow-2xl">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
          <MdVerified className="text-xl" />
          <span className="text-sm font-semibold">Built on Polygon • Powered by AI</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Secure Crypto Payments
          <br />
          <span className="text-yellow-300">With Refund Protection</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-2xl mx-auto">
          The first escrow system for crypto payments with AI-powered dispute resolution. 
          Buy and sell with confidence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <MdSecurity className="text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Escrow Security</h3>
            <p className="text-sm text-purple-100">
              Funds held safely in smart contract until confirmed
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <MdGavel className="text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">AI Dispute Resolution</h3>
            <p className="text-sm text-purple-100">
              Intelligent analysis resolves conflicts fairly and quickly
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <MdSpeed className="text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">14-Day Protection</h3>
            <p className="text-sm text-purple-100">
              Request refunds within dispute window or auto-complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

