import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Web3Provider, Web3Context } from '../context/Web3Context';
import { ToastProvider, useToast } from '../context/ToastContext';

function Header() {
  const { account, balance, isConnected, connectWallet, disconnectWallet } = useContext(Web3Context);
  const { addToast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
      addToast('Wallet connected', 'success');
    } catch (e) {
      addToast(e.message || 'Failed to connect wallet', 'error');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    addToast('Wallet disconnected', 'info');
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
          <div style={{ padding: '6px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: 14, color: '#64748b' }}>
            {balance} ETH
          </div>
        )}
        {isConnected ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: 14 }}>
              {account.slice(0,6)}...{account.slice(-4)}
            </div>
            <button onClick={handleDisconnect} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={handleConnect} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#111827', color: '#fff', cursor: 'pointer' }}>
            Connect Wallet
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
