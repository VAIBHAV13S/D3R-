import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';

// Eager load Home page (first page users see)
import Home from './pages/Home';

// Lazy load other pages for code splitting
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const MyDashboard = lazy(() => import('./pages/MyDashboard'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DashboardLayout>
          <Suspense fallback={<SkeletonLoader count={3} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/dashboard" element={<MyDashboard />} />
              <Route path="/donations" element={<MyDashboard />} />
              <Route path="/create" element={<CreateCampaign />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </DashboardLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
