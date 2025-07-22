import React from "react";
import courseList from "../constants/courses";
import { useNavigate } from "react-router-dom";

const AllCoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCourseClick = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/courses/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">All Courses</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {courseList.map((course, idx) => (
          <div
            key={idx}
            onClick={() => handleCourseClick(course.name)}
            className="border rounded-lg p-4 shadow hover:shadow-md cursor-pointer transition"
          >
            <h2 className="text-lg font-semibold text-blue-700 mb-2">{course.name}</h2>
            <p className="text-gray-600 text-sm">Duration: {course.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllCoursesPage;