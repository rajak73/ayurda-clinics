import { MessageCircle } from "lucide-react";

function WhatsAppButton() {
  const phone = "917799889398";
  const message = "Hi Ayurda Clinics, I want to book an appointment.";
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-green-700"
    >
      <MessageCircle size={20} />
      WhatsApp
    </a>
  );
}

export default WhatsAppButton;