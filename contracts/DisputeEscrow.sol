// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DisputeEscrow
 * @dev Escrow contract for x402 payments with refund and dispute resolution capabilities
 */
contract DisputeEscrow {
    enum PaymentStatus {
        Pending,
        Completed,
        Disputed,
        Refunded,
        Rejected
    }

    struct Payment {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;
        PaymentStatus status;
        uint256 timestamp;
        uint256 disputeDeadline;
        string disputeReason;
        string evidence;
    }

    // State variables
    address public owner;
    address public resolver;
    uint256 public paymentCounter;
    uint256 public constant DISPUTE_WINDOW = 7 days;
    uint256 public constant AUTO_COMPLETE_DELAY = 14 days;

    // Mappings
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public senderPayments;
    mapping(address => uint256[]) public receiverPayments;

    // Events
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentCompleted(uint256 indexed paymentId, uint256 timestamp);

    event RefundRequested(
        uint256 indexed paymentId,
        address indexed requester,
        string reason,
        uint256 timestamp
    );

    event DisputeResolved(
        uint256 indexed paymentId,
        bool approved,
        PaymentStatus newStatus,
        uint256 timestamp
    );

    event PaymentRefunded(
        uint256 indexed paymentId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event ResolverUpdated(address indexed oldResolver, address indexed newResolver);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyResolver() {
        require(
            msg.sender == resolver || msg.sender == owner,
            "Only resolver can call this"
        );
        _;
    }

    modifier paymentExists(uint256 _paymentId) {
        require(_paymentId < paymentCounter, "Payment does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        resolver = msg.sender;
        paymentCounter = 0;
    }

    /**
     * @dev Create a new escrowed payment
     * @param _receiver The address that will receive the payment
     */
    function createPayment(address _receiver) external payable returns (uint256) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_receiver != address(0), "Invalid receiver address");
        require(_receiver != msg.sender, "Cannot send payment to yourself");

        uint256 paymentId = paymentCounter;
        paymentCounter++;

        Payment storage newPayment = payments[paymentId];
        newPayment.id = paymentId;
        newPayment.sender = msg.sender;
        newPayment.receiver = _receiver;
        newPayment.amount = msg.value;
        newPayment.status = PaymentStatus.Pending;
        newPayment.timestamp = block.timestamp;
        newPayment.disputeDeadline = block.timestamp + AUTO_COMPLETE_DELAY;

        senderPayments[msg.sender].push(paymentId);
        receiverPayments[_receiver].push(paymentId);

        emit PaymentCreated(paymentId, msg.sender, _receiver, msg.value, block.timestamp);

        return paymentId;
    }

    /**
     * @dev Complete a payment and release funds to receiver
     * @param _paymentId The ID of the payment to complete
     */
    function completePayment(uint256 _paymentId)
        external
        paymentExists(_paymentId)
    {
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.sender || msg.sender == payment.receiver,
            "Not authorized"
        );
        require(payment.status == PaymentStatus.Pending, "Payment is not pending");

        payment.status = PaymentStatus.Completed;

        (bool success, ) = payment.receiver.call{value: payment.amount}("");
        require(success, "Transfer failed");

        emit PaymentCompleted(_paymentId, block.timestamp);
    }

    /**
     * @dev Request a refund for a payment
     * @param _paymentId The ID of the payment to refund
     * @param _reason The reason for the refund request
     * @param _evidence Optional evidence supporting the refund
     */
    function requestRefund(
        uint256 _paymentId,
        string calldata _reason,
        string calldata _evidence
    ) external paymentExists(_paymentId) {
        Payment storage payment = payments[_paymentId];
        require(msg.sender == payment.sender, "Only sender can request refund");
        require(payment.status == PaymentStatus.Pending, "Payment is not pending");
        require(
            block.timestamp <= payment.disputeDeadline,
            "Dispute window has expired"
        );
        require(bytes(_reason).length > 0, "Reason is required");

        payment.status = PaymentStatus.Disputed;
        payment.disputeReason = _reason;
        payment.evidence = _evidence;

        emit RefundRequested(_paymentId, msg.sender, _reason, block.timestamp);
    }

    /**
     * @dev Resolve a dispute (approve or reject refund)
     * @param _paymentId The ID of the payment to resolve
     * @param _approve True to approve refund, false to reject
     */
    function resolveDispute(uint256 _paymentId, bool _approve)
        public
        onlyResolver
        paymentExists(_paymentId)
    {
        Payment storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Disputed, "Payment is not disputed");

        if (_approve) {
            payment.status = PaymentStatus.Refunded;
            (bool success, ) = payment.sender.call{value: payment.amount}("");
            require(success, "Refund transfer failed");
            emit PaymentRefunded(_paymentId, payment.sender, payment.amount, block.timestamp);
        } else {
            payment.status = PaymentStatus.Rejected;
            (bool success, ) = payment.receiver.call{value: payment.amount}("");
            require(success, "Payment transfer failed");
        }

        emit DisputeResolved(_paymentId, _approve, payment.status, block.timestamp);
    }

    /**
     * @dev Batch resolve multiple disputes
     * @param _paymentIds Array of payment IDs to resolve
     * @param _approvals Array of approval decisions (true = refund, false = reject)
     */
    function batchResolve(uint256[] calldata _paymentIds, bool[] calldata _approvals)
        external
        onlyResolver
    {
        require(_paymentIds.length == _approvals.length, "Array length mismatch");
        require(_paymentIds.length > 0, "Empty arrays");

        for (uint256 i = 0; i < _paymentIds.length; i++) {
            uint256 paymentId = _paymentIds[i];
            if (paymentId < paymentCounter && payments[paymentId].status == PaymentStatus.Disputed) {
                resolveDispute(paymentId, _approvals[i]);
            }
        }
    }

    /**
     * @dev Auto-complete a payment after the dispute deadline
     * @param _paymentId The ID of the payment to auto-complete
     */
    function autoCompletePayment(uint256 _paymentId) external paymentExists(_paymentId) {
        Payment storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Pending, "Payment is not pending");
        require(
            block.timestamp > payment.disputeDeadline,
            "Dispute window has not expired"
        );

        payment.status = PaymentStatus.Completed;

        (bool success, ) = payment.receiver.call{value: payment.amount}("");
        require(success, "Transfer failed");

        emit PaymentCompleted(_paymentId, block.timestamp);
    }

    /**
     * @dev Update the resolver address
     * @param _newResolver The new resolver address
     */
    function updateResolver(address _newResolver) external onlyOwner {
        require(_newResolver != address(0), "Invalid resolver address");
        address oldResolver = resolver;
        resolver = _newResolver;
        emit ResolverUpdated(oldResolver, _newResolver);
    }

    /**
     * @dev Get payment details
     * @param _paymentId The ID of the payment
     */
    function getPayment(uint256 _paymentId)
        external
        view
        paymentExists(_paymentId)
        returns (
            uint256 id,
            address sender,
            address receiver,
            uint256 amount,
            PaymentStatus status,
            uint256 timestamp,
            uint256 disputeDeadline,
            string memory disputeReason,
            string memory evidence
        )
    {
        Payment storage payment = payments[_paymentId];
        return (
            payment.id,
            payment.sender,
            payment.receiver,
            payment.amount,
            payment.status,
            payment.timestamp,
            payment.disputeDeadline,
            payment.disputeReason,
            payment.evidence
        );
    }

    /**
     * @dev Get all payment IDs for a sender
     * @param _sender The sender address
     */
    function getSenderPayments(address _sender) external view returns (uint256[] memory) {
        return senderPayments[_sender];
    }

    /**
     * @dev Get all payment IDs for a receiver
     * @param _receiver The receiver address
     */
    function getReceiverPayments(address _receiver) external view returns (uint256[] memory) {
        return receiverPayments[_receiver];
    }

    /**
     * @dev Get all payments (for dashboard)
     */
    function getAllPayments() external view returns (Payment[] memory) {
        Payment[] memory allPayments = new Payment[](paymentCounter);
        for (uint256 i = 0; i < paymentCounter; i++) {
            allPayments[i] = payments[i];
        }
        return allPayments;
    }

    /**
     * @dev Get payments by status
     * @param _status The status to filter by
     */
    function getPaymentsByStatus(PaymentStatus _status)
        external
        view
        returns (Payment[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < paymentCounter; i++) {
            if (payments[i].status == _status) {
                count++;
            }
        }

        Payment[] memory filtered = new Payment[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < paymentCounter; i++) {
            if (payments[i].status == _status) {
                filtered[index] = payments[i];
                index++;
            }
        }

        return filtered;
    }
}

