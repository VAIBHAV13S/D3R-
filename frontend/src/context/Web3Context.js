// Enhanced Web3 context with MetaMask integration, authentication, and transaction support
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import api from '../config/api';

// Network configurations
const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in decimal
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'], // Replace with your Infura project ID
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
};

export const Web3Context = createContext({
  // Web3 State
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  balance: null,
  isConnected: false,
  isAuthenticated: false,
  user: null,
  
  // Methods
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchChain: async () => {},
  sendTransaction: async () => {},
  signIn: async () => {},
  signOut: () => {},
  getNonce: async () => {},
  checkAuth: async () => {},
  
  // Loading States
  isLoading: false,
  error: null,
});

export function Web3Provider({ children }) {
  // Web3 State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);

  const isConnected = !!account;

  // Fetch balance when account or chainId changes
  const fetchBalance = useCallback(async (addr) => {
    if (!window.ethereum || !addr) return;
    try {
      const bal = await window.ethereum.request({ method: 'eth_getBalance', params: [addr, 'latest'] });
      setBalance(bal ? (parseInt(bal, 16) / 1e18).toFixed(4) : null);
    } catch (e) {
      console.warn('Failed to fetch balance:', e);
      setBalance(null);
    }
  }, []);

  // Get nonce from backend
  const getNonce = useCallback(async (walletAddress) => {
    try {
      const response = await api.post('/auth/nonce', { walletAddress });
      return response.data.nonce;
    } catch (error) {
      console.error('Error getting nonce:', error);
      throw new Error('Failed to get authentication nonce');
    }
  }, []);

  // Sign in with wallet and get JWT
  const signIn = useCallback(async (walletAddress, signature, message) => {
    try {
      const response = await api.post('/auth/verify', {
        walletAddress,
        signature,
        message
      });
      
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      setIsAuthenticated(true);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error(error.response?.data?.error || 'Authentication failed');
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    // Don't call signOut here to avoid circular dependency
  }, []);

  // Sign out
  const signOut = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    disconnectWallet();
  }, [disconnectWallet]);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // Here you might want to add a /me endpoint to validate the token
      // For now, we'll just check if we have a token
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      signOut();
      return false;
    }
  }, [signOut]);

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS.sepolia.chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS.sepolia],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          setError('Failed to add Sepolia network to MetaMask');
          return false;
        }
      }
      console.error('Error switching to Sepolia:', switchError);
      setError('Failed to switch to Sepolia network');
      return false;
    }
  };

  // Connect wallet and authenticate
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const msg = 'No wallet detected. Please install MetaMask.';
      setError(msg);
      throw new Error(msg);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      if (!walletAddress) throw new Error('No wallet address found');

      // Switch to Sepolia testnet
      const switched = await switchToSepolia();
      if (!switched) {
        throw new Error('Failed to switch to Sepolia testnet');
      }
      
      // Get nonce from backend
      const nonce = await getNonce(walletAddress);
      
      // Sign message
      const message = `Sign in to D3R. Nonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      
      // Authenticate with backend
      const user = await signIn(walletAddress, signature, message);
      
      // Update Web3 state
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      setAccount(walletAddress);
      setChainId(chain);
      setProvider(window.ethereum);
      setSigner({ address: walletAddress });
      await fetchBalance(walletAddress);
      
      return user;
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      const msg = err.code === 4001 
        ? 'User rejected the request' 
        : err.message || 'Failed to connect wallet';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance, getNonce, signIn]);


  const switchChain = useCallback(async (targetChainId) => {
    if (!window.ethereum) throw new Error('No wallet detected');
    try {
      setError(null);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        // Chain not added; could prompt user to add it
        const msg = 'Chain not added to wallet';
        setError(msg);
        throw new Error(msg);
      } else if (err.code === 4001) {
        const msg = 'User rejected chain switch';
        setError(msg);
        throw new Error(msg);
      } else {
        setError(err.message || 'Failed to switch chain');
        throw err;
      }
    }
  }, []);

  const sendTransaction = useCallback(async (txParams) => {
    if (!window.ethereum || !account) throw new Error('Wallet not connected');
    try {
      setError(null);
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: account, ...txParams }],
      });
      return txHash;
    } catch (err) {
      const msg = err.code === 4001 ? 'User rejected transaction' : err.message || 'Transaction failed';
      setError(msg);
      throw new Error(msg);
    }
  }, [account]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authToken) {
        try {
          await checkAuth();
        } catch (error) {
          console.error('Auth initialization error:', error);
          signOut();
        }
      }
    };
    
    initAuth();
  }, [authToken, checkAuth, signOut]);

  // Handle wallet events
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = async (accounts) => {
      const addr = accounts?.[0] || null;
      setAccount(addr);
      
      if (addr) {
        await fetchBalance(addr);
        // If user was authenticated but wallet changed, sign them out
        if (isAuthenticated && user?.walletAddress?.toLowerCase() !== addr.toLowerCase()) {
          signOut();
        }
      } else {
        setBalance(null);
        setSigner(null);
        signOut();
      }
    };
    
    const handleChainChanged = (hex) => {
      setChainId(hex);
      if (account) fetchBalance(account);
    };
    
    const handleDisconnect = () => {
      setAccount(null);
      setBalance(null);
      setSigner(null);
      signOut();
    };
    
    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);
    window.ethereum.on?.('disconnect', handleDisconnect);
    
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
      window.ethereum?.removeListener?.('disconnect', handleDisconnect);
    };
  }, [account, fetchBalance, isAuthenticated, signOut, user?.walletAddress]);

  const value = useMemo(
    () => ({
      // Web3 State
      provider,
      signer,
      account,
      chainId,
      balance,
      isConnected,
      
      // Auth State
      isAuthenticated,
      user,
      
      // Methods
      connectWallet,
      disconnectWallet,
      switchChain,
      sendTransaction,
      signIn,
      signOut,
      getNonce,
      checkAuth,
      
      // Loading States
      isLoading,
      error,
    }),
    [
      provider,
      signer,
      account,
      chainId,
      balance,
      isConnected,
      isAuthenticated,
      user,
      connectWallet,
      disconnectWallet,
      switchChain,
      sendTransaction,
      signIn,
      signOut,
      getNonce,
      checkAuth,
      isLoading,
      error,
    ]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
