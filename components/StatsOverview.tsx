"use client";

import { Payment, PaymentStatus } from "@/lib/types";
import { formatEther } from "viem";
import { MdPayment, MdPending, MdGavel, MdCheckCircle, MdTrendingUp, MdAccountBalanceWallet } from "react-icons/md";
import { useMemo } from "react";

interface StatsOverviewProps {
  payments: Payment[];
}

export function StatsOverview({ payments }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter(p => p.status === PaymentStatus.Pending).length;
    const disputed = payments.filter(p => p.status === PaymentStatus.Disputed).length;
    const completed = payments.filter(p => p.status === PaymentStatus.Completed).length;
    const refunded = payments.filter(p => p.status === PaymentStatus.Refunded).length;
    
    const totalVolume = payments.reduce((acc, p) => acc + Number(formatEther(p.amount)), 0);
    const avgPayment = total > 0 ? totalVolume / total : 0;
    
    const successRate = total > 0 ? ((completed + refunded) / total * 100) : 0;

    return {
      total,
      pending,
      disputed,
      completed,
      refunded,
      totalVolume: totalVolume.toFixed(2),
      avgPayment: avgPayment.toFixed(3),
      successRate: successRate.toFixed(1),
    };
  }, [payments]);

  const statCards = [
    {
      label: "Total Payments",
      value: stats.total,
      icon: <MdPayment className="text-2xl" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <MdPending className="text-2xl" />,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      label: "Disputed",
      value: stats.disputed,
      icon: <MdGavel className="text-2xl" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <MdCheckCircle className="text-2xl" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Total Volume",
      value: `${stats.totalVolume} MATIC`,
      icon: <MdAccountBalanceWallet className="text-2xl" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      fullWidth: true,
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: <MdTrendingUp className="text-2xl" />,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
              stat.fullWidth ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

