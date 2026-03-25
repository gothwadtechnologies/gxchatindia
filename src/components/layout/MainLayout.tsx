import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav.tsx';
import BottomNav from './BottomNav.tsx';
import ResourcesNav, { TabType } from './ResourcesNav.tsx';

export default function MainLayout() {
  const location = useLocation();
  
  // Paths where BottomNav should be visible
  const tabPaths = ['/', '/reels', '/chats', '/hub', '/profile'];
  const showBottomNav = tabPaths.includes(location.pathname);
  
  // Paths where TopNav should be visible
  const showTopNav = tabPaths.includes(location.pathname);

  // Determine current tab for ResourcesNav
  const getTab = (path: string): TabType | null => {
    if (path === '/') return 'home';
    if (path === '/reels') return 'reels';
    if (path === '/chats') return 'chats';
    if (path === '/hub') return 'hub';
    if (path === '/profile') return 'profile';
    return null;
  };

  const currentTab = getTab(location.pathname);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showTopNav && <TopNav />}
      {currentTab && <ResourcesNav tab={currentTab} />}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
