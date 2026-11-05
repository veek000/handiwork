"use client";

import { useCategories, useMyServices } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { VendorServicesScreen } from "@/components/VendorServicesScreen";

export default function VendorServicesPage() {
  const services = useMyServices();
  const categories = useCategories().map((c) => c.name);
  if (!services) return <LoadingState />;
  const all = Array.from(new Set([...categories, ...services.map((s) => s.category)])).sort();
  return <VendorServicesScreen services={services} categories={all} />;
}
