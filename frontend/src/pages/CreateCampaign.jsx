import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../context/ToastContext';

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    disasterId: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { account, isConnected } = useWeb3();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('Image must be less than 10MB', 'error');
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
      return;
    }

    const { title, description, targetAmount, deadline, disasterId } = formData;
    if (!title || !targetAmount) {
      addToast('Title and target amount are required', 'error');
      return;
    }

    const amt = parseFloat(targetAmount);
    if (!amt || amt <= 0) {
      addToast('Target amount must be greater than 0', 'error');
      return;
    }

    setLoading(true);
    try {
      let imageCID = null;
      // Upload image to IPFS if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('documentType', 'campaign-image');
        const uploadRes = await fetch('/api/ipfs/upload', {
          method: 'POST',
          body: formData,
          headers: { 'x-user-id': account },
        });
        if (!uploadRes.ok) throw new Error('Image upload failed');
        const uploadData = await uploadRes.json();
        imageCID = uploadData.cid;
      }

      // Create campaign
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': account,
        },
        body: JSON.stringify({
          title,
          description,
          targetAmount: String(amt),
          deadline: deadline || null,
          disasterId: disasterId || null,
          imageCID, // Note: backend schema doesn't have imageCID yet; you may need to add it
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create campaign');
      }

      const data = await res.json();
      addToast('Campaign created successfully!', 'success');
      navigate(`/campaigns/${data.campaignId}`);
    } catch (err) {
      addToast(err.message || 'Failed to create campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2>Connect Your Wallet</h2>
        <p style={{ color: '#64748b' }}>Please connect your wallet to create a campaign.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Create Campaign</h1>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Campaign Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Flood Relief for Coastal Region"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the disaster, impact, and how funds will be used..."
            rows={5}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, resize: 'vertical' }}
          />
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Campaign Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
          />
          {imageFile && <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Selected: {imageFile.name}</div>}
        </div>

        {/* Target Amount */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Target Amount (USD) *</label>
          <input
            type="number"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="10000"
            min="1"
            step="0.01"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          />
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Deadline (optional)</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          />
        </div>

        {/* Disaster ID */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Disaster ID (optional)</label>
          <input
            type="text"
            name="disasterId"
            value={formData.disasterId}
            onChange={handleChange}
            placeholder="e.g., DIS-COAST-2025-001"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          />
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Link this campaign to a verified disaster event</div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px 24px', background: loading ? '#cbd5e1' : '#667eea', color: '#fff', borderRadius: 8, border: 'none', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating Campaign...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}
