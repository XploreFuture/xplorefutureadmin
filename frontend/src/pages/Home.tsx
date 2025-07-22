import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';

interface DecodedUser {
  id: string;
  role: string;
}

export default function Home() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (isAuthenticated()) {
        const user: DecodedUser | null = decodeAccessToken();
        setIsAdmin(!!(user && user.role === 'admin')); 
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus(); 

    window.addEventListener('authStatusChange', checkAdminStatus);
    window.addEventListener('storage', checkAdminStatus);

    return () => {
      window.removeEventListener('authStatusChange', checkAdminStatus);
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 animate-fade-in">
        Welcome to XploreFuture
      </h1>

      {isAdmin && (
        <Link 
          to="/dashboard" 
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 
                     transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Go to Admin Dashboard
        </Link>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}