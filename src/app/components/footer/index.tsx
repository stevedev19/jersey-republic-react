import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Same footer as the archive homepage (e.g. /#drops) — used site-wide except admin.
 */
export default function Footer() {
  return (
    <footer className="bg-background text-on-background w-full py-20 px-6 md:px-12 border-t border-outline-variant/15">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        <div className="md:col-span-5">
          <span className="text-4xl font-monument text-white opacity-10 mb-8 block select-none">
            JERSEY REPUBLIC
          </span>
          <h3 className="font-headline font-bold text-white uppercase tracking-widest text-sm mb-6">
            JOIN THE ELITE LIST
          </h3>
          <p className="text-outline text-xs tracking-widest uppercase mb-8 leading-loose">
            Access early drops and exclusive archive insights.
          </p>
          <form
            className="flex max-w-sm flex-col sm:flex-row gap-2 sm:gap-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="flex-grow bg-surface-container-low border border-outline-variant/20 rounded-full sm:rounded-l-full sm:rounded-r-none px-6 py-4 text-xs font-headline tracking-widest focus:ring-primary focus:border-primary outline-none text-on-background"
              placeholder="EMAIL ADDRESS"
              type="email"
              name="email"
              autoComplete="email"
            />
            <button
              type="submit"
              className="bg-primary text-on-primary px-8 py-4 rounded-full sm:rounded-l-none sm:rounded-r-full font-headline font-bold text-xs tracking-widest hover:bg-primary-container transition-all whitespace-nowrap"
            >
              JOIN
            </button>
          </form>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <p className="font-headline font-bold text-white text-[10px] tracking-widest mb-4">ARCHIVE</p>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/products"
          >
            ALL JERSEYS
          </NavLink>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/products"
          >
            PLAYER EXCLUSIVES
          </NavLink>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/products"
          >
            VINTAGE REWIND
          </NavLink>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/help"
          >
            SIZE GUIDE
          </NavLink>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <p className="font-headline font-bold text-white text-[10px] tracking-widest mb-4">SUPPORT</p>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors underline underline-offset-8"
            to="/help"
          >
            SHIPPING
          </NavLink>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/help"
          >
            RETURNS
          </NavLink>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/help"
          >
            CONTACT
          </NavLink>
          <NavLink
            className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-primary transition-colors"
            to="/help"
          >
            AUTHENTICITY
          </NavLink>
        </div>
        <div className="md:col-span-3 flex flex-col items-start md:items-end gap-6">
          <p className="font-headline font-bold text-white text-[10px] tracking-widest mb-4 uppercase">
            SOCIALS
          </p>
          <div className="flex gap-4">
            <a
              className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary/20 transition-all border border-outline-variant/10"
              href="https://jerseyrepublic.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a
              className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary/20 transition-all border border-outline-variant/10"
              href="https://jerseyrepublic.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
        <div className="md:col-span-12 flex flex-col md:flex-row justify-between items-center pt-20 gap-8 border-t border-outline-variant/10">
          <p className="font-headline text-[10px] tracking-[0.4em] text-[#8f909e] uppercase">
            © {new Date().getFullYear()} JERSEY REPUBLIC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <NavLink
              className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-white"
              to="/help"
            >
              PRIVACY
            </NavLink>
            <NavLink
              className="text-[#8f909e] text-[10px] tracking-widest font-headline uppercase hover:text-white"
              to="/help"
            >
              TERMS
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
