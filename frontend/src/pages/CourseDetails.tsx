import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import courseList from "../constants/courses";

interface CourseDetailType {
  specification?: string;
  careerOptions?: string[];
  eligibility?: string;
  avgFees?: string;
}

const CourseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [courseDetail, setCourseDetail] = useState<CourseDetailType | null>(null);

  const staticCourse = courseList.find((c) => c.slug === slug);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${slug}`);
        setCourseDetail(res.data);
      } catch (err) {
        console.error("Error fetching course detail:", err);
        setCourseDetail(null);
      }
    };
    fetchCourseDetail();
  }, [slug]);

  if (!staticCourse) {
    return <div className="p-10 text-center text-xl">Course not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-4">{staticCourse.name}</h1>
      <p className="mb-4 text-gray-600">Duration: {staticCourse.duration}</p>

      {courseDetail ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Specification</h2>
            <p className="text-gray-700">
              {courseDetail.specification && courseDetail.specification.trim() !== ""
                ? courseDetail.specification
                : "No data available"}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
            <p className="text-gray-700">
              {courseDetail.eligibility && courseDetail.eligibility.trim() !== ""
                ? courseDetail.eligibility
                : "No data available"}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Average Fees</h2>
            <p className="text-gray-700">
              {courseDetail.avgFees && courseDetail.avgFees.trim() !== ""
                ? courseDetail.avgFees
                : "No data available"}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Career Options</h2>
            {courseDetail.careerOptions && courseDetail.careerOptions.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {courseDetail.careerOptions.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No data available</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading course details...</p>
      )}
    </div>
  );
};

export default CourseDetail;
