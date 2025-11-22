# x402 Refund & Dispute Layer

A secure escrow and dispute resolution system built on top of x402 payments for the Polygon network. This project provides a trust layer for crypto commerce by enabling refunds and automated dispute resolution.

## Project Overview

**Problem:** Crypto payments are final — users can't request refunds. Disputes (e.g., seller never shipped, wrong product, duplicate payment) are difficult to resolve. Merchants and platforms need a trust layer to handle refunds without centralizing funds.

**Solution:** A Refund & Dispute Layer on top of x402 that:
- Holds funds temporarily in a smart contract (escrow)
- Tracks payment status and user claims
- Provides simple dispute resolution logic
- Allows automatic or semi-automatic refunds
- Integrates AI agents to suggest dispute outcomes

## Links

- [**Live Demo**](https://x402-refund-dispute-layer.vercel.app/)
- **Video Demo**: [TODO]
- [**Smart Contract (PolygonScan)**](https://amoy.polygonscan.com/address/0x106062376b854ac79b7bccb640ee63b4cfdd1cd2#code)

## Features

### Core Functionality
- **Payment Escrow**: Secure smart contract escrow for payments
- **Refund Requests**: Users can request refunds within a dispute window
- **Dispute Resolution**: Admin/AI-powered dispute resolution system
- **Batch Processing**: Resolve multiple disputes efficiently
- **Auto-completion**: Payments auto-complete after dispute deadline
- **Real-time Updates**: Live payment status tracking

### Technical Features
- Built with **Hardhat** for smart contract development
- Deployed on **Polygon Amoy Testnet**
- Modern Next.js 14 frontend with App Router
- Web3 integration with wagmi v2 and RainbowKit
- Simulated AI dispute analysis with rule-based logic
- Comprehensive smart contract tests (>80% coverage)

## Architecture

### Smart Contracts
- **DisputeEscrow.sol**: Main escrow contract with all payment and dispute logic
- Payment statuses: Pending, Completed, Disputed, Refunded, Rejected
- Role-based access control (Owner, Resolver)
- 14-day dispute window with auto-completion

### Frontend
- **Dashboard**: View all payments with filtering
- **Create Payment**: Send escrowed payments
- **Refund Interface**: Request refunds with reasons
- **Admin Panel**: AI-assisted dispute resolution

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Polygon Amoy testnet MATIC (get from [faucet](https://faucet.polygon.technology/))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd x402-Refund-Dispute-Layer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Smart Contract Deployment
PRIVATE_KEY=your_private_key_here
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Deploy Smart Contracts

1. **Compile contracts**
```bash
npm run compile
```

2. **Run tests**
```bash
npm run test
```

3. **Deploy to Polygon Amoy**
```bash
npm run deploy
```

4. **Verify on PolygonScan**
```bash
npm run verify -- <CONTRACT_ADDRESS>
```

5. **Update .env** with the deployed contract address

### Run Frontend

1. **Start development server**
```bash
npm run dev
```

2. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

3. **Connect wallet**
- Connect MetaMask to Polygon Amoy testnet
- Get test POL from faucet if needed

## Usage Guide

### For Buyers/Senders

1. **Create Payment**
   - Click "Create New Payment"
   - Enter receiver address and amount
   - Confirm transaction - funds are now in escrow

2. **Request Refund**
   - View your payment in the dashboard
   - Click "Request Refund" if needed
   - Provide reason and evidence
   - Submit for dispute resolution

3. **Complete Payment**
   - Click "Complete Payment" when satisfied
   - Funds are released to merchant

### For Merchants/Receivers

1. **Monitor Payments**
   - View incoming payments in dashboard
   - Check payment status

2. **Complete Payments**
   - Release funds from escrow when ready
   - Or wait for auto-completion after 14 days

### For Admins/Resolvers

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Must be owner or resolver address

2. **Review Disputes**
   - View all disputed payments
   - See AI analysis and recommendations
   - Confidence scores and reasoning

3. **Resolve Disputes**
   - Approve refunds → funds return to sender
   - Reject refunds → funds go to receiver
   - Use batch operations for efficiency

## AI Dispute Resolution

The system includes a simulated AI agent that analyzes disputes and provides recommendations:

### Analysis Factors
- Dispute reason keywords
- Pattern matching with common cases
- Confidence scoring (50-90%)
- Detailed reasoning steps

### Common Scenarios
- **High confidence approval**: Never shipped, defective, wrong item
- **High confidence rejection**: Changed mind, buyer's remorse
- **Edge cases**: Analyzed with context-specific logic

### Override Capability
Admins can always override AI suggestions based on additional information or judgment.

## 🧪 Testing

### Smart Contract Tests
```bash
npm run test
```

Comprehensive test coverage including:
- Payment creation and completion
- Refund requests and validation
- Dispute resolution (approve/reject)
- Batch operations
- Access control
- Edge cases and error handling

### Manual Testing
1. Deploy contracts locally or on testnet
2. Create test payments between different accounts
3. Request refunds with various reasons
4. Test dispute resolution from admin panel
5. Verify batch operations

## Project Structure

```
x402-Refund-Dispute-Layer/
├── contracts/              # Solidity smart contracts
│   └── DisputeEscrow.sol  # Main escrow contract
├── scripts/               # Deployment scripts
│   └── deploy.ts          # Deploy to Polygon Amoy
├── test/                  # Contract tests
│   └── DisputeEscrow.test.ts
├── app/                   # Next.js pages
│   ├── page.tsx          # Dashboard
│   ├── admin/page.tsx    # Admin panel
│   ├── layout.tsx        # Root layout
│   └── providers.tsx     # Web3 providers
├── components/            # React components
│   ├── PaymentList.tsx
│   ├── PaymentCard.tsx
│   ├── RefundModal.tsx
│   ├── DisputeResolver.tsx
│   ├── CreatePaymentForm.tsx
│   ├── StatusBadge.tsx
│   └── ConnectWallet.tsx
├── lib/                   # Utilities and hooks
│   ├── config/
│   │   ├── wagmi.ts      # Wagmi configuration
│   │   └── contracts.ts   # Contract ABI and address
│   ├── hooks/            # Custom React hooks
│   │   ├── usePayments.ts
│   │   ├── useCreatePayment.ts
│   │   ├── useRefundRequest.ts
│   │   ├── useResolveDispute.ts
│   │   └── useCompletePayment.ts
│   └── types.ts          # TypeScript types
├── hardhat.config.ts     # Hardhat configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔧 Technology Stack

### Smart Contracts
- **Solidity 0.8.24**: Smart contract language
- **Hardhat**: Development environment
- **Ethers.js v6**: Ethereum library
- **Hardhat Toolbox**: Testing utilities

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **wagmi v2**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **RainbowKit**: Wallet connection UI
- **TanStack Query**: Data fetching and caching

### Blockchain
- **Polygon Amoy Testnet**: Layer 2 scaling solution
- **ChainId**: 80002
- **RPC**: https://rpc-amoy.polygon.technology/

## ETHGlobal Track Eligibility

### Polygon Track 
- Extends x402 protocol with refund/dispute capability
- Deployed to Polygon Network (Amoy testnet)
- Innovative payment use case (escrow + disputes)
- Combines payment infrastructure with agentic tooling
- GitHub repository with README and setup instructions
- Demo video ready

### Hardhat Track 
- All smart contracts developed using Hardhat
- Comprehensive test suite using Hardhat framework
- Deployment scripts using Hardhat
- Contract verification via Hardhat plugins
- Documentation of Hardhat usage

## Security Considerations

### Smart Contract Security
- Role-based access control
- Reentrancy protection via checks-effects-interactions pattern
- Input validation on all functions
- Time-locked operations with deadlines
- Comprehensive test coverage

### Frontend Security
- Client-side validation
- Transaction confirmation dialogs
- Address validation (isAddress checks)
- Error handling for failed transactions

### Production Recommendations
- Complete security audit before mainnet deployment
- Multi-sig wallet for contract ownership
- Gradual rollout with transaction limits
- Bug bounty program
- Emergency pause functionality

## Smart Contract Functions

### User Functions
- `createPayment(address _receiver)`: Create escrowed payment
- `completePayment(uint256 _paymentId)`: Release funds to receiver
- `requestRefund(uint256 _paymentId, string _reason, string _evidence)`: Request refund
- `autoCompletePayment(uint256 _paymentId)`: Auto-complete after deadline

### Admin Functions
- `resolveDispute(uint256 _paymentId, bool _approve)`: Resolve single dispute
- `batchResolve(uint256[] _paymentIds, bool[] _approvals)`: Batch resolution
- `updateResolver(address _newResolver)`: Change resolver address

### View Functions
- `getAllPayments()`: Get all payments
- `getPayment(uint256 _paymentId)`: Get specific payment
- `getPaymentsByStatus(PaymentStatus _status)`: Filter by status
- `getSenderPayments(address _sender)`: Get user's sent payments
- `getReceiverPayments(address _receiver)`: Get user's received payments

## Contributing

This is a hackathon project for ETHGlobal. Contributions, issues, and feature requests are welcome!

## License

MIT License - feel free to use this code for your own projects

Built with ❤️ for ETHGlobal | Polygon Track | Hardhat Track
