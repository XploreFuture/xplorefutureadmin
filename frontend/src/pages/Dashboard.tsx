import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import type { UserProfile } from '../types/api';

// Define a type for the dashboard cards
interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode; // For a simple icon (e.g., LucideReact icon, SVG, or emoji)
  colorClass: string; // Tailwind class for background color
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, link, icon, colorClass }) => (
  <Link
    to={link}
    className={`block ${colorClass} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <p className="text-sm opacity-90">{description}</p>
  </Link>
);

export default function Dashboard() {
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const checkAuthStatus = () => {
      const user = decodeAccessToken();
      if (!isAuthenticated() || !user || user.role !== 'admin') {
        setUserRole(user?.role || null);
        setLoading(false);
        setMessage("You do not have administrative privileges to access the dashboard. Please log in as an admin.");
      } else {
        setUserRole(user.role);
        setLoading(false);
        setMessage(""); 
      }
    };

    checkAuthStatus();

    window.addEventListener('authStatusChange', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('authStatusChange', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Dashboard...</h2>
          <p className="text-gray-700">Please wait.</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700">{message || "You do not have administrative privileges to access this page."}</p>
          <p className="mt-4"><Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link></p>
        </div>
      </div>
    );
  }

  const dashboardCards: DashboardCardProps[] = [
    {
      title: "Add Institutions",
      description: "Add new colleges/universities.",
      link: "/add-institution",
      icon: "🏛️",
      colorClass: "bg-blue-600",
    },
    {
      title: "Edit College", 
      description: "View, edit, or delete existing institution details.", 
      link: "/collegelist", 
      icon: "📋", 
      colorClass: "bg-yellow-600", 
    },
    {
      title: "Manage Ads",
      description: "Add, update, or remove advertisements across the site.",
      link: "/add-ad",
      icon: "📣",
      colorClass: "bg-green-600",
    },
    {
      title: "Manage Course Details",
      description: "Add or update detailed information for various courses.",
      link: "/add-course-detail",
      icon: "📚",
      colorClass: "bg-purple-600",
    },
    {
      title: "Manage Entrance Exams",
      description: "Add or update details for entrance examinations.",
      link: "/add-entrance-exam-details",
      icon: "📝",
      colorClass: "bg-indigo-600",
    },
    {
      title: "View Page Analytics",
      description: "Monitor website traffic and page views (total, daily, weekly, monthly).",
      link: "/pageviews",
      icon: "📈",
      colorClass: "bg-teal-600",
    },
    {
      title: "Manage Users",
      description: "View and manage registered user accounts (delete users).",
      link: "/userlist",
      icon: "👥",
      colorClass: "bg-orange-600",
    },
    {
      title: "Manage Reported Reviews",
      description: "Review and moderate user-reported content/reviews.",
      link: "/managereports",
      icon: "⚠️",
      colorClass: "bg-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-blue-800">Admin Dashboard</h1>
        <p className="text-lg text-gray-700 mb-10 text-center">Welcome, Admin! Here you can manage all aspects of your application.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              link={card.link}
              icon={card.icon}
              colorClass={card.colorClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}