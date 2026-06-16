import { useEffect, useState } from "react";
import api from "../utils/api";
import { Star, Quote, MessageCircle } from "lucide-react";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const testsRes = await api.get("/testimonials");
        setTestimonials(testsRes.data);

        const storiesRes = await api.get("/success-stories");
        setSuccessStories(storiesRes.data);
      } catch (err) {
        console.error("Failed to load testimonials content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const getWhatsAppLink = () => {
    const phone = "917799889398";
    const message =
      "Hi Ayurda Clinics, I saw the patient testimonials and want to book an appointment.";
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"></div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50">
      <section className="bg-teal-50 px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Patient Testimonials
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Read patient feedback and success stories from Ayurda Clinics.
          </p>
        </div>
      </section>

      {/* Testimonials List */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        {testimonials.length === 0 ? (
          <p className="text-center text-gray-500">No testimonials available yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <Quote className="text-teal-700" size={32} />

                  <div className="mt-4 flex gap-1 text-yellow-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>

                  <p className="mt-4 leading-7 text-gray-600 font-medium italic">
                    “{item.feedback}”
                  </p>
                </div>

                <div className="mt-6 border-t pt-4">
                  <h3 className="font-extrabold text-gray-900">{item.name}</h3>
                  <p className="text-sm font-semibold text-teal-700">
                    {item.treatment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Success Stories List */}
      <section className="mx-auto max-w-7xl px-5 pb-12">
        <div className="rounded-3xl bg-white p-6 shadow-sm border md:p-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Patient Success Stories
          </h2>

          <p className="mt-3 text-gray-600">
            These stories show how the clinic supports patients with guidance,
            care, and follow-up.
          </p>

          {successStories.length === 0 ? (
            <p className="mt-8 text-gray-500 italic">No success stories available yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {successStories.map((story) => (
                <div
                  key={story.id}
                  className="rounded-2xl border border-teal-100 bg-teal-50 p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-bold uppercase text-teal-700 tracking-wider">
                      {story.department}
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-gray-900 leading-snug">
                      {story.title}
                    </h3>

                    <p className="mt-3 leading-relaxed text-gray-650 text-sm font-medium">{story.story}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-7xl rounded-3xl bg-teal-700 p-8 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold">Want to book an appointment?</h2>

          <p className="mx-auto mt-3 max-w-2xl text-teal-50">
            Connect with Ayurda Clinics on WhatsApp for appointment inquiries
            and department guidance.
          </p>

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-teal-700 hover:bg-gray-100 transition shadow-sm"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}

export default Testimonials;