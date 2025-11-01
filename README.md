# 🌍 D3R - Decentralized Disaster Relief Platform

> **Transparent, Trustless, and Tamper-Proof Disaster Relief on the Blockchain**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Tests](https://github.com/yourusername/D3R/actions/workflows/tests.yml/badge.svg)](https://github.com/yourusername/D3R/actions)

## 🔍 Problem We're Solving

In traditional disaster relief efforts, donors often face critical challenges:
- **Lack of Transparency**: Donors can't track how their contributions are utilized
- **Delayed Aid**: Bureaucratic processes slow down fund distribution
- **Trust Issues**: No verifiable proof of how funds are spent
- **Inefficient Verification**: Manual verification of disaster claims is slow and prone to errors

D3R addresses these challenges by leveraging blockchain technology to create a transparent, efficient, and accountable disaster relief ecosystem.

## 🏗️ Technical Architecture

D3R is built on a robust, decentralized stack:

### Smart Contracts (Ethereum/Sepolia)
- **DonationTracker.sol**: Manages campaigns, donations, and fund distribution
- **IPFSVerifier.sol**: Handles decentralized storage proofs and verification
- **DisasterOracle.sol**: Validates disaster events through oracles

### Backend (Node.js/Express)
- RESTful API for frontend interaction
- IPFS integration for decentralized storage
- JWT-based authentication
- Rate limiting and security middleware

### Frontend (React)
- Responsive, mobile-first design
- Web3 integration with MetaMask
- Real-time updates via WebSocket
- Interactive dashboards for donors and NGOs

### Storage
- **IPFS**: Decentralized file storage for proofs and documents
- **PostgreSQL**: Relational database for user data and metadata

## 🎯 Solution

D3R implements a transparent, multi-tiered approach to disaster relief:

1. **Disaster Verification**
   - Community-reported disasters
   - Oracle-verified events
   - Transparent validation process

2. **Campaign Creation**
   - Verified NGOs create campaigns with clear milestones
   - Smart contracts hold funds in escrow
   - Transparent fund allocation

3. **Donation Process**
   - Cryptocurrency donations via MetaMask
   - Real-time tracking of funds
   - Tax-deductible receipts (where applicable)

4. **Milestone Execution**
   - NGOs submit proof of work
   - Community voting on milestone completion
   - Automated fund release upon verification

## 🚀 Quick Start

## 🖥️ Backend Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (with PostGIS extension)
- Foundry (for smart contract interaction)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/D3R.git
   cd D3R/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   # Database
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=d3r_db
   DB_HOST=localhost
   DB_PORT=5432
   
   # Blockchain
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=your_private_key
   
   # Contracts
   DONATION_TRACKER_ADDRESS=0x...
   IPFS_VERIFIER_ADDRESS=0x...
   DISASTER_ORACLE_ADDRESS=0x...
   
   # JWT
   JWT_SECRET=your_jwt_secret
   
   # IPFS (Pinata)
   PINATA_API_KEY=your_pinata_key
   PINATA_SECRET_API_KEY=your_pinata_secret
   IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
   ```

4. **Database Setup**
   ```bash
   # Create and migrate database
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   
   # Seed initial data (optional)
   npx sequelize-cli db:seed:all
   ```

5. **Start the backend server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🖥️ Frontend Setup

### Prerequisites
- Node.js 16+
- MetaMask browser extension

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:4000
   REACT_APP_INFURA_ID=your_infura_id
   REACT_APP_NETWORK_ID=11155111  # Sepolia Testnet
   REACT_APP_DONATION_TRACKER_ADDRESS=0x...
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   This will open the app in your default browser at `http://localhost:3000`

## 🔄 Connecting Frontend and Backend

1. **API Integration**
   - The frontend communicates with the backend via REST API endpoints
   - All API routes are prefixed with `/api`
   - Authentication is handled via JWT tokens

2. **Blockchain Interaction**
   - Frontend uses Web3.js/Ethers.js to interact with smart contracts
   - MetaMask is required for signing transactions
   - Contract addresses must match between frontend and backend

3. **Environment Variables**
   - Ensure contract addresses are consistent between:
     - Backend `.env`
     - Frontend `.env.local`
     - Deployed contracts

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up a production database
2. Configure environment variables in production
3. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "d3r-backend" -- start
   ```

### Frontend Deployment
Build for production:
```bash
cd frontend
npm run build
```

Deploy the `build` folder to your preferred static hosting (Vercel, Netlify, etc.)
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
