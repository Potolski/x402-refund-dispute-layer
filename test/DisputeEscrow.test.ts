import { expect } from "chai";
import { ethers } from "hardhat";
import { DisputeEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("DisputeEscrow", function () {
  let disputeEscrow: DisputeEscrow;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let receiver: SignerWithAddress;
  let resolver: SignerWithAddress;

  const PAYMENT_AMOUNT = ethers.parseEther("1.0");

  beforeEach(async function () {
    [owner, sender, receiver, resolver] = await ethers.getSigners();

    const DisputeEscrow = await ethers.getContractFactory("DisputeEscrow");
    disputeEscrow = await DisputeEscrow.deploy();
    await disputeEscrow.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await disputeEscrow.owner()).to.equal(owner.address);
    });

    it("Should set the resolver to owner initially", async function () {
      expect(await disputeEscrow.resolver()).to.equal(owner.address);
    });

    it("Should initialize payment counter to 0", async function () {
      expect(await disputeEscrow.paymentCounter()).to.equal(0);
    });

    it("Should set deployer as admin initially", async function () {
      expect(await disputeEscrow.isAdmin(owner.address)).to.be.true;
    });
  });

  describe("Create Payment", function () {
    it("Should create a payment successfully", async function () {
      const beforeTimestamp = await time.latest();
      
      const tx = await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
      
      const receipt = await tx.wait();
      const afterTimestamp = await time.latest();
      
      // Check event was emitted with correct parameters (allow timestamp variance)
      const event = receipt?.logs.find(
        (log: any) => {
          try {
            const parsed = disputeEscrow.interface.parseLog(log);
            return parsed?.name === "PaymentCreated";
          } catch {
            return false;
          }
        }
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = disputeEscrow.interface.parseLog(event!);
      expect(parsedEvent?.args[0]).to.equal(0); // paymentId
      expect(parsedEvent?.args[1]).to.equal(sender.address); // sender
      expect(parsedEvent?.args[2]).to.equal(receiver.address); // receiver
      expect(parsedEvent?.args[3]).to.equal(PAYMENT_AMOUNT); // amount
      
      // Timestamp should be within the block time range
      const eventTimestamp = Number(parsedEvent?.args[4]);
      expect(eventTimestamp).to.be.at.least(beforeTimestamp);
      expect(eventTimestamp).to.be.at.most(afterTimestamp + 1);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.sender).to.equal(sender.address);
      expect(payment.receiver).to.equal(receiver.address);
      expect(payment.amount).to.equal(PAYMENT_AMOUNT);
      expect(payment.status).to.equal(0); // Pending
    });

    it("Should increment payment counter", async function () {
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });

      expect(await disputeEscrow.paymentCounter()).to.equal(1);

      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });

      expect(await disputeEscrow.paymentCounter()).to.equal(2);
    });

    it("Should revert if payment amount is 0", async function () {
      await expect(
        disputeEscrow.connect(sender).createPayment(receiver.address, {
          value: 0,
        })
      ).to.be.revertedWith("Payment amount must be greater than 0");
    });

    it("Should revert if receiver is zero address", async function () {
      await expect(
        disputeEscrow.connect(sender).createPayment(ethers.ZeroAddress, {
          value: PAYMENT_AMOUNT,
        })
      ).to.be.revertedWith("Invalid receiver address");
    });

    it("Should revert if sender tries to pay themselves", async function () {
      await expect(
        disputeEscrow.connect(sender).createPayment(sender.address, {
          value: PAYMENT_AMOUNT,
        })
      ).to.be.revertedWith("Cannot send payment to yourself");
    });

    it("Should track sender and receiver payments", async function () {
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });

      const senderPayments = await disputeEscrow.getSenderPayments(sender.address);
      const receiverPayments = await disputeEscrow.getReceiverPayments(receiver.address);

      expect(senderPayments).to.have.lengthOf(1);
      expect(senderPayments[0]).to.equal(0);
      expect(receiverPayments).to.have.lengthOf(1);
      expect(receiverPayments[0]).to.equal(0);
    });
  });

  describe("Complete Payment", function () {
    beforeEach(async function () {
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
    });

    it("Should allow sender to complete payment", async function () {
      const receiverBalanceBefore = await ethers.provider.getBalance(receiver.address);

      await expect(disputeEscrow.connect(sender).completePayment(0))
        .to.emit(disputeEscrow, "PaymentCompleted")
        .withArgs(0, await time.latest() + 1);

      const receiverBalanceAfter = await ethers.provider.getBalance(receiver.address);
      expect(receiverBalanceAfter - receiverBalanceBefore).to.equal(PAYMENT_AMOUNT);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.status).to.equal(1); // Completed
    });

    it("Should revert if receiver tries to complete before 14 days", async function () {
      await expect(
        disputeEscrow.connect(receiver).completePayment(0)
      ).to.be.revertedWith("Only sender can complete payment");
    });

    it("Should revert if unauthorized user tries to complete", async function () {
      await expect(
        disputeEscrow.connect(resolver).completePayment(0)
      ).to.be.revertedWith("Only sender can complete payment");
    });

    it("Should revert if sender tries to complete after 14 days", async function () {
      // Fast forward 15 days
      await time.increase(15 * 24 * 60 * 60);
      
      await expect(
        disputeEscrow.connect(sender).completePayment(0)
      ).to.be.revertedWith("Use claimPayment after 14 days");
    });

    it("Should allow receiver to claim payment after 14 days", async function () {
      // Fast forward 15 days
      await time.increase(15 * 24 * 60 * 60);
      
      const receiverBalanceBefore = await ethers.provider.getBalance(receiver.address);
      const beforeTimestamp = await time.latest();

      const tx = await disputeEscrow.connect(receiver).claimPayment(0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const afterTimestamp = await time.latest();

      // Check event was emitted with correct parameters (allow timestamp variance)
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "PaymentClaimed"
      );
      expect(event).to.not.be.undefined;
      
      // Decode event
      const decodedEvent = disputeEscrow.interface.parseLog({
        topics: event!.topics as string[],
        data: event!.data,
      });
      expect(decodedEvent?.args[0]).to.equal(0);
      expect(decodedEvent?.args[1]).to.equal(receiver.address);
      // Check timestamp is within range
      expect(decodedEvent?.args[2]).to.be.at.least(beforeTimestamp);
      expect(decodedEvent?.args[2]).to.be.at.most(afterTimestamp + 1);

      const receiverBalanceAfter = await ethers.provider.getBalance(receiver.address);
      // Account for gas costs
      expect(receiverBalanceAfter - receiverBalanceBefore + gasUsed).to.equal(PAYMENT_AMOUNT);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.status).to.equal(1); // Completed
    });

    it("Should revert if receiver tries to claim before 14 days", async function () {
      await expect(
        disputeEscrow.connect(receiver).claimPayment(0)
      ).to.be.revertedWith("14-day timelock has not expired");
    });

    it("Should revert if sender tries to claim payment", async function () {
      // Fast forward 15 days
      await time.increase(15 * 24 * 60 * 60);
      
      await expect(
        disputeEscrow.connect(sender).claimPayment(0)
      ).to.be.revertedWith("Only receiver can claim payment");
    });

    it("Should revert if payment is not pending", async function () {
      await disputeEscrow.connect(sender).completePayment(0);

      await expect(
        disputeEscrow.connect(sender).completePayment(0)
      ).to.be.revertedWith("Payment is not pending");
    });
  });

  describe("Request Refund", function () {
    beforeEach(async function () {
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
    });

    it("Should allow sender to request refund", async function () {
      const reason = "Product never shipped";
      const evidence = "Tracking number shows no movement";

      await expect(
        disputeEscrow.connect(sender).requestRefund(0, reason, evidence)
      )
        .to.emit(disputeEscrow, "RefundRequested")
        .withArgs(0, sender.address, reason, await time.latest() + 1);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.status).to.equal(2); // Disputed
      expect(payment.disputeReason).to.equal(reason);
      expect(payment.evidence).to.equal(evidence);
    });

    it("Should revert if non-sender tries to request refund", async function () {
      await expect(
        disputeEscrow.connect(receiver).requestRefund(0, "Some reason", "")
      ).to.be.revertedWith("Only sender can request refund");
    });

    it("Should revert if payment is not pending", async function () {
      await disputeEscrow.connect(sender).completePayment(0);

      await expect(
        disputeEscrow.connect(sender).requestRefund(0, "Some reason", "")
      ).to.be.revertedWith("Payment is not pending");
    });

    it("Should revert if reason is empty", async function () {
      await expect(
        disputeEscrow.connect(sender).requestRefund(0, "", "")
      ).to.be.revertedWith("Reason is required");
    });

    it("Should revert if dispute window has expired", async function () {
      // Fast forward past the dispute deadline (14 days)
      await time.increase(15 * 24 * 60 * 60);

      await expect(
        disputeEscrow.connect(sender).requestRefund(0, "Too late", "")
      ).to.be.revertedWith("Dispute window has expired");
    });
  });

  describe("Resolve Dispute", function () {
    beforeEach(async function () {
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
      await disputeEscrow.connect(sender).requestRefund(0, "Product defective", "");
    });

    it("Should allow resolver to approve refund", async function () {
      const senderBalanceBefore = await ethers.provider.getBalance(sender.address);

      await expect(disputeEscrow.connect(owner).resolveDispute(0, true))
        .to.emit(disputeEscrow, "DisputeResolved")
        .withArgs(0, true, 3, await time.latest() + 1); // 3 = Refunded

      const senderBalanceAfter = await ethers.provider.getBalance(sender.address);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.status).to.equal(3); // Refunded

      // Sender should receive the refund (minus gas costs from previous txs)
      expect(senderBalanceAfter).to.be.greaterThan(senderBalanceBefore);
    });

    it("Should allow resolver to reject refund", async function () {
      const receiverBalanceBefore = await ethers.provider.getBalance(receiver.address);

      await expect(disputeEscrow.connect(owner).resolveDispute(0, false))
        .to.emit(disputeEscrow, "DisputeResolved")
        .withArgs(0, false, 4, await time.latest() + 1); // 4 = Rejected

      const receiverBalanceAfter = await ethers.provider.getBalance(receiver.address);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.status).to.equal(4); // Rejected

      expect(receiverBalanceAfter - receiverBalanceBefore).to.equal(PAYMENT_AMOUNT);
    });

    it("Should revert if non-admin tries to resolve", async function () {
      await expect(
        disputeEscrow.connect(sender).resolveDispute(0, true)
      ).to.be.revertedWith("Only admin can call this");
    });

    it("Should revert if payment is not disputed", async function () {
      await disputeEscrow.connect(owner).resolveDispute(0, true);

      await expect(
        disputeEscrow.connect(owner).resolveDispute(0, true)
      ).to.be.revertedWith("Payment is not disputed");
    });
  });

  describe("Batch Resolve", function () {
    beforeEach(async function () {
      // Create multiple disputed payments
      for (let i = 0; i < 3; i++) {
        await disputeEscrow.connect(sender).createPayment(receiver.address, {
          value: PAYMENT_AMOUNT,
        });
        await disputeEscrow.connect(sender).requestRefund(i, `Dispute ${i}`, "");
      }
    });

    it("Should resolve multiple disputes in batch", async function () {
      const paymentIds = [0, 1, 2];
      const approvals = [true, false, true];

      await disputeEscrow.connect(owner).batchResolve(paymentIds, approvals);

      const payment0 = await disputeEscrow.getPayment(0);
      const payment1 = await disputeEscrow.getPayment(1);
      const payment2 = await disputeEscrow.getPayment(2);

      expect(payment0.status).to.equal(3); // Refunded
      expect(payment1.status).to.equal(4); // Rejected
      expect(payment2.status).to.equal(3); // Refunded
    });

    it("Should revert if arrays have different lengths", async function () {
      await expect(
        disputeEscrow.connect(owner).batchResolve([0, 1], [true])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should revert if arrays are empty", async function () {
      await expect(
        disputeEscrow.connect(owner).batchResolve([], [])
      ).to.be.revertedWith("Empty arrays");
    });

    it("Should revert if non-admin tries to batch resolve", async function () {
      await expect(
        disputeEscrow.connect(sender).batchResolve([0], [true])
      ).to.be.revertedWith("Only admin can call this");
    });
  });

  describe("Auto Complete Payment", function () {
    beforeEach(async function () {
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
    });

    it("Should auto-complete payment after dispute deadline", async function () {
      // Fast forward past the dispute deadline (14 days)
      await time.increase(15 * 24 * 60 * 60);

      const receiverBalanceBefore = await ethers.provider.getBalance(receiver.address);

      await expect(disputeEscrow.connect(sender).autoCompletePayment(0))
        .to.emit(disputeEscrow, "PaymentCompleted")
        .withArgs(0, await time.latest() + 1);

      const receiverBalanceAfter = await ethers.provider.getBalance(receiver.address);
      expect(receiverBalanceAfter - receiverBalanceBefore).to.equal(PAYMENT_AMOUNT);

      const payment = await disputeEscrow.getPayment(0);
      expect(payment.status).to.equal(1); // Completed
    });

    it("Should revert if dispute window has not expired", async function () {
      await expect(
        disputeEscrow.connect(sender).autoCompletePayment(0)
      ).to.be.revertedWith("Dispute window has not expired");
    });

    it("Should revert if payment is not pending", async function () {
      await disputeEscrow.connect(sender).completePayment(0);

      await time.increase(15 * 24 * 60 * 60);

      await expect(
        disputeEscrow.connect(sender).autoCompletePayment(0)
      ).to.be.revertedWith("Payment is not pending");
    });
  });

  describe("Update Resolver", function () {
    it("Should allow owner to update resolver", async function () {
      await expect(disputeEscrow.connect(owner).updateResolver(resolver.address))
        .to.emit(disputeEscrow, "ResolverUpdated")
        .withArgs(owner.address, resolver.address);

      expect(await disputeEscrow.resolver()).to.equal(resolver.address);
    });

    it("Should revert if non-owner tries to update resolver", async function () {
      await expect(
        disputeEscrow.connect(sender).updateResolver(resolver.address)
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should revert if new resolver is zero address", async function () {
      await expect(
        disputeEscrow.connect(owner).updateResolver(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid resolver address");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Create multiple payments with different statuses
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
      await disputeEscrow.connect(sender).completePayment(1);
    });

    it("Should get all payments", async function () {
      const allPayments = await disputeEscrow.getAllPayments();
      expect(allPayments).to.have.lengthOf(2);
    });

    it("Should get payments by status", async function () {
      const pendingPayments = await disputeEscrow.getPaymentsByStatus(0);
      const completedPayments = await disputeEscrow.getPaymentsByStatus(1);

      expect(pendingPayments).to.have.lengthOf(1);
      expect(completedPayments).to.have.lengthOf(1);
    });

    it("Should get sender payments", async function () {
      const senderPayments = await disputeEscrow.getSenderPayments(sender.address);
      expect(senderPayments).to.have.lengthOf(2);
      expect(senderPayments[0]).to.equal(0);
      expect(senderPayments[1]).to.equal(1);
    });

    it("Should get receiver payments", async function () {
      const receiverPayments = await disputeEscrow.getReceiverPayments(receiver.address);
      expect(receiverPayments).to.have.lengthOf(2);
    });
  });

  describe("Admin Whitelist", function () {
    it("Should allow admin to add another admin", async function () {
      await expect(disputeEscrow.connect(owner).addAdmin(resolver.address))
        .to.emit(disputeEscrow, "AdminAdded")
        .withArgs(resolver.address);

      expect(await disputeEscrow.isAdmin(resolver.address)).to.be.true;
    });

    it("Should allow admin to remove another admin", async function () {
      // First add resolver as admin
      await disputeEscrow.connect(owner).addAdmin(resolver.address);
      
      await expect(disputeEscrow.connect(owner).removeAdmin(resolver.address))
        .to.emit(disputeEscrow, "AdminRemoved")
        .withArgs(resolver.address);

      expect(await disputeEscrow.isAdmin(resolver.address)).to.be.false;
    });

    it("Should revert if non-admin tries to add admin", async function () {
      await expect(
        disputeEscrow.connect(sender).addAdmin(resolver.address)
      ).to.be.revertedWith("Only admin can call this");
    });

    it("Should revert if non-admin tries to remove admin", async function () {
      await expect(
        disputeEscrow.connect(sender).removeAdmin(owner.address)
      ).to.be.revertedWith("Only admin can call this");
    });

    it("Should revert if trying to add zero address as admin", async function () {
      await expect(
        disputeEscrow.connect(owner).addAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid admin address");
    });

    it("Should revert if trying to remove owner from admins", async function () {
      await expect(
        disputeEscrow.connect(owner).removeAdmin(owner.address)
      ).to.be.revertedWith("Cannot remove owner from admins");
    });

    it("Should revert if trying to add already existing admin", async function () {
      await expect(
        disputeEscrow.connect(owner).addAdmin(owner.address)
      ).to.be.revertedWith("Address is already an admin");
    });

    it("Should revert if trying to remove non-admin", async function () {
      await expect(
        disputeEscrow.connect(owner).removeAdmin(sender.address)
      ).to.be.revertedWith("Address is not an admin");
    });

    it("Should allow new admin to resolve disputes", async function () {
      // Add resolver as admin
      await disputeEscrow.connect(owner).addAdmin(resolver.address);
      
      // Create and dispute a payment
      await disputeEscrow.connect(sender).createPayment(receiver.address, {
        value: PAYMENT_AMOUNT,
      });
      await disputeEscrow.connect(sender).requestRefund(0, "Test dispute", "");

      // New admin should be able to resolve
      await expect(disputeEscrow.connect(resolver).resolveDispute(0, true))
        .to.emit(disputeEscrow, "DisputeResolved");
    });
  });
});

