"use client";

import Link from "next/link";
import { List as MenuIcon, X } from "@phosphor-icons/react";
import { useState } from "react";

export default function AboutMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        className="h-9 w-9 grid place-items-center rounded-sm border border-ink/20 text-ink"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
      >
        {open ? <X size={21} /> : <MenuIcon size={22} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-paper-line bg-paper-card p-2 shadow-xl">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block rounded-sm px-3 py-2 text-sm font-medium text-ink hover:bg-emerald-soft/60"
          >
            Directory
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block rounded-sm px-3 py-2 text-sm font-medium text-ink hover:bg-emerald-soft/60"
          >
            About
          </Link>
        </div>
      )}
    </div>
  );
}
