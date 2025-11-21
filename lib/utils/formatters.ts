/**
 * Utility functions for formatting data
 */

import { formatEther } from "viem";

/**
 * Format Ethereum address for display
 */
export function formatAddress(address: string, length: number = 4): string {
  if (!address) return "";
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Format Wei to Ether with specified decimals
 */
export function formatAmount(
  amount: bigint,
  decimals: number = 4,
  symbol: string = "MATIC"
): string {
  const formatted = parseFloat(formatEther(amount)).toFixed(decimals);
  return `${formatted} ${symbol}`;
}

/**
 * Format timestamp to human-readable date
 */
export function formatDate(timestamp: bigint | number): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: bigint | number): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return formatDate(timestamp);
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string, length: number = 6): string {
  if (!hash) return "";
  return `${hash.slice(0, length + 2)}...${hash.slice(-length)}`;
}

/**
 * Get Polygon Amoy explorer URL for transaction
 */
export function getTxUrl(hash: string): string {
  return `https://amoy.polygonscan.com/tx/${hash}`;
}

/**
 * Get Polygon Amoy explorer URL for address
 */
export function getAddressUrl(address: string): string {
  return `https://amoy.polygonscan.com/address/${address}`;
}

