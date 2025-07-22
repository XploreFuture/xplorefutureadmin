import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';

// Define the User type for public display, now including 'role' and 'about'
interface PublicUser {
  _id: string;
  fullName: string;
  email: string;
  gender?: string;
  dob?: string;
  collegeName?: string;
  avatar?: string;
  social?: {
    instagram?: string;
    website?: string;
    youtube?: string;
  };
  createdAt: string;
  role: 'user' | 'admin';
  about?: string; // Added 'about' field
}

const AuthorPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<PublicUser | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [canViewProfile, setCanViewProfile] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setCanViewProfile(false);

    if (!userId) {
      setLoading(false);
      setMessage("Author ID not provided in the URL.");
      return;
    }

    try {
      const res = await fetchWithAuth<PublicUser>(`/api/profile/${userId}`, { method: 'GET' });

      if (res) {
        if (res.role === 'admin') {
          setUserProfile(res);
          setCanViewProfile(true);
          setMessage("✅ Author profile loaded successfully.");
        } else {
          setUserProfile(null);
          setMessage("❌ This profile is not publicly viewable (only admin profiles can be viewed as authors).");
          setCanViewProfile(false);
        }
      } else {
        setUserProfile(null);
        setMessage("❌ Failed to fetch author profile. Author might not exist or an error occurred.");
        setCanViewProfile(false);
      }
    } catch (err: unknown) {
      setUserProfile(null);
      if (err instanceof Error) {
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        setMessage('❌ An unknown error occurred while fetching author profile.');
      }
      setCanViewProfile(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();

    window.addEventListener('authStatusChange', fetchUserProfile);
    window.addEventListener('storage', fetchUserProfile);

    return () => {
      window.removeEventListener('authStatusChange', fetchUserProfile);
      window.removeEventListener('storage', fetchUserProfile);
    };
  }, [fetchUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Author Profile...</h2>
          <p className="text-gray-700">Please wait.</p>
        </div>
      </div>
    );
  }

  if (!canViewProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700">{message || "The requested author profile could not be found or is not publicly viewable (only admin profiles are shown as authors)."}</p>
          <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-start justify-center">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src={userProfile!.avatar || "https://placehold.co/100x100/aabbcc/ffffff?text=Author"}
            alt="Author Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-md"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100/aabbcc/ffffff?text=Author"; }}
          />
          <h1 className="text-3xl font-bold text-blue-700 mt-4">{userProfile!.fullName}</h1>
          <p className="text-gray-600">{userProfile!.email}</p>
          <p className="text-blue-500 font-semibold capitalize mt-1">Role: {userProfile!.role}</p>
        </div>

        <div className="space-y-4 text-gray-800">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-4 text-blue-600">About</h2>
          {userProfile!.about && userProfile!.about.trim() !== "" && (
            <p><span className="font-medium">Bio:</span> {userProfile!.about}</p>
          )}
          {userProfile!.gender && (
            <p><span className="font-medium">Gender:</span> {userProfile!.gender}</p>
          )}
          {userProfile!.dob && (
            <p><span className="font-medium">Date of Birth:</span> {new Date(userProfile!.dob).toLocaleDateString()}</p>
          )}
          {userProfile!.collegeName && (
            <p><span className="font-medium">College:</span> {userProfile!.collegeName}</p>
          )}
          <p><span className="font-medium">Member Since:</span> {new Date(userProfile!.createdAt).toLocaleDateString()}</p>

          {userProfile!.social && (userProfile!.social.instagram || userProfile!.social.website || userProfile!.social.youtube) && (
            <>
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4 text-blue-600 mt-8">Social Links</h2>
              <div className="flex flex-wrap gap-4">
                {userProfile!.social.instagram && (
                  <a href={userProfile!.social.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    Instagram
                  </a>
                )}
                {userProfile!.social.website && (
                  <a href={userProfile!.social.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Website
                  </a>
                )}
                {userProfile!.social.youtube && (
                  <a href={userProfile!.social.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                    YouTube
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;