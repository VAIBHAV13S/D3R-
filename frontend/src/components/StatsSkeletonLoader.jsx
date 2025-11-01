/**
 * Skeleton Loader for Stats Cards
 * Provides loading state for statistics
 */

import React from 'react';

export default function StatsSkeletonLoader({ count = 4 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading statistics"
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    >
      {/* Icon skeleton */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '16px',
        }}
      />

      {/* Value skeleton */}
      <div
        style={{
          width: '60%',
          height: '32px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '8px',
        }}
      />

      {/* Label skeleton */}
      <div
        style={{
          width: '80%',
          height: '16px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Dashboard Tab Skeleton Loader
 */
export function DashboardTabSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard content"
      style={{
        padding: '24px',
      }}
    >
      {/* Tab buttons skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '16px',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '120px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '100px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Milestone List Skeleton Loader
 */
export function MilestoneListSkeleton({ count = 3 }) {
  return (
    <div
      role="status"
      aria-label="Loading milestones"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <MilestoneSkeleton key={index} />
      ))}
    </div>
  );
}

function MilestoneSkeleton() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '16px',
      }}
    >
      {/* Status indicator skeleton */}
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          flexShrink: 0,
          marginTop: '4px',
        }}
      />

      <div style={{ flex: 1 }}>
        {/* Title skeleton */}
        <div
          style={{
            width: '70%',
            height: '20px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            marginBottom: '12px',
          }}
        />

        {/* Description skeleton */}
        <div
          style={{
            width: '90%',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            marginBottom: '8px',
          }}
        />

        <div
          style={{
            width: '60%',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
