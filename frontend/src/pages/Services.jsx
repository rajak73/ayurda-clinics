import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { Smile, Sparkles, Baby, Eye, CheckCircle, MessageCircle } from "lucide-react";

function Services() {
  const [services, setServices] = useState([]);
  const [activeServiceTitle, setActiveServiceTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/services");
        setServices(res.data);
        if (res.data.length > 0) {
          // Sort or set default active service
          setActiveServiceTitle(res.data[0].title);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getIcon = (name) => {
    switch (name) {
      case "Smile":
        return <Smile size={28} />;
      case "Sparkles":
        return <Sparkles size={28} />;
      case "Baby":
        return <Baby size={28} />;
      case "Eye":
        return <Eye size={28} />;
      default:
        return <Smile size={28} />;
    }
  };

  const selected = services.find((service) => service.title === activeServiceTitle);

  const getWhatsAppLink = () => {
    if (!selected) return "";
    const phone = "917799889398";
    const message = `Hi Ayurda Clinics, I want to know more about ${selected.title}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"></div>
      </main>
    );
  }

  if (services.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Services</h1>
        <p className="mt-8 text-gray-500">No services listed yet.</p>
      </main>
    );
  }

  // Parse JSON arrays safely
  let treatments = [];
  let whenToVisit = [];
  if (selected) {
    try {
      treatments = typeof selected.treatments === "string" ? JSON.parse(selected.treatments) : selected.treatments;
      whenToVisit = typeof selected.when_to_visit === "string" ? JSON.parse(selected.when_to_visit) : selected.when_to_visit;
    } catch (e) {
      treatments = [];
      whenToVisit = [];
    }
  }

  return (
    <main className="bg-gray-50">
      <section className="bg-teal-50 px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Our Healthcare Services
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Explore detailed treatment information for Dental, Dermatology, IVF and Eye Care services.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 px-3 text-lg font-bold text-gray-900">
              Departments
            </h2>

            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.title}
                  onClick={() => setActiveServiceTitle(service.title)}
                  className={
                    activeServiceTitle === service.title
                      ? "flex w-full items-center gap-3 rounded-2xl bg-teal-700 px-4 py-3 text-left font-semibold text-white"
                      : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  }
                >
                  {getIcon(service.icon_name)}
                  {service.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selected && (
          <div className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700 border">
                    {getIcon(selected.icon_name)}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-extrabold">
                    {selected.title}
                  </h2>
                </div>

                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  <MessageCircle size={20} />
                  Ask on WhatsApp
                </a>
              </div>

              <p className="mt-6 text-lg leading-8 text-gray-600 font-medium">
                {selected.overview}
              </p>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-teal-50 p-6 border border-teal-100 shadow-xs">
                  <h3 className="text-xl font-bold text-teal-900">
                    Treatments Offered
                  </h3>

                  <div className="mt-5 space-y-3">
                    {treatments.map((item) => (
                      <div key={item} className="flex gap-3">
                        <CheckCircle className="mt-1 text-teal-700 shrink-0" size={18} />
                        <p className="text-gray-700 font-medium text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 p-6 border border-blue-100 shadow-xs">
                  <h3 className="text-xl font-bold text-blue-900">
                    When Should You Visit?
                  </h3>

                  <div className="mt-5 space-y-3">
                    {whenToVisit.map((item) => (
                      <div key={item} className="flex gap-3">
                        <CheckCircle className="mt-1 text-blue-700 shrink-0" size={18} />
                        <p className="text-gray-700 font-medium text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-3xl bg-teal-700 p-6 text-white shadow-md">
                <h3 className="text-2xl font-bold">
                  Need help choosing the right department?
                </h3>
                <p className="mt-3 text-teal-50">
                  Submit an appointment inquiry and our clinic team will guide you.
                </p>

                <Link
                  to="/contact"
                  className="mt-5 inline-block rounded-full bg-white px-6 py-3 font-semibold text-teal-700 hover:bg-gray-100 transition shadow-sm"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Services;