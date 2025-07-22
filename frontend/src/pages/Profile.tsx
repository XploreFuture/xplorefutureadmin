import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';

// Define the UserProfile type based on your backend User model
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dob?: string; // ISO date string
  collegeName?: string;
  avatar?: string;
  social?: {
    instagram?: string;
    website?: string;
    youtube?: string;
  };
  about?: string;
  createdAt: string;
  updatedAt: string;
}

// Define your 8 pre-chosen avatar URLs here, relative to the public folder root
const preChosenAvatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png',
    '/avatars/avatar8.png',
    '/avatars/avatar9.png',

];

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // State for form fields
  const [gender, setGender] = useState<UserProfile['gender'] | ''>('');
  const [dob, setDob] = useState<string>('');
  const [collegeName, setCollegeName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>(preChosenAvatars[0]); // Initialize with a default pre-chosen avatar
  const [instagram, setInstagram] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [youtube, setYoutube] = useState<string>('');
  const [about, setAbout] = useState<string>('');

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      const user = await fetchWithAuth<UserProfile>(`/api/profile`);
      if (user) {
        setUserProfile(user);
        setGender(user.gender || '');
        setDob(user.dob ? new Date(user.dob).toISOString().split('T')[0] : '');
        setCollegeName(user.collegeName || '');
        // Set avatar from user profile, or default to the first pre-chosen if user.avatar is null/undefined
        setAvatar(user.avatar || preChosenAvatars[0]);
        if (user.social) {
          setInstagram(user.social.instagram || '');
          setWebsite(user.social.website || '');
          setYoutube(user.social.youtube || '');
        }
        setAbout(user.about || '');
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile data. Please log in.' });
      }
      setLoading(false);
    };

    loadUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const profileData = {
      gender: gender || null,
      dob: dob || null,
      collegeName: collegeName || null,
      avatar: avatar || null, // Use the selected avatar from state
      social: {
        instagram: instagram || null,
        website: website || null,
        youtube: youtube || null
      },
      about: about || null,
    };

    const updatedUser = await fetchWithAuth<UserProfile>(`/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    if (updatedUser) {
      setUserProfile(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Profile update failed.' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg mt-20 text-center">
        <p className="text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!userProfile && !loading) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg mt-20 text-center">
        <p className="text-red-600">Error loading profile. Please try again or log in.</p>
        <Link to="/login" className="text-blue-600 hover:underline mt-4 block">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-xl my-8">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">My Profile</h1>

      <div className="text-center mb-6">
        <img
          src={avatar} // This will show the currently selected avatar
          alt="Avatar"
          className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-md mx-auto"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/cccccc/ffffff?text=Avatar'; }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username:</label>
            <input type="text" id="username" value={userProfile?.username || ''} readOnly className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input type="email" id="email" value={userProfile?.email || ''} readOnly className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as UserProfile['gender'])} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth:</label>
            <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-1">College Name:</label>
          <input type="text" id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Avatar Selection Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <label htmlFor="avatar-select" className="block text-sm font-medium text-gray-700 mb-1">Choose an Avatar:</label>
            <select
              id="avatar-select"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an Avatar</option>
              {preChosenAvatars.map((url, index) => (
                <option key={index} value={url}>
                  Avatar {index + 1}
                </option>
              ))}
            </select>
          </div>
          {/* Small preview of the currently selected avatar */}
          {avatar && (
            <img
              src={avatar}
              alt="Selected Avatar Preview"
              className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/cccccc/ffffff?text=X'; }} // Small fallback
            />
          )}
        </div>


        {/* About Section */}
        <div>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">About Me:</label>
          <textarea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell us a little about yourself..."
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          ></textarea>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Social Media / Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">Instagram ID:</label>
            <input type="text" id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="e.g., my_insta_handle" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website URL:</label>
            <input type="text" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g., https://mywebsite.com" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">YouTube Channel URL:</label>
            <input type="text" id="youtube" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="e.g., youtube.com/mychannel" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
          Update Profile
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    </div>
  );
};

export default Profile;