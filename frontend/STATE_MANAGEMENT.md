# State Management Guide

## Overview

The D3R frontend uses a hybrid state management approach:
- **Zustand** for global application state
- **React Context** for specific concerns (Web3, Toast notifications)
- **Local State** for component-specific UI state

## Architecture

```
┌─────────────────────────────────────┐
│         Application State           │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │  useAppStore │  │ Campaign    │ │
│  │              │  │ Store       │ │
│  │ - User       │  │             │ │
│  │ - UI State   │  │ - Campaigns │ │
│  │ - Filters    │  │ - Cache     │ │
│  │ - Favorites  │  │ - Donations │ │
│  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│         React Context               │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ Web3Context  │  │ ToastContext│ │
│  │              │  │             │ │
│  │ - Wallet     │  │ - Toasts    │ │
│  │ - Provider   │  │ - Alerts    │ │
│  │ - Signer     │  │             │ │
│  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│         Component State             │
│                                     │
│  - Form inputs                      │
│  - Modal visibility                 │
│  - Temporary UI state               │
└─────────────────────────────────────┘
```

## Zustand Stores

### 1. App Store (useAppStore)

Global application state and UI preferences.

```javascript
import { useAppStore } from './store';

function MyComponent() {
  // Select specific state
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  
  // Or use multiple selectors
  const { user, setUser } = useAppStore((state) => ({
    user: state.user,
    setUser: state.setUser,
  }));
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

#### Available State

**User**
- `user` - Current user object
- `setUser(user)` - Set user
- `clearUser()` - Clear user

**UI**
- `theme` - 'light' | 'dark'
- `toggleTheme()` - Toggle theme
- `sidebarOpen` - boolean
- `toggleSidebar()` - Toggle sidebar

**Notifications**
- `notifications` - Array of notifications
- `addNotification(notification)` - Add notification
- `removeNotification(id)` - Remove notification
- `clearNotifications()` - Clear all

**Campaign Filters** (persisted)
- `campaignFilters` - Filter object
- `setCampaignFilters(filters)` - Update filters
- `resetCampaignFilters()` - Reset to defaults

**Favorites** (persisted)
- `favoriteCampaigns` - Array of campaign IDs
- `toggleFavorite(campaignId)` - Toggle favorite
- `isFavorite(campaignId)` - Check if favorite

**Modals**
- `activeModal` - Current modal name
- `modalData` - Modal data
- `openModal(name, data)` - Open modal
- `closeModal()` - Close modal

**Loading/Error**
- `globalLoading` - boolean
- `setGlobalLoading(loading)` - Set loading
- `globalError` - Error object
- `setGlobalError(error)` - Set error
- `clearGlobalError()` - Clear error

### 2. Campaign Store (useCampaignStore)

Campaign-specific data with caching.

```javascript
import { useCampaignStore } from './store';

