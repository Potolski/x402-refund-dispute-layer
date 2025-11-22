import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// Helper function to check if address is a contract
async function isContract(address: string, hre: HardhatRuntimeEnvironment): Promise<boolean> {
  const code = await hre.ethers.provider.getCode(address);
  return code !== "0x";
}

// Helper function to validate contract and network
async function validateContract(
  address: string,
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  console.log(`\nNetwork: ${hre.network.name}`);
  
  if (hre.network.name === "hardhat" && !address.startsWith("0x0000")) {
    console.warn("⚠️  WARNING: You're on the local Hardhat network.");
    console.warn("   Make sure to specify --network polygonAmoy for deployed contracts:");
    console.warn(`   npx hardhat contract:info --address ${address} --network polygonAmoy\n`);
  }

  const isContractAddress = await isContract(address, hre);
  if (!isContractAddress) {
    throw new Error(
      `Address ${address} is not a contract on ${hre.network.name} network.\n` +
      `Make sure you're connected to the correct network (use --network polygonAmoy for deployed contracts).`
    );
  }
}

// Task: Get contract info
task("contract:info", "Get information about deployed contract")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    try {
      await validateContract(taskArgs.address, hre);
      const contract = await ethers.getContractAt("DisputeEscrow", taskArgs.address);

      console.log("\n=== Contract Information ===");
      console.log("Address:", taskArgs.address);
      console.log("Network:", hre.network.name);
      
      try {
        console.log("Owner:", await contract.owner());
        console.log("Resolver:", await contract.resolver());
        console.log("Payment Counter:", (await contract.paymentCounter()).toString());
        console.log("Dispute Window:", (await contract.DISPUTE_WINDOW()).toString(), "seconds");
        console.log("Auto Complete Delay:", (await contract.AUTO_COMPLETE_DELAY()).toString(), "seconds");
      } catch (error: any) {
        throw new Error(
          `Failed to read contract data. This might not be a DisputeEscrow contract.\n` +
          `Error: ${error.message}\n` +
          `Make sure you're using the correct network: --network polygonAmoy`
        );
      }
      
      console.log("===========================\n");
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      console.error("\n💡 Tip: Use --network polygonAmoy for deployed contracts:");
      console.error(`   npx hardhat contract:info --address ${taskArgs.address} --network polygonAmoy\n`);
      process.exit(1);
    }
  });

// Task: List all payments
task("contract:payments", "List all payments in the contract")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    try {
      await validateContract(taskArgs.address, hre);
      const contract = await ethers.getContractAt("DisputeEscrow", taskArgs.address);
      const payments = await contract.getAllPayments();

      console.log("\n=== All Payments ===");
      console.log(`Total Payments: ${payments.length}\n`);

      if (payments.length === 0) {
        console.log("No payments found.");
      } else {
        payments.forEach((payment, index) => {
          console.log(`Payment #${index + 1}:`);
          console.log(`  ID: ${payment.id.toString()}`);
          console.log(`  Sender: ${payment.sender}`);
          console.log(`  Receiver: ${payment.receiver}`);
          console.log(`  Amount: ${ethers.formatEther(payment.amount)} POL`);
          console.log(`  Status: ${payment.status}`);
          console.log(`  Timestamp: ${new Date(Number(payment.timestamp) * 1000).toLocaleString()}`);
          if (payment.status === 2) {
            // Disputed
            console.log(`  Dispute Reason: ${payment.disputeReason}`);
          }
          console.log("");
        });
      }
      console.log("===================\n");
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      console.error("\n💡 Tip: Use --network polygonAmoy for deployed contracts:");
      console.error(`   npx hardhat contract:payments --address ${taskArgs.address} --network polygonAmoy\n`);
      process.exit(1);
    }
  });

