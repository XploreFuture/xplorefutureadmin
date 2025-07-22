export interface UserProfile {
    id: string;
    username: string;
    email: string;
     role: 'user' | 'admin';
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    dob?: string; 
    collegeName?: string;
    avatar?: string;
    social?: {
        instagram?: string;
        website?: string;
        youtube?: string;
        [key: string]: string | null | undefined;
    };
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    accessToken: string;
}
export interface LoginRequest { 
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    msg: string;
}

export interface UpdateProfileRequest {
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | null;
    dob?: string | null;
    collegeName?: string | null;
    avatar?: string | null;
    social?: {
        instagram?: string | null;
        website?: string | null;
        youtube?: string | null;
        [key: string]: string | null | undefined;
    };
}

export interface ApiErrorResponse {
    msg?: string; 
    error?: string; 
    details?: string; 
    errors?: { [key: string]: string }; 
}


interface InstitutionLocation {
    place: string;
    city: string;
    state: string;
    country: string;
}

interface CourseAndFee {
    course: string;
    duration: string;
    fees: string;
    entranceExam: string[];
}

interface CourseSpecification {
    course: string;
    details: string;
}

interface PlacementDetail {
    highest: string;
    median: string;
    lowest: string;
}

interface Event {
    title: string;
    date: string; 
    description?: string;
}

interface GalleryItem {
    imageUrl: string;
    caption?: string;
}

interface Facilities {
    infrastructure: "Available" | "Not Available";
    laboratories: "Available" | "Not Available";
    sportsFacilities: "Available" | "Not Available";
    hostel: "Available" | "Not Available";
    smartClassroom: "Available" | "Not Available";
}

interface Ranking {
    agency?: string;
    rank?: number;
    year?: number;
}

export interface InstitutionResponse {
    _id: string; 
    name: string;
    owner: 'Government' | 'Private' | 'Public';
    type: 'college' | 'university';
    location: InstitutionLocation;
    establishedYear: number;
    category?: string;
    campusArea?: string;
    numDepartments?: number;
    affiliatedTo?: string;
    approvedBy?: string;
    famousCourse?: string;
    averageFee?: string;
    coursesAndFees: CourseAndFee[];
    courseSpecifications?: CourseSpecification[];
    placementDetails?: PlacementDetail;
    companiesVisited?: string[];
    announcements?: string[];
    additionalInfo?: string;
    events?: Event[];
    scholarship?: string;
    gallery?: GalleryItem[];
    facilities?: Facilities;
    rankings?: Ranking[];
    author: string; 
    createdAt: string; 
    updatedAt: string; 
}