"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List as MenuIcon, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Directory" },
  { href: "/about", label: "About" },
  { href: "/guide", label: "Eid Guide" },
];

export default function MobileNavigation({ buttonClassName = "h-9 w-9" }: { buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className={`${buttonClassName} grid place-items-center rounded-sm border border-ink/20 text-ink`}
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <MenuIcon size={22} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-ink/20 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu overlay"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed right-3 top-3 z-50 w-56 rounded-xl border border-paper-line bg-paper-card p-3 shadow-2xl"
          >
            <button
              type="button"
              className="ml-auto grid h-9 w-9 place-items-center rounded-md border border-ink/15 text-ink transition hover:bg-emerald-soft/60"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>

            <nav className="mt-3 space-y-1" aria-label="Mobile navigation">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-sm font-medium transition ${
                      active ? "bg-emerald text-paper" : "text-ink hover:bg-emerald-soft/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
