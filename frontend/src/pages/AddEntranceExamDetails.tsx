import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile } from '../types/api';

import entranceExamList from "../constants/entranceExam";

const AddEntranceExamDetails: React.FC = () => {
  const [slug, setSlug] = useState("");
  const [overview, setOverview] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [pattern, setPattern] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [conductingBody, setConductingBody] = useState("");
  const [website, setWebsite] = useState("");
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
        setMessage("You must be logged in to add entrance exam details. Please log in.");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!slug || !overview || !eligibility || !pattern || !syllabus || !conductingBody || !website) {
      setMessage('❌ All fields are required.');
      return;
    }
    if (userRole !== 'admin') {
      setMessage('❌ You do not have permission to add/update entrance exam details.');
      return;
    }

    try {
      const res = await fetchWithAuth("http://localhost:5000/api/entrance-exams", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          overview,
          eligibility,
          syllabus,
          pattern,
          conductingBody,
          website,
        }),
      });

      if (res) {
        setMessage("✅ Entrance exam details saved successfully");
        setSlug("");
        setOverview("");
        setEligibility("");
        setPattern("");
        setSyllabus("");
        setConductingBody("");
        setWebsite("");
      } else {
        setMessage("❌ Failed to save entrance exam detail. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        setMessage("❌ An unknown error occurred while saving entrance exam detail.");
      }
    }
  };

  const handleExamSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    setSlug(selectedSlug);
    const selectedExam = entranceExamList.find(exam => exam.slug === selectedSlug);
    if (selectedExam) {
      // You might want to fetch full details from backend if not available in constants
      // For now, just setting the slug
      // setOverview(selectedExam.overview || ''); // If your constant has these fields
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">You do not have administrative privileges to add/update entrance exam details.</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <div className="pt-2 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Add / Update Entrance Exam Details</h1>
      {message && (
        <p className={`mb-4 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="select-exam" className="block font-medium mb-1 text-gray-700">Select Exam</label>
          <select
            id="select-exam"
            value={slug}
            onChange={handleExamSelect}
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an Exam</option>
            {entranceExamList.map((exam) => (
              <option key={exam.slug} value={exam.slug}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="slug-input" className="block font-medium mb-1 text-gray-700">Exam Slug (auto-filled from selection)</label>
          <input
            id="slug-input"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="e.g. jee-main"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            readOnly
          />
        </div>

        <div>
          <label htmlFor="overview" className="block font-medium mb-1 text-gray-700">Overview</label>
          <textarea
            id="overview"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            placeholder="Brief overview of the exam"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="eligibility" className="block font-medium mb-1 text-gray-700">Eligibility</label>
          <textarea
            id="eligibility"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            rows={3}
            placeholder="Eligibility criteria"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="pattern" className="block font-medium mb-1 text-gray-700">Exam Pattern</label>
          <textarea
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            rows={3}
            placeholder="Exam pattern details"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="syllabus" className="block font-medium mb-1 text-gray-700">Syllabus</label>
          <textarea
            id="syllabus"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={3}
            placeholder="Exam syllabus"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="conductingBody" className="block font-medium mb-1 text-gray-700">Conducting Body</label>
          <input
            id="conductingBody"
            type="text"
            value={conductingBody}
            onChange={(e) => setConductingBody(e.target.value)}
            placeholder="e.g. NTA"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="website" className="block font-medium mb-1 text-gray-700">Official Website</label>
          <input
            id="website"
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition w-full font-semibold"
        >
          Save Details
        </button>
      </form>
    </div>
  );
};

export default AddEntranceExamDetails;