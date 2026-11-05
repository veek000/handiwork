import { VendorProfileLoader } from "./VendorProfileLoader";

// Vendor Profile View. `?from=` is the service the customer came from; `?q=` the search.
export default async function VendorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[]; q?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  return <VendorProfileLoader id={id} from={one(sp.from)} query={one(sp.q)} />;
}
