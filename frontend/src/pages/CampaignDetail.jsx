import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../context/ToastContext';
import DonateModal from '../components/DonateModal';
import MilestoneSubmission from '../components/MilestoneSubmission';
import { CampaignDetailSkeleton } from '../components/SkeletonLoader';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const { account } = useWeb3();
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch(`/api/campaigns/${id}`).then(r => r.ok ? r.json() : Promise.reject('Campaign not found')),
      fetch(`/api/campaigns/${id}/milestones`).then(r => r.ok ? r.json() : { items: [] }),
      fetch(`/api/campaigns/${id}/donations?limit=10`).then(r => r.ok ? r.json() : { items: [] })
    ])
      .then(([camp, mstones, dons]) => {
        setCampaign(camp);
        setMilestones(mstones.items || []);
        setDonations(dons.items || []);
      })
      .catch(err => addToast(err.message || 'Failed to load campaign', 'error'))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  if (loading) return <CampaignDetailSkeleton />;
  if (!campaign) return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Campaign not found</div>;

  const progress = ((Number(campaign.currentAmount) || 0) / (Number(campaign.targetAmount) || 1)) * 100;
  const gateway = 'https://gateway.pinata.cloud/ipfs/';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Hero Image */}
      <div style={{ height: 300, background: '#e2e8f0', borderRadius: 12, marginBottom: 24 }} />

      {/* Campaign Info */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, margin: '0 0 8px' }}>{campaign.title}</h1>
        <p style={{ color: '#64748b', marginBottom: 16 }}>By {campaign.creator?.slice(0, 6)}...{campaign.creator?.slice(-4)}</p>
        <p style={{ color: '#111827', marginBottom: 24 }}>{campaign.description}</p>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 20 }}>${Number(campaign.currentAmount || 0).toLocaleString()}</span>
            <span style={{ color: '#64748b' }}>raised of ${Number(campaign.targetAmount || 0).toLocaleString()}</span>
          </div>
          <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#667eea', width: `${Math.min(100, progress)}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>{campaign.donationCount || 0}</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>Donors</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>{campaign.milestoneCount || 0}</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>Milestones</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>{campaign.status}</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>Status</div>
          </div>
        </div>

        <button onClick={() => setShowDonateModal(true)} style={{ width: '100%', padding: '12px 24px', background: '#667eea', color: '#fff', borderRadius: 8, border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          Donate Now
        </button>
      </div>

      {/* Milestones */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, margin: 0 }}>Milestones</h2>
          {account && campaign.creator?.toLowerCase() === account.toLowerCase() && (
            <button onClick={() => setShowMilestoneModal(true)} style={{ padding: '8px 16px', background: '#667eea', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Add Milestone
            </button>
          )}
        </div>
        {milestones.length === 0 ? (
          <p style={{ color: '#64748b' }}>No milestones yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {milestones.map((m, i) => (
              <div key={m.id} style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{i + 1}. {m.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{m.description}</p>
                  </div>
                  <div style={{ padding: '4px 8px', background: m.approved ? '#d1fae5' : '#fef3c7', color: m.approved ? '#065f46' : '#92400e', borderRadius: 4, fontSize: 12 }}>
                    {m.approved ? 'Approved' : 'Pending'}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Fund Amount: ${Number(m.fundAmount || 0).toLocaleString()}</div>
                {m.proofCID && (
                  <a href={`${gateway}${m.proofCID}`} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: '#667eea' }}>
                    View Proof (IPFS)
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Donations */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Recent Donations</h2>
        {donations.length === 0 ? (
          <p style={{ color: '#64748b' }}>No donations yet. Be the first!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {donations.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{d.anonymous ? 'Anonymous' : `${d.donorWallet?.slice(0, 6)}...${d.donorWallet?.slice(-4)}`}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ fontWeight: 600, color: '#667eea' }}>${Number(d.amount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDonateModal && <DonateModal campaignId={id} onClose={() => setShowDonateModal(false)} />}
      {showMilestoneModal && (
        <MilestoneSubmission
          campaignId={id}
          onSuccess={() => {
            // Refresh milestones
            fetch(`/api/campaigns/${id}/milestones`)
              .then(r => r.ok ? r.json() : { items: [] })
              .then(data => setMilestones(data.items || []))
              .catch(() => {});
          }}
          onClose={() => setShowMilestoneModal(false)}
        />
      )}
    </div>
  );
}
