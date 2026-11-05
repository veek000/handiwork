"use client";

import { notFound } from "next/navigation";
import { useServiceDetail } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { ServiceDetailScreen } from "@/components/ServiceDetailScreen";

export function ServiceDetailLoader({ id, query }: { id: string; query: string }) {
  const data = useServiceDetail(id);
  if (data === undefined) return <LoadingState />;
  if (data === null) notFound();
  return <ServiceDetailScreen {...data} query={query} />;
}
