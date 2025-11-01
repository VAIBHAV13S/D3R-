import React from 'react';

const pulseAnimation = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export function CampaignCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <style>{pulseAnimation}</style>
      <div style={{ height: 160, background: '#e2e8f0', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 20, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 12, width: '80%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, marginBottom: 4, width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginBottom: 12, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 36, background: '#e2e8f0', borderRadius: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 12 }}>
      <style>{pulseAnimation}</style>
      <div style={{ height: 16, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, width: '40%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
    </div>
  );
}

export function CampaignDetailSkeleton() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <style>{pulseAnimation}</style>
      <div style={{ height: 300, background: '#e2e8f0', borderRadius: 12, marginBottom: 24, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <div style={{ height: 32, background: '#e2e8f0', borderRadius: 4, marginBottom: 12, width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 16, background: '#e2e8f0', borderRadius: 4, marginBottom: 16, width: '30%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 24, width: '90%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, marginBottom: 24, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 48, background: '#e2e8f0', borderRadius: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = {
    card: CampaignCardSkeleton,
    list: ListItemSkeleton,
    detail: CampaignDetailSkeleton,
  };

  const Component = skeletons[type] || CampaignCardSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
