import { t } from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-2">{t.brand}</h4>
          <p className="text-gray-500">{t.footer.desc}</p>
        </div>
        <div>
          <h4 className="font-bold mb-2">{t.footer.discover}</h4>
          <ul className="space-y-1 text-gray-600">
            {t.footer.discoverItems.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">{t.footer.help}</h4>
          <ul className="space-y-1 text-gray-600">
            {t.footer.helpItems.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">{t.footer.follow}</h4>
          <ul className="space-y-1 text-gray-600">
            <li>Instagram</li><li>Facebook</li><li>TikTok</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 pb-6">© 2026 {t.brand}</div>
    </footer>
  );
}
