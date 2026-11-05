"use client";

import { notFound } from "next/navigation";
import { useVendorProfile } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { VendorProfileScreen } from "@/components/VendorProfileScreen";

export function VendorProfileLoader({ id, from, query }: { id: string; from: string; query: string }) {
  const data = useVendorProfile(id, from || undefined);
  if (data === undefined) return <LoadingState />;
  if (data === null) notFound();
  return <VendorProfileScreen vendor={data.vendor} services={data.services} reviews={data.reviews} from={data.from} query={query} />;
}
