import { Link } from "react-router-dom";
import {
  Stethoscope,
  Smile,
  Sparkles,
  Baby,
  Eye,
  ShieldCheck,
  Clock,
  Users,
  MessageCircle,
  Brain,
  Star,
} from "lucide-react";

function Home() {
  const departments = [
    {
      title: "Dental Care",
      icon: <Smile />,
      desc: "Dental checkups, cleaning, root canal, fillings and smile care.",
      path: "/services",
    },
    {
      title: "Dermatology",
      icon: <Sparkles />,
      desc: "Skin, hair, acne, pigmentation and allergy consultation.",
      path: "/services",
    },
    {
      title: "IVF & Fertility",
      icon: <Baby />,
      desc: "Confidential fertility consultation and patient-focused IVF care.",
      path: "/services",
    },
    {
      title: "Eye Care",
      icon: <Eye />,
      desc: "Eye checkups, vision care, redness, dryness and irritation guidance.",
      path: "/services",
    },
  ];

  const stats = [
    {
      number: "4+",
      label: "Speciality Departments",
    },
    {
      number: "24/7",
      label: "WhatsApp Inquiry Support",
    },
    {
      number: "100%",
      label: "Patient-Focused Care",
    },
    {
      number: "Fast",
      label: "Appointment Response",
    },
  ];

  const whyChoose = [
    {
      icon: <ShieldCheck />,
      title: "Trusted Care",
      desc: "Ethical and patient-first healthcare support across multiple departments.",
    },
    {
      icon: <Users />,
      title: "Specialist Doctors",
      desc: "Department-wise doctors with specialization and proper treatment guidance.",
    },
    {
      icon: <Clock />,
      title: "Easy Appointment",
      desc: "Patients can submit inquiry forms or directly connect through WhatsApp.",
    },
  ];

  const testimonials = [
    {
      name: "Ravi Kumar",
      dept: "Dental Care",
      text: "The doctor explained the treatment clearly and the appointment process was smooth.",
    },
    {
      name: "Sneha Reddy",
      dept: "Dermatology",
      text: "The clinic staff was polite and the consultation experience was very comfortable.",
    },
    {
      name: "Anonymous Patient",
      dept: "IVF & Fertility",
      text: "The consultation was private, supportive and clearly explained.",
    },
  ];

  const whatsappLink =
    "https://wa.me/917799889398?text=Hi%20Ayurda%20Clinics%2C%20I%20want%20to%20book%20an%20appointment.";

  return (
    <main>
      <section className="bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-800">
              <Stethoscope size={18} />
              Trusted Multi-Speciality Clinic
            </p>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Compassionate Healthcare for Every Patient
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Ayurda Clinics provides reliable care across Dental, Dermatology,
              IVF and Eye Care with experienced doctors and patient-first
              service.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="rounded-full bg-teal-700 px-7 py-3 text-center font-semibold text-white hover:bg-teal-800"
              >
                Book Appointment
              </Link>

              <Link
                to="/services"
                className="rounded-full border border-teal-700 px-7 py-3 text-center font-semibold text-teal-700 hover:bg-teal-50"
              >
                View Services
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                Dental
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                Dermatology
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                IVF
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                Eye Care
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-teal-100 p-8">
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-teal-800">
                Quick Appointment Inquiry
              </h2>

              <p className="mt-3 text-gray-600">
                Talk to our clinic team and get appointment assistance through
                WhatsApp or inquiry form.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-teal-50 p-4">
                  Dental • Derma • IVF • Eye Care
                </div>

                <div className="rounded-xl bg-teal-50 p-4">
                  Fast response through WhatsApp
                </div>

                <div className="rounded-xl bg-teal-50 p-4">
                  Mobile-friendly patient experience
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                <MessageCircle size={20} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-5 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-white p-6 text-center shadow-sm"
            >
              <h2 className="text-3xl font-bold text-teal-700">
                {item.number}
              </h2>
              <p className="mt-2 text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Our Main Departments
          </h2>
          <p className="mt-3 text-gray-600">
            Choose the care you need and connect with our clinic team.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {departments.map((item) => (
            <Link
              to={item.path}
              key={item.title}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Ayurda Clinics?
            </h2>
            <p className="mt-3 text-gray-600">
              A simple, trustworthy and patient-friendly healthcare experience.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {whyChoose.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-700 px-5 py-16 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-teal-700">
              <Brain size={28} />
            </div>

            <h2 className="text-3xl font-bold md:text-4xl">
              Not sure which department to choose?
            </h2>

            <p className="mt-4 text-teal-50">
              Use our AI Symptom Guide to get basic direction for Dental,
              Dermatology, IVF, or Eye Care appointment inquiries.
            </p>
          </div>

          <div className="md:text-right">
            <Link
              to="/symptom-guide"
              className="inline-block rounded-full bg-white px-7 py-3 font-semibold text-teal-700"
            >
              Try AI Symptom Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              What Patients Say
            </h2>
            <p className="mt-3 text-gray-600">
              Patient feedback and care experience at Ayurda Clinics.
            </p>
          </div>

          <Link
            to="/testimonials"
            className="font-semibold text-teal-700 hover:text-teal-800"
          >
            View all testimonials →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex gap-1 text-yellow-500">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={18} fill="currentColor" />
                ))}
              </div>

              <p className="mt-4 leading-7 text-gray-600">“{item.text}”</p>

              <div className="mt-5 border-t pt-4">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm font-semibold text-teal-700">
                  {item.dept}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-7xl rounded-3xl bg-teal-950 p-8 text-center text-white md:p-12">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to book your appointment?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-teal-100">
            Submit an appointment inquiry or connect instantly on WhatsApp. Our
            clinic team will guide you.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/contact"
              className="rounded-full bg-white px-7 py-3 font-semibold text-teal-900"
            >
              Submit Inquiry
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-green-600 px-7 py-3 font-semibold text-white hover:bg-green-700"
            >
              WhatsApp Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;