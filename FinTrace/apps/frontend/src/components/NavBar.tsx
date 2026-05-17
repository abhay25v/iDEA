'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

interface NavBarProps {
  title?: string;
  showNav?: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ title = 'FinTrace', showNav = true }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {title}
          </h1>
        </Link>

        {showNav && (
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/alerts" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Alerts
            </Link>
            <Link href="/transactions" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Transactions
            </Link>
            <Link href="/reports" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Reports
            </Link>
            <Link href="/graph" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Graph
            </Link>
            <Link href="/fiu-export" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Export
            </Link>
            <Link href="/settings" className="text-slate-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Settings
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
