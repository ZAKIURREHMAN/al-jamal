import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { storeConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto bg-green-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo light height={34} />
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Slow-cooked desi ghee made from cultured butter in small batches. Delivered to your door across Pakistan — pay on delivery.
            </p>
            <div className="flex gap-2">
              <a href={storeConfig.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2.5 transition hover:bg-gold hover:text-charcoal"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg></a>
              <a href={storeConfig.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2.5 transition hover:bg-gold hover:text-charcoal"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold">Shop</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/cart" className="hover:text-white">Your Cart</Link></li>
              <li><Link href="/checkout" className="hover:text-white">Checkout</Link></li>
              <li><Link href="/track" className="hover:text-white">Track an Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold">Company</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="/#story" className="hover:text-white">Our Story</Link></li>
              <li><Link href="/#why" className="hover:text-white">Why Our Ghee</Link></li>
              <li><Link href="/#how-to-use" className="hover:text-white">How to Use</Link></li>
              <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold">Contact</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><a href={`tel:${storeConfig.contact.phone.replace(/\s/g, "")}`} className="hover:text-white">{storeConfig.contact.phone}</a></li>
              <li className="flex items-start gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><a href={`mailto:${storeConfig.contact.email}`} className="hover:text-white">{storeConfig.contact.email}</a></li>
              <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span>{storeConfig.contact.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {storeConfig.name}. All rights reserved.</p>
          <p>Cash on Delivery available nationwide.</p>
        </div>
      </div>
    </footer>
  );
}
