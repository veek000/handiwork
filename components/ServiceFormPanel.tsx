"use client";

import { useState } from "react";
import type { PriceUnit, Service } from "@/types";
import { SidePanel } from "@/components/SidePanel";
import { Select } from "@/components/auth/Select";
import { Button } from "@/components/Button";
import { DocumentUpload } from "@/components/auth/DocumentUpload";

export interface ServiceDraft {
  category: string;
  price: number;
  priceUnit: PriceUnit;
  description: string;
  /** a new photo to upload (replaces the current one) */
  file?: File;
}

const UNITS: { unit: PriceUnit; label: string }[] = [
  { unit: "hr", label: "/hr" },
  { unit: "day", label: "/day" },
  { unit: "wk", label: "/wk" },
];

/**
 * ServiceFormPanel — vendor "Add New Service" / "Edit Service" (Figma desktop 6619:30518 /
 * 6619:30816, mobile 6619:42847 / 43047) in the shared SidePanel: Service Category,
 * Pricing (rate) + Pricing category (/hr · /day · /wk), About Service, Service Images.
 * Footer: Upload Service (add) or Save (edit) as secondary above Cancel (primary), per
 * Figma. The design has no separate title field, so a new service is titled by its
 * category. A picked photo is uploaded to Convex storage by the screen on save.
 */
export function ServiceFormPanel({
  categories,
  service,
  onSubmit,
  onClose,
}: {
  categories: string[];
  service?: Service;
  onSubmit: (draft: ServiceDraft) => void;
  onClose: () => void;
}) {
  const editing = Boolean(service);
  const [category, setCategory] = useState(service?.category ?? "");
  const [rate, setRate] = useState(service ? String(service.price) : "");
  const [unit, setUnit] = useState<PriceUnit>(service?.priceUnit ?? "hr");
  const [description, setDescription] = useState(service?.description ?? "");
  const [imageName, setImageName] = useState<string | undefined>();
  const [file, setFile] = useState<File | undefined>();
  const price = Number(rate);
  const ready = Boolean(category) && price > 0 && description.trim().length > 0;

  return (
    <SidePanel
      title={editing ? "Edit Service" : "Add New Service"}
      onClose={onClose}
      footer={
        <div className="hw-form__stack">
          <Button type="submit" form="hw-service-form" variant="secondary" block disabled={!ready}>
            {editing ? "Save" : "Upload Service"}
          </Button>
          <Button type="button" variant="primary" block onClick={onClose}>Cancel</Button>
        </div>
      }
    >
      <form
        id="hw-service-form"
        className="hw-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit({ category, price, priceUnit: unit, description: description.trim(), file });
        }}
      >
        <div className="hw-form__group">
          <span className="hw-form__label">Service Category</span>
          <Select
            ariaLabel="Service Category"
            value={category}
            placeholder="Select the services category"
            options={categories}
            onChange={setCategory}
          />
        </div>

        <div className="hw-form__pair">
          <label className="hw-form__group">
            <span className="hw-form__label">Pricing</span>
            <input
              className="hw-input"
              inputMode="numeric"
              placeholder="Enter Rate"
              aria-label="Rate in naira"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d]/g, ""))}
            />
          </label>
          <div className="hw-form__group">
            <span className="hw-form__label">Pricing category</span>
            <Select
              ariaLabel="Pricing category"
              value={UNITS.find((u) => u.unit === unit)!.label}
              options={UNITS.map((u) => u.label)}
              onChange={(label) => setUnit(UNITS.find((u) => u.label === label)!.unit)}
            />
          </div>
        </div>

        <label className="hw-form__group">
          <span className="hw-form__label">About Service</span>
          <textarea
            className="hw-input"
            rows={4}
            placeholder="Enter service description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="hw-form__group">
          <span className="hw-form__label">Service Images</span>
          <DocumentUpload title="Upload image" fileName={imageName} onFile={(n, f) => { setImageName(n); setFile(f); }} />
        </div>
      </form>
    </SidePanel>
  );
}

export default ServiceFormPanel;