function CampaignList() {
  const { campaigns, campaignsLoading, fetchCampaigns } = useCampaignStore();
  
  useEffect(() => {
    fetchCampaigns({ status: 'active', page: 1 });
  }, []);
  
  if (campaignsLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {campaigns.map(campaign => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
```

#### Available State

**Campaigns List**
- `campaigns` - Array of campaigns
- `campaignsLoading` - boolean
- `campaignsError` - Error message
- `campaignsPagination` - { page, limit, total }
- `fetchCampaigns(filters)` - Fetch campaigns

**Single Campaign Cache**
- `campaignCache` - Object of cached campaigns
- `fetchCampaign(id)` - Fetch single campaign
- `clearCampaignCache(id)` - Clear cache
- `updateCampaignInCache(id, updates)` - Update cache

**Donations**
- `donationsCache` - Object of cached donations
- `fetchDonations(campaignId, page, limit)` - Fetch donations

**Milestones**
- `milestonesCache` - Object of cached milestones
- `fetchMilestones(campaignId)` - Fetch milestones
- `addMilestoneToCache(campaignId, milestone)` - Add milestone

## Usage Examples

### Example 1: Theme Toggle

```javascript
import { useAppStore } from './store';

function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
  }));
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Example 2: Favorites

```javascript
import { useAppStore } from './store';

function FavoriteButton({ campaignId }) {
  const { isFavorite, toggleFavorite } = useAppStore((state) => ({
    isFavorite: state.isFavorite,
    toggleFavorite: state.toggleFavorite,
  }));
  
  const favorite = isFavorite(campaignId);
  
  return (
    <button onClick={() => toggleFavorite(campaignId)}>
      {favorite ? '❤️' : '🤍'}
    </button>
  );
}
```

### Example 3: Campaign Filters

```javascript
import { useAppStore } from './store';

function CampaignFilters() {
  const { campaignFilters, setCampaignFilters } = useAppStore((state) => ({
    campaignFilters: state.campaignFilters,
    setCampaignFilters: state.setCampaignFilters,
  }));
  
  return (
    <select
      value={campaignFilters.status}
      onChange={(e) => setCampaignFilters({ status: e.target.value })}
    >
      <option value="">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
    </select>
  );
}
```

### Example 4: Cached Campaign Data

```javascript
import { useCampaignStore } from './store';
import { useEffect, useState } from 'react';

function CampaignDetail({ id }) {
  const fetchCampaign = useCampaignStore((state) => state.fetchCampaign);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCampaign(id)
      .then(setCampaign)
      .finally(() => setLoading(false));
  }, [id, fetchCampaign]);
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{campaign.title}</div>;
}
```

### Example 5: Global Notifications

```javascript
import { useAppStore } from './store';

function NotificationButton() {
  const addNotification = useAppStore((state) => state.addNotification);
  
  const handleClick = () => {
    addNotification({
      type: 'success',
      message: 'Campaign created successfully!',
      duration: 3000,
    });
  };
  
  return <button onClick={handleClick}>Create Campaign</button>;
}

function NotificationList() {
  const { notifications, removeNotification } = useAppStore((state) => ({
    notifications: state.notifications,
    removeNotification: state.removeNotification,
  }));
  
  return (
    <div>
      {notifications.map((notif) => (
        <div key={notif.id}>
          {notif.message}
          <button onClick={() => removeNotification(notif.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Modal Management

```javascript
import { useAppStore } from './store';

function OpenModalButton() {
  const openModal = useAppStore((state) => state.openModal);
  
  return (
    <button onClick={() => openModal('donate', { campaignId: '123' })}>
      Donate
    </button>
  );
}

function ModalManager() {
  const { activeModal, modalData, closeModal } = useAppStore((state) => ({
    activeModal: state.activeModal,
    modalData: state.modalData,
    closeModal: state.closeModal,
  }));
  
  if (!activeModal) return null;
  
  return (
    <div className="modal">
      {activeModal === 'donate' && (
        <DonateModal
          campaignId={modalData.campaignId}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
```

## Performance Optimization

### 1. Selective Subscriptions

Only subscribe to what you need:

```javascript
// ❌ Bad - re-renders on any state change
const store = useAppStore();

// ✅ Good - only re-renders when theme changes
const theme = useAppStore((state) => state.theme);
```

### 2. Shallow Equality

For multiple values:

```javascript
import { shallow } from 'zustand/shallow';

const { user, theme } = useAppStore(
  (state) => ({ user: state.user, theme: state.theme }),
  shallow
);
```

### 3. Memoized Selectors

```javascript
import { useMemo } from 'react';

const selector = useMemo(
  () => (state) => state.campaigns.filter(c => c.status === 'active'),
  []
);

const activeCampaigns = useCampaignStore(selector);
```

## Persistence

The App Store automatically persists certain state to localStorage:

**Persisted:**
- Theme preference
- Campaign filters
- Favorite campaigns
- Search history

**Not Persisted:**
- User session (handled by Web3Context)
- Temporary UI state
- Cache data

## DevTools

Zustand integrates with Redux DevTools:

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open DevTools
3. Select "D3R App Store" or "Campaign Store"
4. Inspect state changes in real-time

## Best Practices

### ✅ Do

1. **Use selectors** to avoid unnecessary re-renders
2. **Keep stores focused** - separate concerns
3. **Use actions** instead of direct state mutation
4. **Cache API responses** to reduce network calls
5. **Clear cache** when data becomes stale

### ❌ Don't

1. **Don't store everything** - use local state when appropriate
2. **Don't mutate state directly** - use set() function
3. **Don't subscribe to entire store** - select specific values
4. **Don't duplicate data** - single source of truth
5. **Don't forget to clean up** - clear cache when needed

## Migration Guide

### From Local State

```javascript
// Before
function Component() {
  const [theme, setTheme] = useState('light');
  
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}

// After
import { useAppStore } from './store';

function Component() {
  const { theme, toggleTheme } = useAppStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
  }));
  
  return <button onClick={toggleTheme}>Toggle</button>;
}
```

### From Props Drilling

```javascript
// Before
function Parent() {
  const [user, setUser] = useState(null);
  return <Child user={user} setUser={setUser} />;
}

function Child({ user, setUser }) {
  return <GrandChild user={user} setUser={setUser} />;
}

function GrandChild({ user, setUser }) {
  return <div>{user?.name}</div>;
}

// After
import { useAppStore } from './store';

function Parent() {
  return <Child />;
}

function Child() {
  return <GrandChild />;
}

function GrandChild() {
  const user = useAppStore((state) => state.user);
  return <div>{user?.name}</div>;
}
```

## Testing

```javascript
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from './store';

test('toggles theme', () => {
  const { result } = renderHook(() => useAppStore());
  
  expect(result.current.theme).toBe('light');
  
  act(() => {
    result.current.toggleTheme();
  });
  
  expect(result.current.theme).toBe('dark');
});
```

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand/wiki/Best-Practices)
- [React State Management](https://react.dev/learn/managing-state)

## Summary

✅ **Zustand** - Global state, caching, persistence  
✅ **Context API** - Web3, Toast notifications  
✅ **Local State** - Component-specific UI  
✅ **Performance** - Selective subscriptions  
✅ **DevTools** - Redux DevTools integration  
✅ **TypeScript Ready** - Full type support  

State management is now centralized and efficient!
