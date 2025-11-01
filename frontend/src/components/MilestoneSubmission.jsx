import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../context/ToastContext';
import api from '../config/api';

export default function MilestoneSubmission({ campaignId, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundAmount: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { account, isConnected } = useWeb3();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        addToast('File must be less than 100MB', 'error');
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
      return;
    }

    const { title, description, fundAmount } = formData;
    if (!title || !fundAmount) {
      addToast('Title and fund amount are required', 'error');
      return;
    }

    const amt = parseFloat(fundAmount);
    if (!amt || amt < 0) {
      addToast('Fund amount must be >= 0', 'error');
      return;
    }

    setLoading(true);
    try {
      // Upload proof file to IPFS if provided
      const formDataToSend = new FormData();
      formDataToSend.append('title', title);
      formDataToSend.append('description', description || '');
      formDataToSend.append('fundAmount', String(amt));
      formDataToSend.append('documentType', 'milestone-proof');
      if (proofFile) {
        formDataToSend.append('proofFile', proofFile);
      }

      const response = await api.post(`/campaigns/${campaignId}/milestones`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': account
        }
      });
      
      const data = response.data;
      addToast('Milestone submitted successfully!', 'success');
      if (onSuccess) onSuccess(data);
      if (onClose) onClose();
    } catch (err) {
      addToast(err.message || 'Failed to submit milestone', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 24 }}>Submit Milestone</h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Milestone Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Emergency Shelter Setup"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what was accomplished..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, resize: 'vertical' }}
            />
          </div>

          {/* Fund Amount */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Fund Amount (USD) *</label>
            <input
              type="number"
              name="fundAmount"
              value={formData.fundAmount}
              onChange={handleChange}
              placeholder="2500"
              min="0"
              step="0.01"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Amount to be released upon approval</div>
          </div>

          {/* Proof File */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Proof Document (optional)</label>
            <input
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
            {proofFile && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Selected: {proofFile.name}</div>}
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Upload photos, receipts, or documents as proof</div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: loading ? '#cbd5e1' : '#667eea', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
