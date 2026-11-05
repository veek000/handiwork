import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { useCategories, useCurrentUser } from "@/hooks";

// Settings. `?tab=` is read on the server (see customer/search/page.tsx for why not
// useSearchParams); the data hooks run in the sync inner component.
export default async function CustomerSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  return <Settings tab={Array.isArray(tab) ? tab[0] : tab} />;
}

function Settings({ tab }: { tab?: string }) {
  return (
    <SettingsScreen
      role="customer"
      fallbackUser={useCurrentUser("customer")}
      serviceOptions={useCategories().map((c) => c.name)}
      initialTab={tab}
    />
  );
}
