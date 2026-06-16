import { useEffect, useState } from "react";
import api from "../utils/api";
import { ChevronDown, BookOpen, Phone, CalendarCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [activeDept, setActiveDept] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get("/faqs");
        setFaqs(res.data);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const departments = ["All", "Dental Care", "Dermatology", "IVF & Fertility", "Eye Care", "General"];

  const guides = [
    {
      icon: <CalendarCheck size={28} />,
      title: "Before Your Appointment",
      points: [
        "Book your slot through form or WhatsApp",
        "Mention your department clearly",
        "Carry old reports or prescriptions",
      ],
    },
    {
      icon: <FileText size={28} />,
      title: "During Consultation",
      points: [
        "Explain your symptoms clearly",
        "Share your medical history",
        "Ask about treatment steps and follow-up",
      ],
    },
    {
      icon: <Phone size={28} />,
      title: "After Consultation",
      points: [
        "Follow doctor instructions properly",
        "Save clinic contact for follow-up",
        "Book review visit if advised",
      ],
    },
  ];

  const filteredFaqs =
    activeDept === "All" ? faqs : faqs.filter((faq) => faq.dept === activeDept);

  return (
    <main className="bg-gray-50">
      <section className="bg-teal-50 px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700 border">
            <BookOpen size={32} />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            FAQs & Patient Guides
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Find answers to common patient questions and learn how to prepare for your clinic visit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8 border">
          <h2 className="text-3xl font-bold text-gray-900 font-extrabold">Patient Guides</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {guides.map((guide) => (
              <div key={guide.title} className="rounded-2xl bg-teal-50 p-6 border border-teal-100">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-teal-700 border shadow-xs">
                  {guide.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>

                <ul className="mt-4 space-y-3 text-gray-650 text-sm font-medium">
                  {guide.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8 border">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-extrabold">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-gray-600">
                Filter questions by department.
              </p>
            </div>

            <Link
              to="/contact"
              className="rounded-full bg-teal-700 hover:bg-teal-800 px-6 py-3 text-center font-semibold text-white hover:shadow-md transition"
            >
              Book Appointment
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setActiveDept(dept);
                  setOpenIndex(null);
                }}
                className={
                  activeDept === dept
                    ? "rounded-full bg-teal-700 px-5 py-2 font-semibold text-white transition shadow-sm"
                    : "rounded-full border border-teal-700 px-5 py-2 font-semibold text-teal-700 hover:bg-teal-55 transition"
                }
              >
                {dept}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"></div>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <p className="mt-12 text-center text-gray-500 font-medium">No FAQs listed under this category.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={faq.id} className="rounded-2xl border border-gray-150 bg-white">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">{faq.dept}</p>
                      <h3 className="mt-1 font-bold text-gray-950 text-base">{faq.q}</h3>
                    </div>

                    <ChevronDown
                      className={
                        openIndex === index
                          ? "shrink-0 rotate-180 text-teal-750 transition"
                          : "shrink-0 text-gray-500 transition"
                      }
                    />
                  </button>

                  {openIndex === index && (
                    <div className="border-t border-gray-150 px-5 py-4 text-gray-650 leading-relaxed text-sm font-medium bg-gray-50 rounded-b-2xl">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-yellow-50 border border-yellow-150 p-5 text-yellow-805 text-sm font-medium">
            This information is for general patient guidance only. For medical advice, diagnosis, or treatment, please consult a qualified doctor.
          </div>
        </div>
      </section>
    </main>
  );
}

export default FAQ;