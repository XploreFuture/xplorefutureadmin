import React, { useEffect, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile } from '../types/api';

interface ReviewFacilitiesRatings {
  girlSafety?: number;
  scholarship?: number;
  noRagging?: number;
  canteen?: number;
  library?: number;
}

interface ReviewRatings {
  overall: number;
  infrastructure?: number;
  courseCurriculum?: number;
  faculty?: number;
  placement?: number;
  facilities?: ReviewFacilitiesRatings;
}

interface ReviewFacilitiesComments {
  girlSafety?: string;
  scholarship?: string;
  noRagging?: string;
  canteen?: string;
  library?: string;
}

interface ReviewComments {
  overall?: string;
  infrastructure?: string;
  courseCurriculum?: string;
  faculty?: string;
  placement?: string;
  internship?: string;
  facilities?: ReviewFacilitiesComments;
}

interface ReportedReview {
  _id: string;
  contentTitle: string;
  userName: string;
  userEmail: string;
  course?: string;
  internship?: string;
  ratings: ReviewRatings;
  comments: ReviewComments;
  isHidden: boolean;
  reports: Array<{
    user: {
      _id: string;
      userName: string;
      email: string;
    };
    reason: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ManageReports: React.FC = () => {
  const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>([]);
  const [message, setMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [reviewToHideId, setReviewToHideId] = useState<string | null>(null);

  const fetchReportedReviews = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const user = decodeAccessToken();
    if (!isAuthenticated() || !user || user.role !== 'admin') {
      setUserRole(user?.role || null);
      setLoading(false);
      setMessage("You do not have administrative privileges to manage reports. Please log in as an admin.");
      return;
    }
    setUserRole(user.role);

    try {
      const res = await fetchWithAuth<ReportedReview[] | { reviews: ReportedReview[] }>(
        "/api/reviews/reported",
        { method: 'GET' }
      );

      if (res) {
        let fetchedReviews: ReportedReview[] = [];
        if (Array.isArray(res)) {
          fetchedReviews = res;
        } else if (typeof res === 'object' && 'reviews' in res && Array.isArray(res.reviews)) {
          fetchedReviews = res.reviews;
        } else {
          console.warn("Received unexpected data format for reported reviews:", res);
          setMessage("❌ Received unexpected data format. Check console.");
        }

        setReportedReviews(fetchedReviews);
        if (fetchedReviews.length > 0) {
            setMessage("✅ Reported reviews loaded successfully.");
        } else {
            setMessage("No reported reviews found.");
        }
      } else {
        setMessage("❌ Failed to fetch reported reviews. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching reported reviews:", err.message);
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        console.error('Unknown error fetching reported reviews:', err);
        setMessage('❌ An unknown error occurred while fetching reported reviews.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportedReviews();

    window.addEventListener('authStatusChange', fetchReportedReviews);
    window.addEventListener('storage', fetchReportedReviews);

    return () => {
      window.removeEventListener('authStatusChange', fetchReportedReviews);
      window.removeEventListener('storage', fetchReportedReviews);
    };
  }, [fetchReportedReviews]);

  const handleHideReviewClick = (reviewId: string) => {
    setReviewToHideId(reviewId);
    setShowConfirmModal(true);
  };

  const confirmHideReview = async () => {
    setShowConfirmModal(false);
    if (!reviewToHideId) return;

    setMessage("");
    if (userRole !== 'admin') {
      setMessage('❌ You do not have permission to hide reviews.');
      return;
    }

    try {
      const res = await fetchWithAuth(`/api/reviews/${reviewToHideId}/hide`, { method: 'PUT' });

      if (res) {
        setReportedReviews(prev =>
          prev.map(review =>
            review._id === reviewToHideId ? { ...review, isHidden: true } : review
          )
        );
        setMessage(`✅ Review with ID ${reviewToHideId} has been hidden.`);
      } else {
        setMessage("❌ Failed to hide review. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error hiding review:", err.message);
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        console.error('Unknown error hiding review:', err);
        setMessage('❌ An unknown error occurred while hiding the review.');
      }
    } finally {
      setReviewToHideId(null);
    }
  };

  const renderNestedDetails = (obj: ReviewRatings | ReviewComments | ReviewFacilitiesRatings | ReviewFacilitiesComments | undefined | null): React.ReactNode | null => {
    if (!obj) return null;
    return Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={key} className="ml-4 mt-2">
            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            {renderNestedDetails(value as ReviewFacilitiesRatings | ReviewFacilitiesComments)}
          </div>
        );
      }
      return (
        <div key={key} className="ml-4 mt-1">
          <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(value)}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Reports...</h2>
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
          <p className="text-gray-700">{message || "You do not have administrative privileges to manage reports."}</p>
          <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Manage Reported Reviews</h1>
      {message && (
        <p className={`mb-4 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {reportedReviews.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No reported reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Review ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Content Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Reviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Overall Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Overall Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Reports</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportedReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review._id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.contentTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.userName} ({review.userEmail})
                    {review.course && <div className="text-xs text-gray-500">Course: {review.course}</div>}
                    {review.internship && <div className="text-xs text-gray-500">Internship: {review.internship}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.ratings.overall} / 5</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                    {review.comments.overall || 'No overall comment.'}
                    <div className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold">Detailed Ratings:</span>
                        {renderNestedDetails(review.ratings)}
                        <span className="font-semibold mt-2 block">Detailed Comments:</span>
                        {renderNestedDetails(review.comments)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {review.reports.length} reports
                    <ul className="list-disc list-inside text-xs mt-1">
                      {review.reports.map((report, idx) => (
                        <li key={idx}>
                          {report.reason} by {report.user?.userName || report.user?._id} (on {new Date(report.date).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      review.isHidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {review.isHidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!review.isHidden && (
                      <button
                        onClick={() => handleHideReviewClick(review._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                      >
                        Resolve & Hide
                      </button>
                    )}
                    {review.isHidden && (
                        <span className="text-gray-500 italic">Already Hidden</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p className="mb-6">Are you sure you want to hide this review? It will no longer be visible to users.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmHideReview}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Hide Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;