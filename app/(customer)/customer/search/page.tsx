import { SearchScreen } from "@/components/SearchScreen";

// Search & Discovery. `?q=` is read here on the server and passed down — reading it with
// useSearchParams would need a Suspense boundary, and <hw-icon> upgrades inside the
// streamed boundary before React hydrates it (hydration mismatch).
export default async function CustomerSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  return <SearchScreen query={(Array.isArray(q) ? q[0] : q)?.trim() ?? ""} />;
}
