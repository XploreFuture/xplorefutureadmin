import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { isAuthenticated, decodeAccessToken } from '../utils/auth';
import { fetchWithAuth } from '../utils/api';
import type { UserProfile, InstitutionResponse } from '../types/api';

import categoryOptions from "../constants/categories";
import entranceExamList from "../constants/entranceExam";
import states from "../constants/states";
import citiesData from "../constants/cities";
import courseList from "../constants/courses";

interface CourseAndFeeForm {
  course: string;
  duration: string;
  fees: string;
  entranceExam: string[];
}

interface EventForm {
  title: string;
  date: string;
  description?: string;
}

interface GalleryItemForm {
  imageUrl: string;
  caption?: string;
}

interface FacilitiesForm {
  infrastructure: "Available" | "Not Available";
  laboratories: "Available" | "Not Available";
  sportsFacilities: "Available" | "Not Available";
  hostel: "Available" | "Not Available";
  smartClassroom: "Available" | "Not Available";
}

interface RankingForm {
  agency?: string;
  rank?: number;
  year?: number;
}

const EditInstitution: React.FC = () => {
  const { name: institutionNameParam, type: institutionTypeParam } = useParams<{ name: string; type: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<InstitutionResponse | null>(null);
  const [message, setMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const typeOptions = ["college", "university"];
  const ownerOptions = ["Government", "Private", "Public"];
  const agencyOptions = ["NIRF", "IIRF", "India Today", "XploreFuture"];

  const [cityOptions, setCityOptions] = useState<string[]>([]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setLoading(true);
      setMessage("");

      const user = decodeAccessToken();
      if (!isAuthenticated() || !user || user.role !== 'admin') {
        setUserRole(user?.role || null);
        setLoading(false);
        setMessage("You do not have administrative privileges to edit institutions. Please log in as an admin.");
        return;
      }
      setUserRole(user.role);

      if (institutionNameParam && institutionTypeParam) {
        try {
          const response = await fetchWithAuth<InstitutionResponse>(
            `/api/institutions/${institutionTypeParam}/${encodeURIComponent(institutionNameParam)}`,
            { method: 'GET' }
          );

          if (response) {
            setFormData({
              ...response,
              coursesAndFees: response.coursesAndFees || [],
              courseSpecifications: response.courseSpecifications || [],
              companiesVisited: response.companiesVisited || [],
              announcements: response.announcements || [],
              events: response.events || [],
              gallery: response.gallery || [],
              rankings: response.rankings?.map(r => ({
                agency: r.agency,
                rank: r.rank !== undefined ? Number(r.rank) : undefined,
                year: r.year !== undefined ? Number(r.year) : undefined,
              })) || [],
              facilities: response.facilities || {
                infrastructure: "Available",
                laboratories: "Available",
                sportsFacilities: "Available",
                hostel: "Available",
                smartClassroom: "Available",
              },
              location: response.location || { place: "", city: "", state: "", country: "" }
            });

            if (response.location?.state) {
              setCityOptions(citiesData[response.location.state] || []);
            }
          } else {
            setMessage("Failed to load institution data. It might not exist or there was a server error.");
          }
        } catch (err: unknown) {
          console.error("Failed to fetch institution for editing:", err);
          setMessage("An error occurred while fetching institution data.");
        }
      } else {
        setMessage("Invalid institution name or type provided in URL.");
      }
      setLoading(false);
    };

    checkAuthAndFetchData();

    window.addEventListener('authStatusChange', checkAuthAndFetchData);
    window.addEventListener('storage', checkAuthAndFetchData);

    return () => {
      window.removeEventListener('authStatusChange', checkAuthAndFetchData);
      window.removeEventListener('storage', checkAuthAndFetchData);
    };
  }, [institutionNameParam, institutionTypeParam]);

  useEffect(() => {
    if (formData?.location?.state) {
      setCityOptions(citiesData[formData.location.state] || []);
    } else {
      setCityOptions([]);
    }
  }, [formData?.location?.state]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1] as keyof InstitutionResponse['location'];
      setFormData(prev => ({
        ...prev!,
        location: {
          ...prev!.location!,
          [locationField]: value
        }
      }));
    }
    else if (name.startsWith('facilities.')) {
      const facilityField = name.split('.')[1] as keyof FacilitiesForm;
      setFormData(prev => ({
        ...prev!,
        facilities: {
          ...prev!.facilities!,
          [facilityField]: value as FacilitiesForm[keyof FacilitiesForm]
        }
      }));
    }
    else if (e.target.type === 'checkbox') {
        setFormData(prev => ({
            ...prev!,
            [name]: (e.target as HTMLInputElement).checked
        }));
    }
    else {
      setFormData(prev => ({ ...prev!, [name]: value }));
    }
  };

  const handleCourseChange = (
    index: number,
    field: keyof CourseAndFeeForm,
    value: string | string[]
  ) => {
    if (!formData) return;
    const updatedCourses: CourseAndFeeForm[] = [...(formData.coursesAndFees || [])];
    if (field === "entranceExam") {
      updatedCourses[index].entranceExam = Array.isArray(value) ? value : [value];
    } else {
      (updatedCourses[index][field] as string) = value as string;
      if (field === "course") {
        const selected = courseList.find(opt => opt.name === value);
        updatedCourses[index].duration = selected?.duration || "";
      }
    }
    setFormData(prev => ({ ...prev!, coursesAndFees: updatedCourses }));
  };

  const handleAddCourse = () => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      coursesAndFees: [...(prev!.coursesAndFees || []), { course: "", duration: "", fees: "", entranceExam: [] }]
    }));
  };

  const handleRemoveCourse = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      coursesAndFees: (prev!.coursesAndFees || []).filter((_course, i) => i !== index)
    }));
  };

  const handleCompaniesVisitedChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      companiesVisited: e.target.value.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '')
    }));
  };

  const handleAnnouncementChange = (index: number, value: string) => {
    if (!formData) return;
    const updatedAnnouncements: string[] = [...(formData.announcements || [])];
    updatedAnnouncements[index] = value;
    setFormData(prev => ({ ...prev!, announcements: updatedAnnouncements }));
  };

  const handleAddAnnouncement = () => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, announcements: [...(prev!.announcements || []), ""] }));
  };

  const handleRemoveAnnouncement = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, announcements: (prev!.announcements || []).filter((_announcement, i) => i !== index) }));
  };

  const handleEventChange = (index: number, field: keyof EventForm, value: string) => {
    if (!formData) return;
    const updatedEvents: EventForm[] = [...(formData.events || [])];
    updatedEvents[index][field] = value;
    setFormData(prev => ({ ...prev!, events: updatedEvents }));
  };

  const handleAddEvent = () => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, events: [...(prev!.events || []), { title: "", date: "" }] }));
  };

  const handleRemoveEvent = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, events: (prev!.events || []).filter((_event, i) => i !== index) }));
  };

  const handleGalleryChange = (index: number, field: keyof GalleryItemForm, value: string) => {
    if (!formData) return;
    const updatedGallery: GalleryItemForm[] = [...(formData.gallery || [])];
    updatedGallery[index][field] = value;
    setFormData(prev => ({ ...prev!, gallery: updatedGallery }));
  };

  const handleAddGalleryImage = () => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, gallery: [...(prev!.gallery || []), { imageUrl: "", caption: "" }] }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, gallery: (prev!.gallery || []).filter((_item, i) => i !== index) }));
  };

  const handleRankingChange = (index: number, field: keyof RankingForm, value: string) => {
    if (!formData) return;
    const updatedRankings: RankingForm[] = [...(formData.rankings || [])];
    if (field === 'rank' || field === 'year') {
        updatedRankings[index][field] = Number(value);
    } else {
        (updatedRankings[index][field] as string | undefined) = value;
    }
    setFormData(prev => ({ ...prev!, rankings: updatedRankings }));
  };

  const handleAddRanking = () => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, rankings: [...(prev!.rankings || []), { agency: undefined, rank: undefined, year: undefined }] }));
  };

  const handleRemoveRanking = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, rankings: (prev!.rankings || []).filter((_ranking, i) => i !== index) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!formData) {
      setMessage("No data to save.");
      return;
    }
    if (userRole !== 'admin') {
      setMessage("You do not have permission to update institutions.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      companiesVisited: formData.companiesVisited?.filter((c: string) => c.trim() !== '') || [],
      announcements: formData.announcements?.filter((a: string) => a.trim() !== '') || [],
      coursesAndFees: formData.coursesAndFees?.filter((c: CourseAndFeeForm) => c.course.trim() && c.fees.trim()).map((c: CourseAndFeeForm) => ({
        ...c,
        entranceExam: c.entranceExam?.filter((e: string) => e.trim() !== '') || []
      })) || [],
      events: formData.events?.filter((e: EventForm) => e.title.trim() && e.date.trim()) || [],
      gallery: formData.gallery?.filter((g: GalleryItemForm) => g.imageUrl.trim()) || [],
      rankings: formData.rankings?.filter((r: RankingForm) => r.agency && r.rank !== undefined && r.year !== undefined).map((r: RankingForm) => ({
        agency: r.agency,
        rank: Number(r.rank),
        year: Number(r.year)
      })) || [],
      establishedYear: Number(formData.establishedYear),
    };

    try {
      const response = await fetchWithAuth(`/api/institutions/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response) {
        setMessage("✅ Institution updated successfully!");
        setTimeout(() => navigate(`/${institutionTypeParam}/${encodeURIComponent(institutionNameParam || "")}/info`), 1500);
      } else {
        setMessage("❌ Failed to update institution. Check console for details.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ An unexpected error occurred: ${err.message}`);
      } else {
        setMessage('❌ An unknown error occurred while updating the institution.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Institution Data...</h2>
        <p className="text-gray-700">Please wait.</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">{message || "You do not have administrative privileges to edit institutions."}</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded shadow text-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Institution Not Found</h2>
        <p className="text-gray-700">{message || "Could not load institution data. Please check the URL or try again."}</p>
        <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">Go to Home</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-xl my-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Edit Institution: {formData.name}</h1>
      {message && (
        <p className={`mb-6 text-center text-lg font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Institution Name:</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Type</option>
                {typeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">Owner:</label>
              <select
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Owner</option>
                {ownerOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category:</label>
              <select
                id="category"
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="establishedYear" className="block text-sm font-medium text-gray-700 mb-1">Established Year:</label>
              <input
                id="establishedYear"
                name="establishedYear"
                type="number"
                value={formData.establishedYear}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                min="1700" max={new Date().getFullYear() + 5}
                required
              />
            </div>
            <div>
              <label htmlFor="campusArea" className="block text-sm font-medium text-gray-700 mb-1">Campus Area (e.g., 100 acres):</label>
              <input
                id="campusArea"
                name="campusArea"
                type="text"
                value={formData.campusArea || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="affiliatedTo" className="block text-sm font-medium text-gray-700 mb-1">Affiliated To (e.g., AICTE, UGC):</label>
              <input
                id="affiliatedTo"
                name="affiliatedTo"
                type="text"
                value={formData.affiliatedTo || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="approvedBy" className="block text-sm font-medium text-gray-700 mb-1">Approved By (e.g., NAAC, NBA):</label>
              <input
                id="approvedBy"
                name="approvedBy"
                type="text"
                value={formData.approvedBy || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="famousCourse" className="block text-sm font-medium text-gray-700 mb-1">Famous Course (e.g., B.Tech CSE):</label>
              <input
                id="famousCourse"
                name="famousCourse"
                type="text"
                value={formData.famousCourse || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="averageFee" className="block text-sm font-medium text-gray-700 mb-1">Average Fee (Calculated):</label>
              <input
                id="averageFee"
                name="averageFee"
                type="text"
                value={formData.averageFee || ""}
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location.place" className="block text-sm font-medium text-gray-700 mb-1">Place:</label>
              <input
                id="location.place"
                name="location.place"
                type="text"
                value={formData.location?.place || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="location.state" className="block text-sm font-medium text-gray-700 mb-1">State:</label>
              <select
                id="location.state"
                name="location.state"
                value={formData.location?.state || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select State</option>
                {states.map((s, index) => <option key={index} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">City:</label>
              <select
                id="location.city"
                name="location.city"
                value={formData.location?.city || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select City</option>
                {cityOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location.country" className="block text-sm font-medium text-gray-700 mb-1">Country:</label>
              <input
                id="location.country"
                name="location.country"
                type="text"
                value={formData.location?.country || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Courses & Fees</h2>
          {formData.coursesAndFees?.map((item: CourseAndFeeForm, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md shadow-sm mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course:</label>
                <select
                  value={item.course}
                  onChange={(e) => handleCourseChange(index, "course", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Course</option>
                  {courseList.map((course, idx) => {
                    const isSelected = formData.coursesAndFees?.some((c: CourseAndFeeForm, i: number) => c.course === course.name && i !== index);
                    return (
                      <option key={idx} value={course.name} disabled={isSelected}>
                        {course.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration:</label>
                <input
                  type="text"
                  value={item.duration || ""}
                  placeholder="Duration"
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fees:</label>
                <input
                  type="text"
                  placeholder="Fees (e.g., ₹1,50,000)"
                  value={item.fees}
                  onChange={(e) => handleCourseChange(index, "fees", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Entrance Exams (Ctrl+Click):</label>
                <select
                  multiple
                  value={item.entranceExam}
                  onChange={(e) =>
                    handleCourseChange(
                      index,
                      "entranceExam",
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                >
                  <option value="" disabled>Select Exams</option>
                  {entranceExamList.map((exam, i) => (
                    <option key={i} value={exam.name}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-4 text-right">
                <button type="button" onClick={() => handleRemoveCourse(index)} className="text-red-600 hover:text-red-800 text-sm">
                  Remove Course
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddCourse} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            + Add New Course
          </button>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Placement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="placementDetails.highest" className="block text-sm font-medium text-gray-700 mb-1">Highest Package (e.g., ₹25 LPA):</label>
              <input
                id="placementDetails.highest"
                name="placementDetails.highest"
                type="text"
                value={formData.placementDetails?.highest || ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, placementDetails: { ...prev!.placementDetails!, highest: e.target.value } }))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="placementDetails.median" className="block text-sm font-medium text-gray-700 mb-1">Median Package (e.g., ₹8 LPA):</label>
              <input
                id="placementDetails.median"
                name="placementDetails.median"
                type="text"
                value={formData.placementDetails?.median || ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, placementDetails: { ...prev!.placementDetails!, median: e.target.value } }))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="placementDetails.lowest" className="block text-sm font-medium text-gray-700 mb-1">Lowest Package (e.g., ₹3 LPA):</label>
              <input
                id="placementDetails.lowest"
                name="placementDetails.lowest"
                type="text"
                value={formData.placementDetails?.lowest || ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, placementDetails: { ...prev!.placementDetails!, lowest: e.target.value } }))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="companiesVisited" className="block text-sm font-medium text-gray-700 mb-1">Companies Visited (comma separated, e.g., TCS, Infosys):</label>
            <input
              id="companiesVisited"
              name="companiesVisited"
              type="text"
              value={formData.companiesVisited?.join(', ') || ""}
              onChange={handleCompaniesVisitedChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Announcements</h2>
          {formData.announcements?.map((announcement: string, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={announcement || ""}
                placeholder={`Announcement ${index + 1}`}
                onChange={(e) => handleAnnouncementChange(index, e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button type="button" onClick={() => handleRemoveAnnouncement(index)} className="text-red-600 hover:text-red-800 text-sm">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddAnnouncement} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            + Add Announcement
          </button>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Rankings</h2>
          {formData.rankings?.map((ranking: RankingForm, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md shadow-sm mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Agency:</label>
                <select
                  value={ranking.agency || ""}
                  onChange={(e) => handleRankingChange(index, "agency", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Agency</option>
                  {agencyOptions.map((agency, i) => (
                    <option key={i} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rank:</label>
                <input
                  type="number"
                  placeholder="Rank"
                  value={ranking.rank === undefined ? "" : ranking.rank}
                  onChange={(e) => handleRankingChange(index, "rank", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year:</label>
                <input
                  type="number"
                  placeholder="Year"
                  value={ranking.year === undefined ? "" : ranking.year}
                  onChange={(e) => handleRankingChange(index, "year", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-3 text-right">
                <button type="button" onClick={() => handleRemoveRanking(index)} className="text-red-600 hover:text-red-800 text-sm">
                  Remove Ranking
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddRanking}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            + Add Ranking
          </button>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Additional Information</h2>
          <textarea
            placeholder="Any additional information about the institution"
            value={formData.additionalInfo || ""}
            onChange={handleChange}
            name="additionalInfo"
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
          />
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Events</h2>
          {formData.events?.map((event: EventForm, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md shadow-sm mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Event Title:</label>
                <input
                  type="text"
                  placeholder="Event Name"
                  value={event.title || ""}
                  onChange={(e) => handleEventChange(index, "title", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Event Date:</label>
                <input
                  type="date"
                  value={event.date || ""}
                  onChange={(e) => handleEventChange(index, "date", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2 text-right">
                <button type="button" onClick={() => handleRemoveEvent(index)} className="text-red-600 hover:text-red-800 text-sm">
                  Remove Event
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddEvent} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            + Add Event
          </button>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Scholarship Details</h2>
          <textarea
            placeholder="Scholarship details (e.g., eligibility, amount)"
            value={formData.scholarship || ""}
            onChange={handleChange}
            name="scholarship"
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
          />
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Gallery Images</h2>
          {formData.gallery?.map((item: GalleryItemForm, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md shadow-sm mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL:</label>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={item.imageUrl || ""}
                  onChange={(e) => handleGalleryChange(index, "imageUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Caption (Optional):</label>
                <input
                  type="text"
                  placeholder="Caption (Optional)"
                  value={item.caption || ""}
                  onChange={(e) => handleGalleryChange(index, "caption", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2 text-right">
                <button type="button" onClick={() => handleRemoveGalleryImage(index)} className="text-red-600 hover:text-red-800 text-sm">
                  Remove Image
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddGalleryImage} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            + Add Image
          </button>
        </section>

        <section className="border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Facilities</h2>
          {["infrastructure", "laboratories", "sportsFacilities", "hostel", "smartClassroom"].map((facility) => (
            <div key={facility} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-gray-50 p-3 rounded-md shadow-sm mb-2">
              <label className="w-40 capitalize font-medium text-gray-700">{facility.replace(/([A-Z])/g, ' $1')}:</label>
              <select
                name={`facilities.${facility}`}
                value={formData.facilities?.[facility as keyof FacilitiesForm] || "Available"}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
          ))}
        </section>

        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md text-xl font-semibold hover:bg-blue-700 transition-colors mt-8">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditInstitution;