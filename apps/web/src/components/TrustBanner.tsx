import { t } from "@/lib/i18n";

export function TrustBanner() {
  const items = [
    { icon: "🔒", ...t.trust.secure },
    { icon: "📦", ...t.trust.shipping },
    { icon: "✨", ...t.trust.verified },
    { icon: "♻️", ...t.trust.sustainable },
  ];
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((i) => (
        <div key={i.title} className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{i.icon}</div>
          <div className="font-bold text-sm">{i.title}</div>
          <div className="text-xs text-gray-500">{i.text}</div>
        </div>
      ))}
    </section>
  );
}
