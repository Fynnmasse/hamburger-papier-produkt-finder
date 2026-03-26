import { Phone } from 'lucide-react'

export function FinderFooter() {
  return (
    <footer className="bg-navy border-t border-white/10 pt-10 pb-6 px-4" suppressHydrationWarning>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
        {/* Kontakt */}
        <div className="text-center sm:text-left">
          <p className="font-display font-bold text-white text-sm">Hamburgpapier</p>
          <p className="text-white/50 text-xs mt-1">Ihr Partner für Hygienepapier</p>
          <a href="tel:+494056194820" className="flex items-center justify-center sm:justify-start gap-1.5 text-primary text-xs mt-2 hover:text-primary/80 transition-colors">
            <Phone size={13} aria-hidden="true" />
            040 56 194 82 20
          </a>
          <p className="text-white/40 text-xs mt-1">Mo–Fr 8:00 – 17:00 Uhr</p>
        </div>

        {/* Rechts-Links */}
        <nav aria-label="Rechtliche Links" className="flex flex-wrap justify-center sm:justify-end gap-x-5 gap-y-2 text-xs">
          <a href="https://www.hamburgpapier-shop.de/Informationen/Impressum/" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors">Impressum</a>
          <a href="https://www.hamburgpapier-shop.de/Informationen/Datenschutz/" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors">Datenschutz</a>
          <a href="https://www.hamburgpapier-shop.de/Informationen/AGB/" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors">AGB</a>
          <a href="https://www.hamburgpapier-shop.de/Informationen/Widerrufsrecht/" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors">Widerrufsrecht</a>
          <a href="https://www.hamburgpapier-shop.de" target="_blank" rel="noopener" className="text-white/50 hover:text-white transition-colors">Zum Shop</a>
        </nav>
      </div>

      {/* Copyright */}
      <div className="max-w-5xl mx-auto mt-8 pt-4 border-t border-white/5 text-center text-[11px] text-white/30">
        © {new Date().getFullYear()} Hamburgpapier · Alle Preise inkl. 19% MwSt.
      </div>
    </footer>
  )
}
