# Testing Guide

## Overview

The D3R project has comprehensive testing across all layers:
- ✅ **Solidity Tests** - Smart contract tests (6 passing)
- ✅ **Backend Tests** - API and unit tests
- ✅ **Frontend Tests** - Component and integration tests

## Test Structure

```
D3R-main/
├── test/                          # Solidity tests
│   ├── DonationTrackerTest.t.sol
│   └── IPFSVerifierTest.t.sol
├── backend/
│   └── tests/
│       ├── unit/                  # Unit tests
│       │   ├── errorHandler.test.js
│       │   └── jwt.test.js
│       └── integration/           # Integration tests
│           ├── health.test.js
│           └── auth.test.js
└── frontend/
    └── src/
        ├── components/__tests__/  # Component tests
        │   ├── ErrorBoundary.test.js
        │   └── LoadingButton.test.js
        └── utils/__tests__/       # Utility tests
            └── validation.test.js
```

## Backend Testing

### Setup

Dependencies already added to `package.json`:
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Running Tests

```bash
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Writing Backend Tests

#### Unit Test Example
```javascript
// tests/unit/myModule.test.js
describe('MyModule', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

#### Integration Test Example
```javascript
// tests/integration/api.test.js
const request = require('supertest');
const { app } = require('../../server-template');

describe('API Endpoint', () => {
  it('should return 200', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### Test Coverage

Current backend tests:
- ✅ Error handler utilities
- ✅ JWT generation and verification
- ✅ Health check endpoints
- ✅ Authentication endpoints
- ✅ Rate limiting

## Frontend Testing

### Setup

Dependencies already included in `package.json`:
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1"
  }
}
```

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ErrorBoundary.test.js
```

### Writing Frontend Tests

#### Component Test Example
```javascript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### User Interaction Test
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

it('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Test Coverage

Current frontend tests:
- ✅ ErrorBoundary component
- ✅ LoadingButton component
- ✅ Validation utilities

## Solidity Testing

### Running Tests

```bash
# Run all Solidity tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testDonation

# Run with gas report
forge test --gas-report

# Run with coverage
forge coverage
```

### Current Tests

- ✅ DonationTracker contract (6 tests passing)
- ✅ IPFSVerifier contract

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install
      - run: cd frontend && npm test

  solidity-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge test
```

## Test Best Practices

### General

1. **Descriptive Names** - Test names should describe what they test
2. **Arrange-Act-Assert** - Structure tests clearly
3. **One Assertion** - Test one thing at a time
4. **Independent Tests** - Tests shouldn't depend on each other
5. **Clean Up** - Reset state after tests

### Backend

1. **Mock External Services** - Don't call real APIs
2. **Test Error Cases** - Not just happy paths
3. **Use Supertest** - For API endpoint testing
4. **Database Isolation** - Use test database
5. **Clean Up Resources** - Close connections

### Frontend

1. **Test User Behavior** - Not implementation details
2. **Use Testing Library** - Query by accessibility
3. **Mock API Calls** - Don't hit real backend
4. **Test Accessibility** - Use semantic queries
5. **Avoid Snapshot Tests** - Unless necessary

### Solidity

1. **Test Edge Cases** - Boundary conditions
2. **Test Reverts** - Expected failures
3. **Gas Optimization** - Track gas usage
4. **Fuzz Testing** - Random inputs
5. **Integration Tests** - Test contract interactions

## Coverage Goals

### Targets

- **Backend**: 80%+ coverage
- **Frontend**: 70%+ coverage
- **Solidity**: 90%+ coverage

### Checking Coverage

```bash
# Backend
cd backend && npm test -- --coverage

# Frontend
cd frontend && npm test -- --coverage

# Solidity
forge coverage
```

## Debugging Tests

### Backend

```bash
# Run single test file
npm test -- errorHandler.test.js

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend

```bash
# Run single test
npm test -- --testNamePattern="should render"

# Debug in browser
npm test -- --debug
```

### Solidity

```bash
# Verbose output
forge test -vvvv

# Trace specific test
forge test --match-test testDonation -vvvv
```

## Common Issues

### Backend

**Issue**: Tests timeout
```bash
# Increase timeout
jest.setTimeout(10000);
```

**Issue**: Database connection errors
```bash
# Use test database
DATABASE_URL=postgresql://localhost/d3r_test
```

### Frontend

**Issue**: Component not rendering
```javascript
// Wrap with required providers
render(
  <Web3Provider>
    <MyComponent />
  </Web3Provider>
);
```

**Issue**: Async updates
```javascript
// Use waitFor
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Solidity

**Issue**: Gas limit exceeded
```bash
# Increase gas limit
forge test --gas-limit 30000000
```

**Issue**: Fork tests failing
```bash
# Set RPC URL
forge test --fork-url $RPC_URL
```

## Next Steps

### Backend Tests to Add
- [ ] Campaign CRUD operations
- [ ] Donation creation
- [ ] Milestone submission
- [ ] File upload
- [ ] Database repositories

### Frontend Tests to Add
- [ ] Campaigns page
- [ ] Campaign detail page
- [ ] Donate modal
- [ ] Create campaign form
- [ ] Zustand stores

### Integration Tests to Add
- [ ] End-to-end user flows
- [ ] Smart contract integration
- [ ] IPFS upload flow
- [ ] Wallet connection

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [Foundry Testing](https://book.getfoundry.sh/forge/tests)

## Summary

✅ **Backend**: Jest + Supertest configured  
✅ **Frontend**: React Testing Library configured  
✅ **Solidity**: Foundry tests passing  
✅ **Examples**: Test files created  
✅ **Documentation**: Complete testing guide  

Testing infrastructure is ready for comprehensive test coverage!
