import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile } from '../types/api';

type User = {
  _id: string;
  username: string; 
  email: string;
  role: 'user' | 'admin';
};

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setMessage("");

    const user = decodeAccessToken();
    if (!isAuthenticated() || !user || user.role !== 'admin') {
      setUserRole(user?.role || null);
      setLoading(false);
      setMessage("You do not have administrative privileges to view or manage users. Please log in as an admin.");
      return;
    }
    setUserRole(user.role);

    try {
      const res = await fetchWithAuth<User[]>("/api/user/users", { method: 'GET' });

      if (res) {
        const fetchedUsers = Array.isArray(res) ? res : (res as { users?: User[] }).users;
        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        setMessage("✅ Users loaded successfully.");
      } else {
        setMessage("❌ Failed to fetch users. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching users:", err.message);
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        console.error('Unknown error fetching users:', err);
        setMessage('❌ An unknown error occurred while fetching users.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    window.addEventListener('authStatusChange', fetchUsers);
    window.addEventListener('storage', fetchUsers);

    return () => {
      window.removeEventListener('authStatusChange', fetchUsers);
      window.removeEventListener('storage', fetchUsers);
    };
  }, []);

  const handleDeleteClick = (id: string) => {
    setUserToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    setShowConfirmModal(false);
    if (!userToDeleteId) return;

    setMessage("");
    if (userRole !== 'admin') {
      setMessage('❌ You do not have permission to delete users.');
      return;
    }

    try {
      const res = await fetchWithAuth(`/api/user/users/${userToDeleteId}`, { method: 'DELETE' });

      if (res) {
        setUsers((prev) => prev.filter((user) => user._id !== userToDeleteId));
        setMessage(`✅ User with ID ${userToDeleteId} deleted successfully!`);
      } else {
        setMessage("❌ Failed to delete user. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error deleting user:", err.message);
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        console.error('Unknown error deleting user:', err);
        setMessage('❌ An unknown error occurred while deleting the user.');
      }
    } finally {
      setUserToDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Users...</h2>
        <p className="text-gray-700">Please wait.</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">{message || "You do not have administrative privileges to view or manage users."}</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">All Users</h1>
      {message && (
        <p className={`mb-4 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {users.length === 0 && !loading && message.startsWith('✅') ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;