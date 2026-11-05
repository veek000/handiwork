import { ServiceDetailLoader } from "./ServiceDetailLoader";

// Service Detail. Params are read on the server; the data is a live Convex query in the
// client loader (see customer/search/page.tsx for why ?q= isn't read with useSearchParams).
export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  return <ServiceDetailLoader id={id} query={(Array.isArray(q) ? q[0] : q)?.trim() ?? ""} />;
}
