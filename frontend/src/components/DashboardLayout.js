import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Web3Provider, Web3Context } from '../context/Web3Context';
import { ToastProvider, useToast } from '../context/ToastContext';
import { Spinner } from '@chakra-ui/react';

function Header() {
  const { 
    account, 
    balance, 
    isConnected, 
    isAuthenticated, 
    isLoading, 
    connectWallet, 
    disconnectWallet 
  } = useContext(Web3Context);
  
  const { addToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isLoading || isConnecting) return;
    
    setIsConnecting(true);
    try {
      await connectWallet();
      addToast('Wallet connected and authenticated', 'success');
    } catch (e) {
      console.error('Connection error:', e);
      const errorMessage = e.message || 'Failed to connect wallet';
      addToast(errorMessage, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnectWallet();
      addToast('Disconnected successfully', 'info');
    } catch (e) {
      console.error('Disconnect error:', e);
      addToast('Failed to disconnect', 'error');
    }
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: '#111827', borderRadius: 8 }} />
        <strong>D3R</strong>
      </div>
      <nav style={{ display: 'flex', gap: 16 }}>
        <NavLink to="/" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Home</NavLink>
        <NavLink to="/campaigns" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Campaigns</NavLink>
        <NavLink to="/dashboard" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Dashboard</NavLink>
        <NavLink to="/create" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Create Campaign</NavLink>
      </nav>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {isConnected && balance && (
          <div style={{ 
            padding: '6px 10px', 
            background: '#f1f5f9', 
            borderRadius: 6, 
            fontSize: 14, 
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>{balance}</span>
            <span>ETH</span>
          </div>
        )}
        
        {isConnected ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ 
              padding: '8px 12px', 
              borderRadius: 8, 
              border: '1px solid #cbd5e1', 
              background: '#fff', 
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: isAuthenticated ? '#10b981' : '#ef4444'
              }} />
              {account.slice(0,6)}...{account.slice(-4)}
            </div>
            <button 
              onClick={handleDisconnect} 
              style={{ 
                padding: '8px 12px', 
                borderRadius: 8, 
                border: '1px solid #cbd5e1', 
                background: '#fff', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                ':hover': {
                  background: '#f8fafc'
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" mr={2} />
                  Disconnecting...
                </>
              ) : 'Disconnect'}
            </button>
          </div>
        ) : (
          <button 
            onClick={handleConnect} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 8, 
              border: '1px solid transparent', 
              background: '#111827', 
              color: '#fff', 
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              ':hover': {
                background: '#1f2937'
              },
              ':disabled': {
                opacity: 0.7,
                cursor: 'not-allowed'
              }
            }}
            disabled={isLoading || isConnecting}
          >
            {(isLoading || isConnecting) ? (
              <>
                <Spinner size="sm" mr={2} />
                Connecting...
              </>
            ) : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside style={{ width: 220, borderRight: '1px solid #e2e8f0', padding: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NavLink to="/" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Home</NavLink>
        <NavLink to="/campaigns" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Campaigns</NavLink>
        <NavLink to="/dashboard" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Dashboard</NavLink>
        <NavLink to="/create" style={({isActive})=>({ textDecoration: 'none', color: isActive ? '#0ea5e9' : '#111827' })}>Create Campaign</NavLink>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', padding: '12px 16px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>© {new Date().getFullYear()} D3R</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="https://x.com" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

function LayoutScaffold({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 16 }}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <Web3Provider>
        <LayoutScaffold>{children}</LayoutScaffold>
      </Web3Provider>
    </ToastProvider>
  );
}
