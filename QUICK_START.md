# Quick Start Guide

Get up and running in 5 minutes!

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PRIVATE_KEY=your_private_key_without_0x
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 3. Get Test MATIC
Get free testnet MATIC from: https://faucet.polygon.technology/

## 4. Test Smart Contracts
```bash
npm run test
```

## 5. Deploy to Polygon Amoy
```bash
npm run compile
npm run deploy
```

Copy the deployed contract address and add to `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

## 6. Verify Contract (Optional)
```bash
npx hardhat verify --network polygonAmoy 0xYourContractAddress
```

## 7. Start Frontend
```bash
npm run dev
```

Open http://localhost:3000

## 8. Test the App

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Create Payment** - Send escrowed payment to another address
3. **Request Refund** - Submit a refund request on your payment
4. **Admin Panel** - Visit `/admin` to resolve disputes

## Need More Help?

- **Full Documentation**: See [README.md](./README.md)
- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Demo Script**: See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

## Common Issues

**Tests fail?**
- Make sure you ran `npm install`
- Check Node.js version (18+)

**Deployment fails?**
- Verify you have test MATIC
- Check your private key in `.env`
- Try public RPC if custom RPC fails

**Frontend not connecting?**
- Ensure contract address is in `.env`
- Check you're on Polygon Amoy in MetaMask
- Verify WalletConnect Project ID

**Can't resolve disputes?**
- Make sure you're connected with the deployer wallet
- Check you're on the `/admin` page
- Verify there are disputed payments

## Project Structure

```
├── contracts/          # Smart contracts
├── test/              # Contract tests  
├── scripts/           # Deployment scripts
├── app/               # Next.js pages
├── components/        # React components
├── lib/               # Hooks and utilities
└── README.md          # Full documentation
```

## Key Features Implemented

✅ Escrow smart contract with dispute resolution  
✅ 14-day refund window  
✅ AI-powered dispute suggestions  
✅ Batch dispute resolution  
✅ Auto-complete after deadline  
✅ Full test coverage  
✅ Modern React frontend  
✅ Real-time status updates  
✅ Admin panel with analytics  

## Demo Video Tips

1. Record in 1920x1080 resolution
2. Show payment creation → refund request → AI resolution
3. Highlight the simulated AI analysis
4. Demonstrate batch operations
5. Keep under 5 minutes
6. See DEMO_SCRIPT.md for detailed guide

## For ETHGlobal Judges

**Polygon Track:**
- Extends x402 with refund/dispute capability ✓
- Deployed on Polygon network ✓
- Combines payments with agentic tooling ✓

**Hardhat Track:**
- All contracts built with Hardhat ✓
- Comprehensive test suite ✓
- Deployment scripts included ✓

---

**Have fun building!** 🚀

If you get stuck, check the detailed guides or the inline code comments.

