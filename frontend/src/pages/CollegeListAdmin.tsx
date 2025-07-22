import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile, InstitutionResponse } from '../types/api';

const CollegeListForAdmin: React.FC = () => {
  const [institutions, setInstitutions] = useState<InstitutionResponse[]>([]);
  const [message, setMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAllInstitutions = async () => {
    setLoading(true);
    setMessage("");

    const user = decodeAccessToken();
    if (!isAuthenticated() || !user || user.role !== 'admin') {
      setUserRole(user?.role || null);
      setLoading(false);
      setMessage("You do not have administrative privileges to view this page. Please log in as an admin.");
      return;
    }
    setUserRole(user.role);

    try {
      const res = await fetchWithAuth<InstitutionResponse[]>("/api/institutions/all", { method: 'GET' });

      if (res) {
        const fetchedInstitutions = Array.isArray(res) ? res : (res as { institutions?: InstitutionResponse[] }).institutions;
        setInstitutions(Array.isArray(fetchedInstitutions) ? fetchedInstitutions : []);
        setMessage("✅ Institutions loaded successfully.");
      } else {
        setMessage("❌ Failed to fetch institutions. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        setMessage('❌ An unknown error occurred while fetching institutions.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInstitutions();

    window.addEventListener('authStatusChange', fetchAllInstitutions);
    window.addEventListener('storage', fetchAllInstitutions);

    return () => {
      window.removeEventListener('authStatusChange', fetchAllInstitutions);
      window.removeEventListener('storage', fetchAllInstitutions);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Institutions...</h2>
        <p className="text-gray-700">Please wait.</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">{message || "You do not have administrative privileges to view this page."}</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Manage Institutions</h1>
      {message && (
        <p className={`mb-4 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {institutions.length === 0 && !loading ? (
        <p className="text-center text-gray-600">No institutions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {institutions.map((institution) => (
                <tr key={institution._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      to={`/${institution.type}/${encodeURIComponent(institution.name)}/edit`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {institution.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{institution.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{institution.category || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {institution.location ? `${institution.location.city}, ${institution.location.state}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/${institution.type}/${encodeURIComponent(institution.name)}/edit`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CollegeListForAdmin;