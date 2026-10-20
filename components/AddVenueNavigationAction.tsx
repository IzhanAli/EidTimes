"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import AddEidgahDrawer from "./AddEidgahDrawer";

export default function AddVenueNavigationAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-add inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap px-2 sm:h-9 sm:gap-1.5 sm:px-3"
        onClick={() => setOpen(true)}
        aria-label="Add a prayer venue"
      >
        <Plus size={16} weight="bold" className="btn-add-icon" />
        <span className="sm:hidden">Add</span>
        <span className="hidden sm:inline">Add Venue</span>
      </button>
      <AddEidgahDrawer
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => undefined}
      />
    </>
  );
}
