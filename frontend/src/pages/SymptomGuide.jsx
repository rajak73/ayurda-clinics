import { useState } from "react";
import { Brain, MessageCircle, AlertTriangle } from "lucide-react";

function SymptomGuide() {
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState(null);

  const symptomRules = [
    {
      department: "Dental Care",
      keywords: [
        "tooth",
        "teeth",
        "gum",
        "cavity",
        "root canal",
        "bad breath",
        "tooth pain",
        "bleeding gum",
        "sensitivity",
      ],
      advice:
        "Your concern seems related to Dental Care. You may book an appointment with the dental department.",
    },
    {
      department: "Dermatology",
      keywords: [
        "skin",
        "acne",
        "pimple",
        "rash",
        "itching",
        "hair fall",
        "pigmentation",
        "allergy",
        "fungal",
        "dark spot",
      ],
      advice:
        "Your concern seems related to Dermatology. You may consult the dermatology department for skin or hair-related concerns.",
    },
    {
      department: "IVF & Fertility",
      keywords: [
        "fertility",
        "ivf",
        "pregnancy",
        "conceive",
        "couple",
        "reproductive",
        "infertility",
        "family planning",
      ],
      advice:
        "Your concern seems related to IVF & Fertility Care. You may book a confidential fertility consultation.",
    },
    {
      department: "Eye Care",
      keywords: [
        "eye",
        "vision",
        "redness",
        "dry eye",
        "blur",
        "watery eye",
        "eye pain",
        "irritation",
        "spectacles",
      ],
      advice:
        "Your concern seems related to Eye Care. You may consult the eye care department.",
    },
  ];

  const quickSymptoms = [
    "Tooth pain",
    "Bleeding gums",
    "Acne and pimples",
    "Hair fall",
    "Skin allergy",
    "Fertility consultation",
    "Difficulty conceiving",
    "Eye redness",
    "Blurred vision",
    "Dry eyes",
  ];

  const analyzeSymptom = (inputText) => {
    const text = inputText.toLowerCase();

    if (!text.trim()) {
      setResult({
        department: "Not selected",
        advice: "Please enter or select a symptom first.",
        confidence: "Low",
      });
      return;
    }

    let matchedResult = null;
    let maxMatches = 0;

    symptomRules.forEach((rule) => {
      const matches = rule.keywords.filter((keyword) =>
        text.includes(keyword)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        matchedResult = rule;
      }
    });

    if (matchedResult) {
      setResult({
        department: matchedResult.department,
        advice: matchedResult.advice,
        confidence: maxMatches >= 2 ? "High" : "Medium",
      });
    } else {
      setResult({
        department: "General Inquiry",
        advice:
          "We could not identify a specific department from your concern. Please contact the clinic team for guidance.",
        confidence: "Low",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeSymptom(symptom);
  };

  const handleQuickSelect = (item) => {
    setSymptom(item);
    analyzeSymptom(item);
  };

  const getWhatsAppLink = () => {
    const phone = "917799889398";
    const message = result
      ? `Hi Ayurda Clinics, I used the symptom guide. My concern is: ${symptom}. Suggested department: ${result.department}. I want to book an appointment.`
      : `Hi Ayurda Clinics, I want appointment guidance.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="bg-gray-50">
      <section className="bg-teal-50 px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Brain size={32} />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            AI Symptom Guide
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Share your basic concern and get guidance about which department may be suitable for your appointment.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Enter Your Concern
          </h2>

          <p className="mt-2 text-gray-600">
            Example: tooth pain, acne, hair fall, eye redness, fertility consultation.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows="6"
              placeholder="Type your symptom or concern here..."
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-teal-700"
            ></textarea>

            <button className="mt-5 w-full rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
              Analyze Concern
            </button>
          </form>

          <div className="mt-8">
            <h3 className="font-bold text-gray-900">Quick Select</h3>

            <div className="mt-4 flex flex-wrap gap-3">
              {quickSymptoms.map((item) => (
                <button
                  key={item}
                  onClick={() => handleQuickSelect(item)}
                  className="rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Suggested Guidance
          </h2>

          {!result ? (
            <div className="mt-6 rounded-2xl bg-gray-50 p-6 text-gray-600">
              Enter your concern and click analyze to see department guidance.
            </div>
          ) : (
            <div className="mt-6">
              <div className="rounded-3xl bg-teal-50 p-6">
                <p className="text-sm font-semibold uppercase text-teal-700">
                  Suggested Department
                </p>

                <h3 className="mt-2 text-3xl font-bold text-teal-900">
                  {result.department}
                </h3>

                <p className="mt-4 text-gray-700">{result.advice}</p>

                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Confidence: {result.confidence}
                </p>
              </div>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                <MessageCircle size={20} />
                Continue on WhatsApp
              </a>
            </div>
          )}

          <div className="mt-8 flex gap-3 rounded-2xl bg-yellow-50 p-5 text-yellow-800">
            <AlertTriangle className="mt-1 shrink-0" size={22} />
            <p>
              This guide is only for basic appointment direction. It does not provide diagnosis or medical treatment advice. Please consult a qualified doctor.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SymptomGuide;