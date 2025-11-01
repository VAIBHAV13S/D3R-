# D3R - Decentralized Disaster Relief

> Transparent, blockchain-based disaster relief platform with milestone tracking and IPFS verification

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)

## 🌟 Features

- **Transparent Donations** - All transactions recorded on blockchain
- **Milestone Tracking** - Funds released based on verified milestones
- **IPFS Storage** - Decentralized proof-of-work storage
- **Disaster Verification** - Oracle-based disaster validation
- **Real-time Updates** - Live campaign and donation tracking
- **Wallet Integration** - MetaMask and Web3 support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Foundry (for smart contracts)
- MetaMask browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/D3R.git
cd D3R

# Install all dependencies
npm run setup

# Setup environment variables
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# Edit .env files with your configuration
```

### Database Setup

```bash
cd backend

# Create database
createdb d3r

# Run migrations
npm run migrate

# Optional: Seed data
npm run db:seed
```

### Smart Contracts

```bash
# Install Foundry dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Deploy to testnet (Sepolia)
./script/deploy-testnet.sh
```

### Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start

# Or run both concurrently from root
npm run dev:all
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
D3R/
├── contracts/              # Solidity smart contracts
│   ├── DonationTracker.sol
│   ├── IPFSVerifier.sol
│   └── DisasterOracleMock.sol
├── backend/                # Node.js + Express API
│   ├── db/                 # Database layer
│   │   ├── migrations/     # Database migrations
│   │   ├── repos/          # Data repositories
│   │   └── schema.sql      # Database schema
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── tests/              # Backend tests
│   └── server-template.js  # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── script/                 # Deployment scripts
├── test/                   # Solidity tests
└── docs/                   # Documentation
```

## 🏗️ Architecture

### Tech Stack

**Smart Contracts**
- Solidity 0.8.19
- Foundry for testing and deployment
- OpenZeppelin contracts

**Backend**
- Node.js 18+
- Express.js
- PostgreSQL
- Winston (logging)
- JWT authentication
- IPFS (Pinata)

**Frontend**
- React 18
- React Router v6
- Zustand (state management)
- Ethers.js (Web3)
- React Testing Library

### System Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
┌──────▼──────┐ ┌───▼────────┐
│   Backend   │ │  Ethereum  │
│  (Express)  │ │  Network   │
└──────┬──────┘ └────────────┘
       │
┌──────▼──────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
       │
┌──────▼──────┐
│    IPFS     │
│  (Pinata)   │
└─────────────┘
```

## 🔧 Configuration

### Backend Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/d3r

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRY=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Contracts
DONATION_TRACKER_ADDRESS=0x...
IPFS_VERIFIER_ADDRESS=0x...
DISASTER_ORACLE_ADDRESS=0x...
```

### Frontend Environment Variables

```bash
# API
REACT_APP_API_URL=http://localhost:5000

# Contracts
REACT_APP_DONATION_TRACKER_ADDRESS=0x...
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# IPFS
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## 📚 API Documentation

### Authentication

```bash
POST /api/auth/nonce
POST /api/auth/verify
```

### Campaigns

```bash
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
POST   /api/campaigns/:id/cancel
```

### Donations

```bash
POST   /api/donations
GET    /api/campaigns/:id/donations
GET    /api/users/:wallet/donations
```

### Milestones

```bash
POST   /api/campaigns/:id/milestones
GET    /api/campaigns/:id/milestones
PUT    /api/milestones/:id/approve
POST   /api/milestones/:id/release-funds
```

### Health

```bash
GET    /api/health
GET    /api/db/health
```

For detailed API documentation, see [API.md](./docs/API.md)

## 🧪 Testing

### Smart Contracts

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testDonation

# Coverage
forge coverage
```

### Backend

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm run test:unit
npm run test:integration

# Watch mode
npm run test:watch
```

### Frontend

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 📦 Deployment

### Smart Contracts

```bash
# Deploy to Sepolia testnet
./script/deploy-testnet.sh

# Verify on Etherscan
forge verify-contract <ADDRESS> DonationTracker --chain sepolia
```

### Backend

```bash
# Build (if needed)
cd backend

# Run migrations
npm run migrate

# Start production server
npm start
```

### Frontend

```bash
cd frontend

# Build for production
npm run build

# Deploy to Netlify/Vercel
# Upload build/ folder
```

For detailed deployment instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🔐 Security

- JWT authentication for API endpoints
- Rate limiting on all routes
- Input validation and sanitization
- CORS configuration
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - D3R Contributors

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Chainlink for oracle infrastructure
- IPFS/Pinata for decentralized storage
- Foundry for development framework

## 📞 Support

- Documentation: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/D3R/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/D3R/discussions)

## 🗺️ Roadmap

- [x] Smart contract development
- [x] Backend API
- [x] Frontend application
- [x] Wallet integration
- [x] IPFS integration
- [ ] Mobile application
- [ ] Multi-chain support
- [ ] DAO governance
- [ ] Advanced analytics

---

**Built with ❤️ for disaster relief transparency**