// Task: Get payment by ID
task("contract:payment", "Get specific payment details")
  .addParam("address", "Contract address")
  .addParam("id", "Payment ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    try {
      await validateContract(taskArgs.address, hre);
      const contract = await ethers.getContractAt("DisputeEscrow", taskArgs.address);
      const payment = await contract.getPayment(taskArgs.id);

      const statusNames = ["Pending", "Completed", "Disputed", "Refunded", "Rejected"];

      console.log("\n=== Payment Details ===");
      console.log("ID:", payment.id.toString());
      console.log("Sender:", payment.sender);
      console.log("Receiver:", payment.receiver);
      console.log("Amount:", ethers.formatEther(payment.amount), "POL");
      console.log("Status:", statusNames[payment.status]);
      console.log("Created:", new Date(Number(payment.timestamp) * 1000).toLocaleString());
      console.log("Dispute Deadline:", new Date(Number(payment.disputeDeadline) * 1000).toLocaleString());
      if (payment.disputeReason) {
        console.log("Dispute Reason:", payment.disputeReason);
      }
      if (payment.evidence) {
        console.log("Evidence:", payment.evidence);
      }
      console.log("======================\n");
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      console.error("\n💡 Tip: Use --network polygonAmoy for deployed contracts:");
      console.error(`   npx hardhat contract:payment --address ${taskArgs.address} --id ${taskArgs.id} --network polygonAmoy\n`);
      process.exit(1);
    }
  });

// Task: Check contract balance
task("contract:balance", "Check contract ETH balance")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    try {
      const balance = await ethers.provider.getBalance(taskArgs.address);
      const isContractAddress = await isContract(taskArgs.address, hre);

      console.log("\n=== Contract Balance ===");
      console.log("Address:", taskArgs.address);
      console.log("Network:", hre.network.name);
      console.log("Is Contract:", isContractAddress ? "Yes" : "No");
      console.log("Balance:", ethers.formatEther(balance), "POL");
      console.log("=======================\n");
      
      if (hre.network.name === "hardhat" && !taskArgs.address.startsWith("0x0000")) {
        console.warn("💡 Tip: Use --network polygonAmoy for deployed contracts:\n");
        console.warn(`   npx hardhat contract:balance --address ${taskArgs.address} --network polygonAmoy\n`);
      }
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      process.exit(1);
    }
  });

// Task: Run gas analysis
task("gas:analyze", "Run gas analysis on contract functions")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("\nRunning gas analysis...");
    console.log("This will run tests with gas reporting enabled.\n");
    
    // Set environment variable for gas reporting
    process.env.REPORT_GAS = "true";
    
    await hre.run("test");
  });

// Task: Generate coverage report
task("coverage:report", "Generate code coverage report")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("\nGenerating coverage report...");
    process.env.COVERAGE = "true";
    await hre.run("coverage");
  });

// Task: Deploy and verify in one command
task("deploy:full", "Deploy contract and verify on PolygonScan")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("\n=== Full Deployment Process ===\n");
    
    // Step 1: Deploy
    console.log("Step 1: Deploying contract...");
    await hre.run("run", { script: "scripts/deploy.ts" });
    
    // Note: Verification requires the contract address
    // This would need to be extracted from deployment output
    console.log("\nStep 2: Please verify manually with:");
    console.log("npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>");
  });

// Task: Reset local Hardhat network
task("node:reset", "Reset local Hardhat network state")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    if (hre.network.name === "hardhat") {
      await hre.network.provider.request({
        method: "hardhat_reset",
        params: [],
      });
      console.log("Hardhat network reset successfully!");
    } else {
      console.log("This task only works on Hardhat network.");
    }
  });

// Task: Fork Polygon Amoy for testing
task("fork:amoy", "Fork Polygon Amoy network for local testing")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("\nForking Polygon Amoy network...");
    console.log("Start Hardhat node with forking enabled:");
    console.log("FORK_POLYGON_AMOY=true npx hardhat node");
    console.log("\nOr add to your .env:");
    console.log("FORK_POLYGON_AMOY=true");
  });

