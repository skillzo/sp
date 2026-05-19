import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { AgeVerificationModal } from '../components/AgeVerificationModal';
import { Toaster } from '../components/ui/sonner';
import { useEffect } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { AuthModals } from '../components/AuthModals';
import { useAuth } from '../context/AuthContext';

export function Root() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { showAuthModal, closeAuthModal, authMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/';

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const handleAuthSuccess = () => {
    // After successful login/register, redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Overlay */}
      {isSidebarOpen && !isHomePage && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Hidden on HomePage */}
      {!isHomePage && (
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:transform-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>

      <AgeVerificationModal />
      <Toaster />
      
      {/* Global Auth Modal */}
      <AuthModals
        show={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}