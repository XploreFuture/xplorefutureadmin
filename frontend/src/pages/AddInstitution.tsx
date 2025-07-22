import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { InstitutionResponse, UserProfile } from '../types/api';

import categoryOptions from "../constants/categories";
import entranceExamList from "../constants/entranceExam";
import states from "../constants/states";
import citiesData from "../constants/cities";
import courseList from "../constants/courses";

interface CourseFee {
  course: string;
  duration: string;
  fees: string;
  entranceExams: string[];
}

interface PlacementDetails {
  highest: string;
  median: string;
  lowest: string;
}

interface EventItem {
  eventName: string;
  eventDate: string;
}

interface GalleryItem {
  imageUrl: string;
  caption: string;
}

interface Facilities {
  infrastructure: "Available" | "Not Available";
  laboratories: "Available" | "Not Available";
  sportsFacilities: "Available" | "Not Available";
  hostel: "Available" | "Not Available";
  smartClassroom: "Available" | "Not Available";
}

interface Ranking {
  agency: string;
  rank: string | number;
  year: string | number;
}

const AddInstitution: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [place, setPlace] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [country, setCountry] = useState<string>("India");
  const [establishedYear, setEstablishedYear] = useState<string>("");
  const [campusArea, setCampusArea] = useState<string>("");
  const [affiliatedTo, setAffiliatedTo] = useState<string>("");
  const [approvedBy, setApprovedBy] = useState<string>("");
  const [famousCourse, setFamousCourse] = useState<string>("");
  const [coursesAndFees, setCoursesAndFees] = useState<CourseFee[]>([
    { course: "", duration: "", fees: "", entranceExams: [] }
  ]);
  const [courseOptions, setCourseOptions] = useState<{ name: string; duration: string }[]>([]);
  const [placementDetails, setPlacementDetails] = useState<PlacementDetails>({ highest: "", median: "", lowest: "" });
  const [companiesVisited, setCompaniesVisited] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([""]);
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [events, setEvents] = useState<EventItem[]>([{ eventName: "", eventDate: "" }]);
  const [scholarship, setScholarship] = useState<string>("");
  const [gallery, setGallery] = useState<GalleryItem[]>([{ imageUrl: "", caption: "" }]);
  const [facilities, setFacilities] = useState<Facilities>({
    infrastructure: "Available",
    laboratories: "Available",
    sportsFacilities: "Available",
    hostel: "Available",
    smartClassroom: "Available",
  });
  const [category, setCategory] = useState<string>("");
  const [rankings, setRankings] = useState<Ranking[]>([{ agency: "", rank: "", year: "" }]);
  const agencyOptions = ["NIRF", "IIRF", "India Today", "XploreFuture"];
  const [error, setError] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);

  const typeOptions = ["college", "university"];
  const ownerOptions = ["Government", "Private", "Public"];

  useEffect(() => {
    setCourseOptions(courseList);

    const checkAuthStatus = () => {
      if (isAuthenticated()) {
        const user = decodeAccessToken();
        if (user && user.id && user.role) {
          setCurrentUserId(user.id);
          setUserRole(user.role);
          setError("");
        } else {
          localStorage.removeItem('accessToken');
          setCurrentUserId(null);
          setUserRole(null);
          setError("Invalid session. Please log in again.");
        }
      } else {
        setCurrentUserId(null);
        setUserRole(null);
        setError("You must be logged in to add an institution. Please log in.");
      }
    };

    checkAuthStatus();

    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    if (state) {
      setCityOptions(citiesData[state] || []);
      setCity("");
    } else {
      setCityOptions([]);
      setCity("");
    }
  }, [state]);

  const validateInputs = (): boolean => {
    if (!name || !type || !owner || !place || !city || !state || !establishedYear) {
      setError("All required fields (Name, Type, Owner, Location, Established Year) must be filled.");
      return false;
    }
    if (!currentUserId) {
      setError("User not authenticated. Please log in.");
      return false;
    }
    return true;
  };

  const calculateAverageFee = (): string => {
    const numericFees = coursesAndFees
      .map((c) => parseFloat(c.fees.replace(/[^\d.]/g, "")))
      .filter((f) => !isNaN(f));
    if (!numericFees.length) return "";

    const average = numericFees.reduce((a, b) => a + b, 0) / numericFees.length;

    if (average >= 100000) return (average / 100000).toFixed(1).replace(/\.0$/, "") + " lakh";
    else if (average >= 1000) return (average / 1000).toFixed(0) + " thousand";
    else return average.toFixed(0);
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateInputs()) return;

    const institutionData = {
      name, type, owner,
      location: { place, city, state, country },
      establishedYear: Number(establishedYear),
      campusArea, affiliatedTo, approvedBy,
      averageFee: calculateAverageFee(),
      famousCourse,
      coursesAndFees: coursesAndFees.map((c) => ({
        course: c.course,
        duration: c.duration || "N/A",
        fees: c.fees,
        entranceExam: c.entranceExams
      })),
      placementDetails,
      companiesVisited: companiesVisited.filter(c => c.trim() !== ''),
      announcements: announcements.filter(a => a.trim() !== ''),
      additionalInfo,
      facilities,
      events: events.filter(e => e.eventName.trim() && e.eventDate).map((e) => ({ title: e.eventName, date: e.eventDate })),
      scholarship,
      gallery: gallery.filter(item => item.imageUrl.trim()).map((item) => ({ imageUrl: item.imageUrl, caption: item.caption || "" })),
      category,
      rankings: rankings
        .filter(r => r.agency && r.rank && r.year)
        .map(r => ({
          agency: r.agency.trim(),
          rank: Number(r.rank),
          year: Number(r.year)
        })),
      author: currentUserId,
    };

    try {
      const responseData = await fetchWithAuth<InstitutionResponse>(`/api/institutions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(institutionData)
      });

      if (responseData) {
        alert("Institution added successfully!");
      } else {
        setError("Failed to add institution. Please check console for details.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("An unexpected error occurred: " + error.message);
      } else {
        setError("An unknown error occurred during institution submission.");
      }
    }
  };

  const handleCourseChange = (
    index: number,
    field: "course" | "fees" | "entranceExams",
    value: string | string[]
  ) => {
    const updated = [...coursesAndFees];
    if (field === "entranceExams") {
      updated[index].entranceExams = Array.isArray(value) ? value : [value];
    } else {
      updated[index][field] = value as string;
      if (field === "course") {
        const selected = courseOptions.find(opt => opt.name === value);
        updated[index].duration = selected?.duration || "";
      }
    }
    setCoursesAndFees(updated);
  };

  const handleAddCourse = () => setCoursesAndFees([...coursesAndFees, { course: "", duration: "", fees: "", entranceExams: [] }]);

  const handleCompaniesVisitedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompaniesVisited(e.target.value.split(',').map(item => item.trim()).filter(item => item !== ''));
  };

  const handleAnnouncementChange = (index: number, value: string) => {
    const updated = [...announcements];
    updated[index] = value;
    setAnnouncements(updated);
  };
  const handleAddAnnouncement = () => setAnnouncements([...announcements, ""]);

  const handleFacilitiesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFacilities((prev) => ({ ...prev, [name]: value as Facilities[keyof Facilities] }));
  };

  const handleEventChange = (index: number, field: "eventName" | "eventDate", value: string) => {
    const updated = [...events];
    updated[index][field] = value;
    setEvents(updated);
  };
  const handleAddEvent = () => setEvents([...events, { eventName: "", eventDate: "" }]);

  const handleGalleryChange = (index: number, field: "imageUrl" | "caption", value: string) => {
    const updated = [...gallery];
    updated[index][field] = value;
    setGallery(updated);
  };
  const handleAddGalleryImage = () => setGallery([...gallery, { imageUrl: "", caption: "" }]);

  const handleRankingChange = (index: number, field: "agency" | "rank" | "year", value: string) => {
    const updated = [...rankings];
    updated[index][field] = value;
    setRankings(updated);
  };
  const handleAddRanking = () => setRankings([...rankings, { agency: "", rank: "", year: "" }]);

  if (userRole && userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">You do not have administrative privileges to add institutions.</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-16 bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Add New Institution</h2>
      {error && <p className="text-red-500 bg-red-100 border border-red-400 p-3 rounded mb-4">{error}</p>}

      <form onSubmit={handleAddInstitution} className="space-y-6">
        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
        <input type="text" placeholder="Institution Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} required className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select Type</option>
            {typeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>

          <select value={owner} onChange={(e) => setOwner(e.target.value)} required className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select Owner</option>
            {ownerOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Select Category (e.g., Engineering, Medical)</option>
          {categoryOptions.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
        </select>

        <input type="number" placeholder="Established Year" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} required className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" min="1700" max={new Date().getFullYear() + 5} />
        <input type="text" placeholder="Famous Course (e.g., B.Tech CSE)" value={famousCourse} onChange={(e) => setFamousCourse(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
        <input type="text" placeholder="Affiliated To (e.g., AICTE, UGC)" value={affiliatedTo} onChange={(e) => setAffiliatedTo(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
        <input type="text" placeholder="Approved By (e.g., NAAC, NBA)" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
        <input type="text" placeholder="Campus Area (e.g., 100 acres)" value={campusArea} onChange={(e) => setCampusArea(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />


        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Location</h3>
        <input type="text" placeholder="Place (e.g., Main Campus, Satellite Center)" value={place} onChange={(e) => setPlace(e.target.value)} required className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={state} onChange={(e) => setState(e.target.value)} required className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select State</option>
            {states.map((s, index) => <option key={index} value={s}>{s}</option>)}
          </select>

          <select value={city} onChange={(e) => setCity(e.target.value)} required className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select City</option>
            {cityOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
        <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Courses & Fees</h3>
        {coursesAndFees.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md shadow-sm">
            <select
              value={item.course}
              onChange={(e) => handleCourseChange(index, "course", e.target.value)}
              className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Course</option>
              {courseOptions.map((course, idx) => {
                const isSelected = coursesAndFees.some((c, i) => c.course === course.name && i !== index);
                return (
                  <option key={idx} value={course.name} disabled={isSelected}>
                    {course.name}
                  </option>
                );
              })}
            </select>

            <input
              type="text"
              value={item.duration || ""}
              placeholder="Duration"
              readOnly
              className="border border-gray-300 rounded-md p-3 bg-gray-100 cursor-not-allowed"
            />

            <input
              type="text"
              placeholder="Fees (e.g., ₹1,50,000)"
              value={item.fees}
              onChange={(e) => handleCourseChange(index, "fees", e.target.value)}
              className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            />

            <select
              multiple
              value={item.entranceExams}
              onChange={(e) =>
                handleCourseChange(
                  index,
                  "entranceExams",
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 h-24"
            >
              <option value="" disabled>Select Entrance Exams (Ctrl+Click)</option>
              {entranceExamList.map((exam, i) => (
                <option key={i} value={exam.name}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="button" onClick={handleAddCourse} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors">
          + Add Course
        </button>
        <input type="text" value={calculateAverageFee()} readOnly className="w-full border border-gray-300 rounded-md p-3 bg-gray-100 cursor-not-allowed" placeholder="Calculated Average Fee" />

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Placement Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Highest Package (e.g., ₹25 LPA)" value={placementDetails.highest || ""} onChange={(e) => setPlacementDetails({ ...placementDetails, highest: e.target.value })} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" placeholder="Median Package (e.g., ₹8 LPA)" value={placementDetails.median || ""} onChange={(e) => setPlacementDetails({ ...placementDetails, median: e.target.value })} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" placeholder="Lowest Package (e.g., ₹3 LPA)" value={placementDetails.lowest || ""} onChange={(e) => setPlacementDetails({ ...placementDetails, lowest: e.target.value })} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <input type="text" placeholder="Companies Visited (comma separated, e.g., TCS, Infosys)" value={companiesVisited.join(', ')} onChange={handleCompaniesVisitedChange} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Announcements</h3>
        {announcements.map((announcement, index) => (
          <input key={index} type="text" value={announcement || ""} placeholder={`Announcement ${index + 1}`} onChange={(e) => handleAnnouncementChange(index, e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
        ))}
        <button type="button" onClick={handleAddAnnouncement} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors">+ Add Announcement</button>

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Rankings</h3>
        {rankings.map((ranking, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md shadow-sm mb-2">
            <select
              value={ranking.agency}
              onChange={(e) => handleRankingChange(index, "agency", e.target.value)}
              className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Agency</option>
              {agencyOptions.map((agency, i) => (
                <option key={i} value={agency}>{agency}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Rank"
              value={ranking.rank}
              onChange={(e) => handleRankingChange(index, "rank", e.target.value)}
              className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Year"
              value={ranking.year}
              onChange={(e) => handleRankingChange(index, "year", e.target.value)}
              className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddRanking}
          className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          + Add Ranking
        </button>


        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Additional Information</h3>
        <textarea placeholder="Any additional information about the institution" value={additionalInfo || ""} onChange={(e) => setAdditionalInfo(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 h-24 focus:ring-blue-500 focus:border-blue-500" />

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Events</h3>
        {events.map((event, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md shadow-sm">
            <input type="text" placeholder="Event Name" value={event.eventName || ""} onChange={(e) => handleEventChange(index, "eventName", e.target.value)} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
            <input type="date" value={event.eventDate || ""} onChange={(e) => handleEventChange(index, "eventDate", e.target.value)} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        ))}
        <button type="button" onClick={handleAddEvent} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors">+ Add Event</button>

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Scholarship Details</h3>
        <textarea placeholder="Scholarship details (e.g., eligibility, amount)" value={scholarship || ""} onChange={(e) => setScholarship(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 h-24 focus:ring-blue-500 focus:border-blue-500" />

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Gallery Images</h3>
        {gallery.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md shadow-sm">
            <input type="text" placeholder="Image URL" value={item.imageUrl || ""} onChange={(e) => handleGalleryChange(index, "imageUrl", e.target.value)} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
            <input type="text" placeholder="Caption (Optional)" value={item.caption || ""} onChange={(e) => handleGalleryChange(index, "caption", e.target.value)} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        ))}
        <button type="button" onClick={handleAddGalleryImage} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors">+ Add Image</button>

        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4 pt-6">Facilities</h3>
        {["infrastructure", "laboratories", "sportsFacilities", "hostel", "smartClassroom"].map((facility) => (
          <div key={facility} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-gray-50 p-3 rounded-md shadow-sm">
            <label className="w-40 capitalize font-medium text-gray-700">{facility.replace(/([A-Z])/g, ' $1')}:</label>
            <select name={facility} value={facilities[facility as keyof Facilities]} onChange={handleFacilitiesChange} className="border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto">
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        ))}

        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md text-xl font-semibold hover:bg-blue-700 transition-colors mt-8">
          Add Institution
        </button>
      </form>
    </div>
  );
};

export default AddInstitution;