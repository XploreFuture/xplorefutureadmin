import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile } from '../types/api';

import courseList from "../constants/courses";

const AddCourseDetail: React.FC = () => {
  const [slug, setSlug] = useState<string>("");
  const [specification, setSpecification] = useState<string>("");
  const [eligibility, setEligibility] = useState<string>("");
  const [avgFees, setAvgFees] = useState<string>("");
  const [careerOptions, setCareerOptions] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (isAuthenticated()) {
        const user = decodeAccessToken();
        if (user && user.id && user.role) {
          setUserRole(user.role);
          setMessage(null);
        } else {
          localStorage.removeItem('accessToken');
          setUserRole(null);
          setMessage("Invalid session. Please log in again.");
        }
      } else {
        setUserRole(null);
        setMessage("You must be logged in to add course details. Please log in.");
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
    setMessage(null);

    if (!slug || !specification || !eligibility || !avgFees || !careerOptions) {
      setMessage('❌ All fields are required.');
      return;
    }
    if (userRole !== 'admin') {
      setMessage('❌ You do not have permission to add/update course details.');
      return;
    }

    try {
      const res = await fetchWithAuth('/api/courses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          specification,
          eligibility,
          avgFees,
          careerOptions: careerOptions.split(",").map((opt) => opt.trim()),
        }),
      });

      if (res) {
        setMessage('✅ Course detail saved successfully!');
        setSlug("");
        setSpecification("");
        setEligibility("");
        setAvgFees("");
        setCareerOptions("");
      } else {
        setMessage('❌ Failed to save course detail. Check console for details.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ An unexpected error occurred: ${error.message}`);
      } else {
        setMessage('❌ An unknown error occurred while saving course detail.');
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
        <p className="text-gray-700">You do not have administrative privileges to add/update course details.</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Add / Update Course Detail</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="slug" className="block font-medium mb-1 text-gray-700">Select Course</label>
          <select
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a course</option>
            {courseList.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.name} ({course.duration})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="specification" className="block font-medium mb-1 text-gray-700">Specification</label>
          <textarea
            id="specification"
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            rows={3}
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., This course focuses on..."
            required
          />
        </div>

        <div>
          <label htmlFor="eligibility" className="block font-medium mb-1 text-gray-700">Eligibility</label>
          <input
            id="eligibility"
            type="text"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 10+2 with 50% marks in PCM"
            required
          />
        </div>

        <div>
          <label htmlFor="avgFees" className="block font-medium mb-1 text-gray-700">Average Fees</label>
          <input
            id="avgFees"
            type="text"
            value={avgFees}
            onChange={(e) => setAvgFees(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., ₹1,50,000 - ₹2,00,000 per year"
            required
          />
        </div>

        <div>
          <label htmlFor="careerOptions" className="block font-medium mb-1 text-gray-700">Career Options (comma separated)</label>
          <input
            id="careerOptions"
            type="text"
            value={careerOptions}
            onChange={(e) => setCareerOptions(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Software Developer, Data Scientist, Web Designer"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition w-full font-semibold"
        >
          Save Course Detail
        </button>

        {message && (
          <p className={`mt-3 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddCourseDetail;