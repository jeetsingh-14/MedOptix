import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BarChart2,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
  LineChart,
  BrainCircuit
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Appointments', path: '/appointments', icon: <Calendar size={20} /> },
    { name: 'Staff', path: '/department-stats', icon: <Users size={20} /> },
    { name: 'Feedback', path: '/feedback-loop', icon: <MessageSquare size={20} /> },
    { name: 'A/B Testing', path: '/ab-testing', icon: <BarChart2 size={20} /> },
    { name: 'Alerts', path: '/real-time-alerts', icon: <Bell size={20} /> },
    { 
      name: 'Analytics', 
      icon: <Activity size={20} />,
      submenu: [
        { name: 'Operational Insights', path: '/operational-insights', icon: <LineChart size={18} /> },
        { name: 'No-Show Prediction', path: '/no-show-prediction', icon: <BrainCircuit size={18} /> },
        { name: 'Recommendations', path: '/recommendations', icon: <Stethoscope size={18} /> },
      ]
    },
  ];

  // Track open/closed state of submenus
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  // Check if a submenu item is active
  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some(item => item.path === location.pathname);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-card transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo and collapse button */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">M</span>
              </div>
              <span className="text-xl font-bold">MedOptix</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", isCollapsed && "mx-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.submenu ? (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isSubmenuActive(item.submenu) && "bg-accent text-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      onClick={() => toggleSubmenu(item.name)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          <ChevronRight
                            size={16}
                            className={cn(
                              "transition-transform",
                              openSubmenu === item.name && "rotate-90"
                            )}
                          />
                        </>
                      )}
                    </Button>

                    {/* Submenu items */}
                    {(openSubmenu === item.name || isCollapsed) && (
                      <ul className={cn(
                        "ml-6 space-y-1",
                        isCollapsed && "ml-0"
                      )}>
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent",
                                location.pathname === subItem.path && "bg-accent text-accent-foreground font-medium",
                                isCollapsed && "justify-center px-0"
                              )}
                            >
                              <span className={cn(
                                "mr-2",
                                isCollapsed && "mr-0"
                              )}>{subItem.icon}</span>
                              {!isCollapsed && <span>{subItem.name}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 hover:bg-accent",
                      location.pathname === item.path && "bg-accent text-accent-foreground font-medium",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <span className={cn(
                      "mr-2",
                      isCollapsed && "mr-0"
                    )}>{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className={cn(
            "flex items-center",
            isCollapsed && "justify-center"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Users size={14} />
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-xs font-medium">Medical Staff</p>
                <p className="text-xs text-muted-foreground">Online: 12</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
