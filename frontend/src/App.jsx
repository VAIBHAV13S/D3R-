import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { Web3Provider } from './context/Web3Context';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';
import ProtectedRoute from './components/ProtectedRoute';

// Theme configuration
import theme from './theme';

// Eager load Home page (first page users see)
const Home = lazy(() => import('./pages/Home'));

// Lazy load other pages for code splitting
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const MyDashboard = lazy(() => import('./pages/MyDashboard'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));

// Fallback component for lazy loading
const LoadingFallback = () => (
  <Box p={8}>
    <SkeletonLoader count={3} />
  </Box>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme} resetCSS>
        <Web3Provider>
          <ToastProvider>
            <BrowserRouter>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Box as="main" minH="calc(100vh - 140px)" p={4}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/campaigns/:id" element={<CampaignDetail />} />

                      {/* Protected routes - require authentication */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <MyDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/donations"
                        element={
                          <ProtectedRoute>
                            <MyDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/create"
                        element={
                          <ProtectedRoute>
                            <CreateCampaign />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch-all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Box>
                </Suspense>
              </DashboardLayout>
            </BrowserRouter>
          </ToastProvider>
        </Web3Provider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}
