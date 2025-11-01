import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../context/ToastContext';
import LoadingButton from './LoadingButton';
import { validateDonationAmount } from '../utils/validation';

export default function DonateModal({ campaignId, onClose }) {
  const [amount, setAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null); // 'pending' | 'success' | 'error'
  const { account, isConnected, sendTransaction } = useWeb3();
  const { addToast } = useToast();

  const handleDonate = async () => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
      return;
    }
    
    const validation = validateDonationAmount(amount);
    if (!validation.isValid) {
      addToast(validation.error, 'error');
      return;
    }
    
    const amt = parseFloat(amount);

    setLoading(true);
    setTxStatus('pending');
    try {
      // Send transaction to contract (mock for now; replace with actual contract call)
      // In real app: call DonationTracker.receiveDonation(campaignId) with value
      const valueHex = '0x' + Math.floor(amt * 1e18).toString(16);
      const hash = await sendTransaction({
        to: process.env.REACT_APP_DONATION_TRACKER_ADDRESS || '0x0000000000000000000000000000000000000000',
        value: valueHex,
        data: '0x', // In real app: encode receiveDonation(campaignId)
      });
      setTxHash(hash);
      addToast('Transaction sent! Waiting for confirmation...', 'info');

      // Poll for confirmation (simplified; in real app use ethers.js waitForTransaction)
      await new Promise(r => setTimeout(r, 3000));

      // Record donation in backend
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          donor: anonymous ? null : account,
          amount: String(amt),
          txHash: hash,
          anonymous,
        }),
      });

      setTxStatus('success');
      addToast('Donation successful!', 'success');
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show updated stats
      }, 2000);
    } catch (err) {
      setTxStatus('error');
      addToast(err.message || 'Donation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 24 }}>Donate to Campaign</h2>

        {txStatus === 'success' ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Donation Successful!</div>
            {txHash && (
              <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: '#667eea' }}>
                View Transaction
              </a>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Amount (ETH)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.1"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
              />
            </div>

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} id="anon" />
              <label htmlFor="anon" style={{ fontSize: 14, cursor: 'pointer' }}>Donate anonymously</label>
            </div>

            {amount && (
              <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Amount:</span>
                  <span>{amount} ETH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Est. Gas:</span>
                  <span>~0.002 ETH</span>
                </div>
              </div>
            )}

            {txStatus === 'pending' && txHash && (
              <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                <div style={{ marginBottom: 4 }}>Transaction pending...</div>
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#667eea' }}>
                  View on Etherscan
                </a>
              </div>
            )}

            {txStatus === 'error' && (
              <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8, marginBottom: 16, fontSize: 14, color: '#991b1b' }}>
                Transaction failed. Please try again.
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
                Cancel
              </button>
              <LoadingButton
                onClick={handleDonate}
                loading={loading}
                disabled={!amount}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', fontWeight: 600 }}
              >
                Donate
              </LoadingButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
