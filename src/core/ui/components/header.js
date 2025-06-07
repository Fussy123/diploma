'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Главная
            </Link>
            
            {user?.role === 'worker' && (
              <Link 
                href="/jobs" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Найти работу
              </Link>
            )}
            
            {(user?.role === 'admin' || user?.role === 'employer') && (
              <Link 
                href="/post-job" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Предложить работу
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={handleAuthClick}
              className="bg-black text-white px-6 py-2 rounded-[15px] font-medium hover:bg-gray-800 transition-colors"
            >
              {isAuthenticated ? 'Выйти' : 'Войти'}
            </button>
            
            <Link 
              href="/create-resume" 
              className="bg-black text-white px-6 py-2 rounded-[15px] font-medium hover:bg-gray-800 transition-colors"
            >
              Создать резюме
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}