import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Institution {
  _id?: string; // Optional if not returned by backend
  name: string;
  type: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
}

const InstitutionList = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/institutions");
        if (!response.ok) throw new Error("Failed to fetch institutions");
  
        const data: { institutions: Institution[] } = await response.json();
        setInstitutions(data.institutions);
      } catch (error) {
        console.error("Error fetching institutions:", error);
      }
    };
  
    fetchInstitutions();
  }, []);
  

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Institution List</h2>

      <input
        type="text"
        placeholder="Search institution..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 mb-4 w-full max-w-md"
      />

      <ul className="space-y-2">
        {filteredInstitutions.map((inst) => (
          <li key={inst.name} className="border p-4 rounded shadow">
            <Link
              to={`/institution/${encodeURIComponent(inst.name)}`}
              className="text-blue-600 hover:underline font-semibold"
            >
              {inst.name}
            </Link>
            <div className="text-gray-600 text-sm">
              {inst.type}, {inst.location.city}, {inst.location.state}, {inst.location.country}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstitutionList;
