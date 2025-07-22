import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile } from '../types/api';

const AddAdForm: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [position, setPosition] = useState<'header' | 'content' | 'footer'>('content');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (isAuthenticated()) {
        const user = decodeAccessToken();
        if (user && user.id && user.role) {
          setUserRole(user.role);
          setMessage('');
        } else {
          localStorage.removeItem('accessToken');
          setUserRole(null);
          setMessage("Invalid session. Please log in again.");
        }
      } else {
        setUserRole(null);
        setMessage("You must be logged in to add an ad. Please log in.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!imageUrl || !linkUrl) {
      setMessage('❌ Image URL and Target Link are required.');
      return;
    }
    if (userRole !== 'admin') {
      setMessage('❌ You do not have permission to add ads.');
      return;
    }

    const newAd = {
      imageUrl,
      linkUrl,
      position,
      isActive,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      const res = await fetchWithAuth('/api/ad/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAd),
      });

      if (res) {
        setMessage('✅ Ad added successfully!');
        setImageUrl('');
        setLinkUrl('');
        setPosition('content');
        setIsActive(true);
        setStartDate('');
        setEndDate('');
      } else {
        setMessage('❌ Failed to add ad. Check console for details.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ An unexpected error occurred: ${error.message}`);
      } else {
        setMessage('❌ An unknown error occurred while adding the ad.');
      }
    }
  };

  if (userRole === null) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Checking Authentication...</h2>
        <p className="text-gray-700">{message || "Please wait while we verify your access."}</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">You do not have administrative privileges to add advertisements.</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-center text-blue-700">Add New Ad</h2>

      <div>
        <label htmlFor="imageUrl" className="block font-medium text-gray-700">Ad Image URL:</label>
        <input
          id="imageUrl"
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/banner.jpg"
          required
        />
      </div>

      <div>
        <label htmlFor="linkUrl" className="block font-medium text-gray-700">Target Link:</label>
        <input
          id="linkUrl"
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://destination.com"
          required
        />
      </div>

      <div>
        <label htmlFor="position" className="block font-medium text-gray-700">Position:</label>
        <select
          id="position"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          value={position}
          onChange={(e) => setPosition(e.target.value as 'header' | 'content' | 'footer')}
        >
          <option value="header">Header</option>
          <option value="content">Content</option>
          <option value="footer">Footer</option>
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="block font-medium text-gray-700">Start Date (optional):</label>
        <input
          id="startDate"
          type="date"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="endDate" className="block font-medium text-gray-700">End Date (optional):</label>
        <input
          id="endDate"
          type="date"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={() => setIsActive(!isActive)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="font-medium text-gray-700">Is Active</label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full transition-colors font-semibold"
      >
        Add Ad
      </button>

      {message && <p className={`text-center mt-2 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </form>
  );
};

export default AddAdForm;