import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Layout Component - Design System
 * Main layout wrapper combining Navbar, Sidebar, Footer, and content area
 */
const Layout = ({
  children,
  user,
  notificationCount = 0,
  onNotificationClick,
  onLogout,
  activeRoute = '/',
  userRole = 'user',
  showSidebar = true,
  showFooter = true,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navbar */}
      <Navbar
        user={user}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            activeRoute={activeRoute}
            userRole={userRole}
          />
        )}

        {/* Content */}
        <main
          className={`
            flex-1
            transition-all duration-300
            ${showSidebar ? (isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''}
          `}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  }),
  notificationCount: PropTypes.number,
  onNotificationClick: PropTypes.func,
  onLogout: PropTypes.func,
  activeRoute: PropTypes.string,
  userRole: PropTypes.oneOf(['admin', 'stylist', 'user']),
  showSidebar: PropTypes.bool,
  showFooter: PropTypes.bool,
};

export default Layout;
