import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile } from '../types/api';

type PageView = {
  _id: string;
  path: string;
  views: number;
  date?: string;
};

type PageViewsData = {
  total: PageView[];
  daily: PageView[];
  weekly: PageView[];
  monthly: PageView[];
};

const PageViews: React.FC = () => {
  const [pageViewsData, setPageViewsData] = useState<PageViewsData | null>(null);
  const [message, setMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'total' | 'daily' | 'weekly' | 'monthly'>('total');

  const generateMockData = (baseViews: PageView[]): PageViewsData => {
    const mockDaily: PageView[] = [];
    const mockWeekly: PageView[] = [];
    const mockMonthly: PageView[] = [];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    for (const view of baseViews) {
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(currentDay - i);
        const dateString = d.toISOString().split('T')[0];
        mockDaily.push({
          _id: `${view._id}-${dateString}`,
          path: view.path,
          views: Math.floor(view.views / 10) + Math.floor(Math.random() * 5),
          date: dateString,
        });
      }

      for (let i = 0; i < 4; i++) {
        const d = new Date(today);
        d.setDate(currentDay - (i * 7)); 
        const year = d.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const weekNumber = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        const weekString = `${year}-W${String(weekNumber).padStart(2, '0')}`;
        mockWeekly.push({
          _id: `${view._id}-${weekString}`,
          path: view.path,
          views: Math.floor(view.views / 4) + Math.floor(Math.random() * 10),
          date: weekString,
        });
      }

      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setMonth(currentMonth - i);
        const monthString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        mockMonthly.push({
          _id: `${view._id}-${monthString}`,
          path: view.path,
          views: Math.floor(view.views / 2) + Math.floor(Math.random() * 20),
          date: monthString,
        });
      }
    }

    const aggregateData = (data: PageView[]): PageView[] => {
      const aggregatedMap = new Map<string, PageView>();
      for (const item of data) {
        const key = `${item.path}-${item.date || 'total'}`;
        if (aggregatedMap.has(key)) {
          aggregatedMap.get(key)!.views += item.views;
        } else {
          aggregatedMap.set(key, { ...item });
        }
      }
      return Array.from(aggregatedMap.values()).sort((a, b) => (b.views || 0) - (a.views || 0));
    };


    return {
      total: baseViews.sort((a, b) => b.views - a.views),
      daily: aggregateData(mockDaily),
      weekly: aggregateData(mockWeekly),
      monthly: aggregateData(mockMonthly),
    };
  };
  useEffect(() => {
    const fetchAndAggregatePageViews = async () => {
      setLoading(true);
      setMessage("");

      const user = decodeAccessToken();
      if (!isAuthenticated() || !user || user.role !== 'admin') {
        setUserRole(user?.role || null);
        setLoading(false);
        setMessage("You do not have administrative privileges to view page analytics. Please log in as an admin.");
        return;
      }
      setUserRole(user.role);

      try {
        const res = await fetchWithAuth<PageView[]>("/api/pageviews", { method: 'GET' });

        if (res) {
          const simulatedData = generateMockData(res);
          setPageViewsData(simulatedData);
          setMessage("✅ Page views loaded successfully.");
        } else {
          setMessage("❌ Failed to fetch total page views. Check console for details.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching page views:", err.message);
          setMessage(`❌ An unexpected error occurred: ${err.message}`);
        } else {
          console.error('Unknown error fetching page views:', err);
          setMessage('❌ An unknown error occurred while fetching page views.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndAggregatePageViews();

    window.addEventListener('authStatusChange', fetchAndAggregatePageViews);
    window.addEventListener('storage', fetchAndAggregatePageViews);

    return () => {
      window.removeEventListener('authStatusChange', fetchAndAggregatePageViews);
      window.removeEventListener('storage', fetchAndAggregatePageViews);
    };
  }, []);

  const overallTotalViews = pageViewsData?.total.reduce((sum, view) => sum + view.views, 0) || 0;

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Page Views...</h2>
        <p className="text-gray-700">Please wait.</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">{message || "You do not have administrative privileges to view page analytics."}</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  const displayedViews = pageViewsData ? pageViewsData[activeTab] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Page Views Analytics</h1>
      {message && (
        <p className={`mb-4 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="mb-6 text-center">
        <span className="text-lg font-semibold text-gray-800">Overall Total Views: </span>
        <span className="text-2xl font-bold text-blue-600">{overallTotalViews}</span>
      </div>

      <div className="flex justify-center mb-6 border-b border-gray-200">
        {['total', 'daily', 'weekly', 'monthly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-6 py-2 -mb-px text-sm font-medium focus:outline-none ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-gray-300'
            } transition-colors duration-200`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {displayedViews.length === 0 && !loading && message.startsWith('✅') ? (
        <p className="text-center text-gray-600">No page view data available for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Path</th>
                {activeTab !== 'total' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    {activeTab === 'daily' ? 'Date' : activeTab === 'weekly' ? 'Week' : 'Month'}
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Views</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedViews.map((view) => (
                <tr key={view._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{view.path}</td>
                  {activeTab !== 'total' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{view.date}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{view.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PageViews;