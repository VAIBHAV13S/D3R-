# D3R Frontend

React-based frontend for the Decentralized Disaster Relief (D3R) platform.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
npm run build
```

Builds the app for production to the `build` folder.

## Environment Setup

1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Fill in the required values:
- Contract addresses (from deployment)
- RPC URL (Infura/Alchemy)
- IPFS gateway URL

## Available Scripts

### `npm start`
Runs the app in development mode with hot reload.

### `npm run build`
Creates an optimized production build.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run lint`
Checks code for linting errors.

### `npm run lint:fix`
Automatically fixes linting errors where possible.

### `npm run format`
Formats code using Prettier.

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable components
│   │   ├── DashboardLayout.js
│   │   ├── DonateModal.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingButton.jsx
│   │   ├── MilestoneSubmission.jsx
│   │   └── SkeletonLoader.jsx
│   ├── context/           # React contexts
│   │   ├── ToastContext.js
│   │   └── Web3Context.js
│   ├── hooks/             # Custom hooks
│   │   └── useWeb3.js
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Campaigns.jsx
│   │   ├── CampaignDetail.jsx
│   │   ├── CreateCampaign.jsx
│   │   └── MyDashboard.jsx
│   ├── utils/             # Utility functions
│   │   └── validation.js
│   ├── App.jsx            # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── package.json
└── README.md
```

## Features

### ✅ Implemented
- Wallet connection (MetaMask)
- Campaign browsing and filtering
- Campaign creation
- Donation flow
- Milestone submission
- User dashboard
- Error boundaries
- Loading states
- Form validation
- Rate limiting awareness

### 🚧 In Progress
- Real Web3 contract integration
- Transaction confirmation tracking
- IPFS image display
- Search functionality

### 📋 Planned
- Mobile responsive improvements
- Dark mode
- Notifications
- Advanced analytics
- Multi-language support

## Web3 Integration

### Wallet Connection
```javascript
import { useWeb3 } from './hooks/useWeb3';

function MyComponent() {
  const { account, isConnected, connectWallet } = useWeb3();
  
  return (
    <button onClick={connectWallet}>
      {isConnected ? account : 'Connect Wallet'}
    </button>
  );
}
```

### Sending Transactions
```javascript
const { sendTransaction } = useWeb3();

const txHash = await sendTransaction({
  to: contractAddress,
  value: ethers.utils.parseEther('0.1'),
  data: encodedData,
});
```

## API Integration

The frontend proxies API requests to the backend (configured in `package.json`):

```javascript
// Development: proxied to http://localhost:5000
fetch('/api/campaigns')

// Production: use REACT_APP_API_URL
fetch(`${process.env.REACT_APP_API_URL}/api/campaigns`)
```

## Styling

Currently using inline styles for rapid development. Consider migrating to:
- CSS Modules
- Styled Components
- Tailwind CSS
- Material-UI

## Testing

### Unit Tests
```bash
npm test
```

### Component Tests
```javascript
import { render, screen } from '@testing-library/react';
import Home from './pages/Home';

test('renders home page', () => {
  render(<Home />);
  expect(screen.getByText(/D3R/i)).toBeInTheDocument();
});
```

## Deployment

### Netlify
```bash
npm run build
# Deploy build/ folder
```

### Vercel
```bash
vercel --prod
```

### Traditional Hosting
```bash
npm run build
# Upload build/ folder to web server
```

## Environment Variables

### Development
Create `.env.local` with:
```
REACT_APP_API_URL=http://localhost:5000
```

### Production
Set in hosting platform:
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment Variables
- AWS: CloudFormation/Elastic Beanstalk config

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

### Optimization Tips
- Code splitting with React.lazy()
- Image optimization
- CDN for static assets
- Service worker for caching
- Bundle analysis with `npm run build`

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear build cache
rm -rf build
npm run build
```

### MetaMask Not Detected
- Ensure MetaMask extension is installed
- Check browser console for errors
- Try refreshing the page

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Format code: `npm run format`
6. Submit PR

## Resources

- [React Documentation](https://react.dev)
- [Create React App](https://create-react-app.dev)
- [React Router](https://reactrouter.com)
- [MetaMask Docs](https://docs.metamask.io)
- [Ethers.js](https://docs.ethers.org)

## License

MIT
