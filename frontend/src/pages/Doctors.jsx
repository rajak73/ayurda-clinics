import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../utils/api";
import { Link } from "react-router-dom";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        // Only display active doctors
        setDoctors(res.data.filter((doc) => doc.status === "Active"));
      } catch (err) {
        console.error("Failed to fetch doctors list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/uploads")) {
      return `${BACKEND_URL}${url}`;
    }
    return url;
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <h1 className="text-4xl font-bold text-gray-900">Doctor Profiles</h1>
      <p className="mt-4 max-w-3xl text-gray-600">
        Meet our doctors and specialists across different departments.
      </p>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"></div>
        </div>
      ) : doctors.length === 0 ? (
        <p className="mt-16 text-center text-gray-500">No active doctors listed at the moment.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-2xl border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-teal-50 border border-teal-100">
                  {doctor.image_url ? (
                    <img
                      src={getImageUrl(doctor.image_url)}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = ""; // Force fallback to initials
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-bold text-teal-700">
                      {doctor.name.replace("Dr. ", "").charAt(0)}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="mt-2 font-semibold text-teal-700">{doctor.department}</p>
                <p className="mt-2 text-gray-600 text-sm">{doctor.qualification}</p>
                <p className="mt-1 text-gray-600 text-sm font-medium">{doctor.experience} Experience</p>
                <p className="mt-2 text-gray-500 text-xs italic">{doctor.specialization}</p>
                <p className="mt-3 text-gray-500 text-xs bg-gray-50 px-3 py-1.5 rounded-lg border">
                  <strong>Hours:</strong> {doctor.available_time}
                </p>
              </div>

              <Link to="/contact" className="mt-5 w-full block text-center rounded-full bg-teal-700 hover:bg-teal-800 px-5 py-2 font-semibold text-white transition text-sm">
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Doctors;