function About() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <h1 className="text-4xl font-bold text-gray-900">About Ayurda Clinics</h1>

      <p className="mt-5 max-w-3xl text-lg text-gray-600">
        Ayurda Clinics is a patient-focused healthcare clinic offering trusted
        care in Dental, Dermatology, IVF and Eye Care. Our mission is to provide
        ethical, affordable and compassionate treatment through experienced
        doctors and modern healthcare practices.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-teal-50 p-6">
          <h2 className="text-xl font-bold text-teal-800">Our Mission</h2>
          <p className="mt-3 text-gray-600">
            To provide quality healthcare with trust, transparency and care.
          </p>
        </div>

        <div className="rounded-2xl bg-teal-50 p-6">
          <h2 className="text-xl font-bold text-teal-800">Our Vision</h2>
          <p className="mt-3 text-gray-600">
            To become a reliable healthcare destination for families.
          </p>
        </div>

        <div className="rounded-2xl bg-teal-50 p-6">
          <h2 className="text-xl font-bold text-teal-800">Our Values</h2>
          <p className="mt-3 text-gray-600">
            Compassion, ethics, patient safety and continuous improvement.
          </p>
        </div>
      </div>
    </main>
  );
}

export default About;