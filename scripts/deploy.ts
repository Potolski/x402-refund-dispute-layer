import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment to Polygon Amoy...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy DisputeEscrow
  console.log("\nDeploying DisputeEscrow...");
  const DisputeEscrow = await ethers.getContractFactory("DisputeEscrow");
  const disputeEscrow = await DisputeEscrow.deploy();

  await disputeEscrow.waitForDeployment();

  const address = await disputeEscrow.getAddress();
  console.log("DisputeEscrow deployed to:", address);

  // Get deployment transaction
  const deploymentTx = disputeEscrow.deploymentTransaction();
  if (deploymentTx) {
    console.log("Deployment transaction hash:", deploymentTx.hash);
    console.log("Waiting for confirmations...");
    await deploymentTx.wait(3); // Wait for 3 confirmations
    console.log("Deployment confirmed!");
  }

  // Display contract info
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", address);
  console.log("Network: Polygon Amoy Testnet");
  console.log("Deployer:", deployer.address);
  console.log("Owner:", await disputeEscrow.owner());
  console.log("Resolver:", await disputeEscrow.resolver());
  console.log("=========================\n");

  console.log("To verify the contract on PolygonScan, run:");
  console.log(`npx hardhat verify --network polygonAmoy ${address}`);

  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

