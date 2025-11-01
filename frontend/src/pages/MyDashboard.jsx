import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../context/ToastContext';

export default function MyDashboard() {
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'campaigns'
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalDonated: 0, totalCampaigns: 0, totalImpact: 0 });
  const { account, isConnected } = useWeb3();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isConnected || !account) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch user's donations and campaigns
    Promise.all([
      fetch('/api/campaigns').then(r => r.ok ? r.json() : { items: [] }),
      fetch(`/api/users/${account}/donations`).then(r => r.ok ? r.json() : { items: [] })
    ])
      .then(([campaignsData, donationsData]) => {
        // Filter campaigns created by user
        const userCampaigns = (campaignsData.items || []).filter(c => c.creator?.toLowerCase() === account.toLowerCase());
        setCampaigns(userCampaigns);

        // Set user donations
        const userDonations = donationsData.items || [];
        setDonations(userDonations);

        // Calculate stats
        const totalCampaigns = userCampaigns.length;
        const totalImpact = userCampaigns.reduce((sum, c) => sum + Number(c.currentAmount || 0), 0);
        const totalDonated = userDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        setStats({ totalDonated, totalCampaigns, totalImpact });
      })
      .catch(() => addToast('Failed to load dashboard data', 'error'))
      .finally(() => setLoading(false));
  }, [account, isConnected, addToast]);

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2>Connect Your Wallet</h2>
        <p style={{ color: '#64748b' }}>Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>My Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#667eea' }}>${stats.totalDonated.toLocaleString()}</div>
          <div style={{ color: '#64748b', marginTop: 8 }}>Total Donated</div>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#667eea' }}>{stats.totalCampaigns}</div>
          <div style={{ color: '#64748b', marginTop: 8 }}>Campaigns Created</div>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#667eea' }}>${stats.totalImpact.toLocaleString()}</div>
          <div style={{ color: '#64748b', marginTop: 8 }}>Total Impact</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '2px solid #e2e8f0' }}>
        <button onClick={() => setActiveTab('donations')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'donations' ? '2px solid #667eea' : '2px solid transparent', color: activeTab === 'donations' ? '#667eea' : '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: -2 }}>
          My Donations
        </button>
        <button onClick={() => setActiveTab('campaigns')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'campaigns' ? '2px solid #667eea' : '2px solid transparent', color: activeTab === 'campaigns' ? '#667eea' : '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: -2 }}>
          My Campaigns
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading...</div>
      ) : activeTab === 'donations' ? (
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>My Donations</h2>
          {donations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <p>You haven't made any donations yet.</p>
              <Link to="/campaigns" style={{ color: '#667eea' }}>Browse campaigns</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {donations.map(d => (
                <div key={d.id} style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Link to={`/campaigns/${d.campaignId}`} style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
                      {d.campaignTitle || `Campaign #${d.campaignId?.slice(0, 8)}`}
                    </Link>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#667eea' }}>${Number(d.amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{d.status || 'Confirmed'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>My Campaigns</h2>
            <Link to="/create" style={{ padding: '8px 16px', background: '#667eea', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
              Create Campaign
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <p>You haven't created any campaigns yet.</p>
              <Link to="/create" style={{ color: '#667eea' }}>Create your first campaign</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {campaigns.map(c => {
                const progress = ((Number(c.currentAmount) || 0) / (Number(c.targetAmount) || 1)) * 100;
                return (
                  <div key={c.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <div style={{ height: 140, background: '#e2e8f0' }} />
                    <div style={{ padding: 16 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{c.title}</h3>
                      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 12px' }}>{c.description?.slice(0, 60)}...</p>
                      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>${Number(c.currentAmount || 0).toLocaleString()}</span>
                          <span>Goal: ${Number(c.targetAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ height: '100%', background: '#667eea', width: `${Math.min(100, progress)}%` }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/campaigns/${c.id}`} style={{ flex: 1, textAlign: 'center', padding: '8px 12px', background: '#667eea', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
                          View
                        </Link>
                        {c.status === 'active' && (
                          <Link to={`/campaigns/${c.id}/edit`} style={{ flex: 1, textAlign: 'center', padding: '8px 12px', background: '#fff', color: '#667eea', border: '1px solid #667eea', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
