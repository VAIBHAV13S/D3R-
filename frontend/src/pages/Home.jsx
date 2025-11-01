import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../config/api';

export default function Home() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalDonations: 0, campaignCount: 0, peopleHelped: 0 });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/campaigns?featured=true').then(r => r.data).catch(() => ({ items: [] })),
      api.get('/stats').then(r => r.data).catch(() => ({}))
    ])
      .then(([campaigns, statsData]) => {
        setFeaturedCampaigns(campaigns.items || []);
        setStats({
          totalDonations: statsData.totalDonations || 0,
          campaignCount: statsData.campaignCount || 0,
          peopleHelped: statsData.peopleHelped || 0
        });
      })
      .catch(() => addToast('Failed to load data', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 12, marginBottom: 40 }}>
        <h1 style={{ fontSize: 48, margin: 0 }}>Decentralized Disaster Relief</h1>
        <p style={{ fontSize: 20, margin: '16px 0 32px' }}>Transparent, blockchain-powered aid for those in need.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/campaigns" style={{ padding: '12px 24px', background: '#fff', color: '#667eea', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Browse Campaigns</Link>
          <Link to="/create" style={{ padding: '12px 24px', background: 'transparent', color: '#fff', border: '2px solid #fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Start a Campaign</Link>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#667eea' }}>${stats.totalDonations.toLocaleString()}</div>
          <div style={{ color: '#64748b', marginTop: 8 }}>Total Donations</div>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#667eea' }}>{stats.campaignCount}</div>
          <div style={{ color: '#64748b', marginTop: 8 }}>Active Campaigns</div>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#667eea' }}>{stats.peopleHelped.toLocaleString()}</div>
          <div style={{ color: '#64748b', marginTop: 8 }}>People Helped</div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, marginBottom: 20 }}>Featured Campaigns</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
        ) : featuredCampaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No featured campaigns yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {featuredCampaigns.map(c => (
              <div key={c.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: 160, background: '#e2e8f0' }} />
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{c.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 12px' }}>{c.description?.slice(0, 80) || 'No description'}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                    <span>${Number(c.currentAmount || 0).toLocaleString()} raised</span>
                    <span>Goal: ${Number(c.targetAmount || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#667eea', width: `${Math.min(100, ((Number(c.currentAmount) || 0) / (Number(c.targetAmount) || 1)) * 100)}%` }} />
                  </div>
                  <Link to={`/campaigns/${c.id}`} style={{ display: 'block', marginTop: 12, textAlign: 'center', padding: '8px 12px', background: '#667eea', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, marginBottom: 20, textAlign: 'center' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {[
            { step: '1', title: 'Create Campaign', desc: 'Submit a disaster relief campaign with proof and milestones.' },
            { step: '2', title: 'Get Verified', desc: 'Our oracle verifies disaster authenticity on-chain.' },
            { step: '3', title: 'Receive Donations', desc: 'Donors contribute directly via blockchain.' },
            { step: '4', title: 'Release Funds', desc: 'Funds released upon milestone approval and proof submission.' }
          ].map(item => (
            <div key={item.step} style={{ background: '#fff', padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px' }}>{item.step}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, marginBottom: 20, textAlign: 'center' }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { q: 'How are disasters verified?', a: 'We use a Chainlink oracle to verify disaster authenticity on-chain before campaigns go live.' },
            { q: 'Where do my donations go?', a: 'Donations are held in a smart contract and released to campaign creators upon milestone approval.' },
            { q: 'Can I track my donation?', a: 'Yes, all transactions are recorded on-chain and visible in your donation history.' },
            { q: 'What if a campaign is fraudulent?', a: 'Campaigns must pass verification and milestone reviews. Funds are only released with proof.' }
          ].map((faq, i) => (
            <details key={i} style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{faq.q}</summary>
              <p style={{ color: '#64748b', marginTop: 8, marginBottom: 0 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
