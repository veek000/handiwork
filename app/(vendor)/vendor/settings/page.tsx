import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { categories } from "@/data/categories";

// Settings. `?tab=` is read on the server (see customer/search/page.tsx for why not
// useSearchParams); the account data is live in the client screen.
export default async function VendorSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  return (
    <SettingsScreen
      role="vendor"
      serviceOptions={categories.map((c) => c.name)}
      initialTab={Array.isArray(tab) ? tab[0] : tab}
    />
  );
}
