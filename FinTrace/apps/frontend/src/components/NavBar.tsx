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
    <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400">
            {title}
          </h1>
        </Link>

        {showNav && (
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/alerts" className="text-slate-300 hover:text-white transition-colors">
              Alerts
            </Link>
            <Link href="/transactions" className="text-slate-300 hover:text-white transition-colors">
              Transactions
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
