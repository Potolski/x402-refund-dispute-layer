import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition Deployment Module
 * 
 * This uses Hardhat Ignition for advanced deployment management:
 * - Deployment planning and execution
 * - Dependency management
 * - Deployment state tracking
 * - Rollback capabilities
 * 
 * Usage:
 *   npx hardhat ignition deploy ignition/modules/DisputeEscrow.ts --network polygonAmoy
 * 
 * Note: Requires @nomicfoundation/hardhat-ignition package
 * If not installed, use the standard deploy script instead.
 */

const DisputeEscrowModule = buildModule("DisputeEscrowModule", (m) => {
  // Deploy DisputeEscrow contract
  const disputeEscrow = m.contract("DisputeEscrow", [], {
    id: "DisputeEscrow",
  });

  return { disputeEscrow };
});

export default DisputeEscrowModule;

