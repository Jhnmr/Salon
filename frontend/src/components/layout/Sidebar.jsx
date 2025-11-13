import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sidebar Component - Design System
 * Collapsible side navigation with role-based menu items
 */
const Sidebar = ({ isCollapsed = false, onToggle, activeRoute = '/', userRole = 'user' }) => {
  const [expandedSections, setExpandedSections] = useState(['main']);

  // Menu items with role-based access
  const menuItems = [
    {
      section: 'main',
      label: 'Main',
      items: [
        {
          label: 'Dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          href: '/dashboard',
          roles: ['admin', 'stylist', 'user'],
        },
        {
          label: 'Reservations',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          href: '/reservations',
          roles: ['admin', 'stylist', 'user'],
        },
        {
          label: 'Services',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          ),
          href: '/services',
          roles: ['admin', 'stylist', 'user'],
        },
      ],
    },
    {
      section: 'management',
      label: 'Management',
      items: [
        {
          label: 'Clients',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          href: '/clients',
          roles: ['admin', 'stylist'],
        },
        {
          label: 'Stylists',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          href: '/stylists',
          roles: ['admin'],
        },
        {
          label: 'Invoices',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          href: '/invoices',
          roles: ['admin', 'stylist'],
        },
      ],
    },
    {
      section: 'settings',
      label: 'Settings',
      items: [
        {
          label: 'Branches',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          href: '/branches',
          roles: ['admin'],
        },
        {
          label: 'Settings',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          href: '/settings',
          roles: ['admin', 'stylist', 'user'],
        },
      ],
    },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const hasAccess = (itemRoles) => {
    return itemRoles.includes(userRole);
  };

  return (
    <aside
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)]
        bg-gray-800 border-r border-gray-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors z-10"
        aria-label="Toggle sidebar"
      >
        <svg
          className={`w-3 h-3 text-gray-300 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation Menu */}
      <nav className="py-4">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-2">
            {/* Section Header */}
            {!isCollapsed && (
              <button
                onClick={() => toggleSection(section.section)}
                className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
              >
                <span>{section.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.includes(section.section) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Menu Items */}
            {(isCollapsed || expandedSections.includes(section.section)) && (
              <div className={isCollapsed ? '' : 'space-y-1'}>
                {section.items.map(
                  (item) =>
                    hasAccess(item.roles) && (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2.5
                          text-sm font-medium
                          transition-colors duration-150
                          ${
                            activeRoute === item.href
                              ? 'bg-yellow-500/10 text-yellow-400 border-r-2 border-yellow-400'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : ''}
                      >
                        {item.icon}
                        {!isCollapsed && <span>{item.label}</span>}
                      </a>
                    )
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  activeRoute: PropTypes.string,
  userRole: PropTypes.oneOf(['admin', 'stylist', 'user']),
};

export default Sidebar;
