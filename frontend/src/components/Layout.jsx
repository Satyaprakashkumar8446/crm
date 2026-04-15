import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Billing', href: '/billing', icon: FileText },
    { name: 'Payments', href: '/payments', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-border px-6">
          <span className="text-xl font-bold text-primary">MedCare CRM</span>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-card border-b border-border lg:hidden">
          <span className="text-xl font-bold text-primary">MedCare CRM</span>
          <button
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
