import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface EntranceExamDetailType {
  overview: string;
  eligibility: string;
  syllabus: string;
  pattern: string;
  conductingBody: string;
  website: string;
}

const EntranceExamDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [examDetail, setExamDetail] = useState<EntranceExamDetailType | null>(null);

  useEffect(() => {
    const fetchExamDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/entrance-exams/${slug}`);
        setExamDetail(res.data);
      } catch (err) {
        console.error("Error fetching entrance exam detail:", err);
        setExamDetail(null);
      }
    };
    fetchExamDetail();
  }, [slug]);

  if (!examDetail) {
    return <div className="p-2 text-center text-xl">No data available.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 capitalize">{slug?.replace(/-/g, " ")}</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-700">{examDetail.overview || "No data available."}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
        <p className="text-gray-700">{examDetail.eligibility || "No data available."}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Exam Pattern</h2>
        <p className="text-gray-700">{examDetail.pattern || "No data available."}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Syllabus</h2>
        <p className="text-gray-700">{examDetail.syllabus || "No data available."}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Conducting Body</h2>
        <p className="text-gray-700">{examDetail.conductingBody || "No data available."}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Official Website</h2>
        {examDetail.website ? (
          <a href={examDetail.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {examDetail.website}
          </a>
        ) : (
          <p className="text-gray-700">No data available.</p>
        )}
      </div>
    </div>
  );
};

export default EntranceExamDetail;
