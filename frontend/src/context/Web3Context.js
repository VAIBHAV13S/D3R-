// Enhanced Web3 context with MetaMask integration, balance, signer, and transaction support
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const Web3Context = createContext({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  balance: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchChain: async () => {},
  sendTransaction: async () => {},
});

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

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

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const msg = 'No wallet detected. Please install MetaMask.';
      setError(msg);
      throw new Error(msg);
    }
    try {
      setError(null);
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      const addr = accs?.[0] || null;
      setAccount(addr);
      setChainId(chain || null);
      setProvider(window.ethereum);
      // Mock signer (in real app, use ethers.js BrowserProvider)
      setSigner({ address: addr });
      if (addr) fetchBalance(addr);
    } catch (err) {
      const msg = err.code === 4001 ? 'User rejected connection' : err.message || 'Failed to connect';
      setError(msg);
      throw new Error(msg);
    }
  }, [fetchBalance]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setProvider(null);
    setSigner(null);
    setError(null);
  }, []);

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

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accs) => {
      const addr = accs?.[0] || null;
      setAccount(addr);
      if (addr) {
        fetchBalance(addr);
      } else {
        setBalance(null);
        setSigner(null);
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
    };
    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);
    window.ethereum.on?.('disconnect', handleDisconnect);
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
      window.ethereum?.removeListener?.('disconnect', handleDisconnect);
    };
  }, [account, fetchBalance]);

  const value = useMemo(
    () => ({
      provider,
      signer,
      account,
      chainId,
      balance,
      isConnected,
      connectWallet,
      disconnectWallet,
      switchChain,
      sendTransaction,
      error,
    }),
    [provider, signer, account, chainId, balance, isConnected, connectWallet, disconnectWallet, switchChain, sendTransaction, error]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
