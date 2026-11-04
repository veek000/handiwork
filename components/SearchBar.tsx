"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

/**
 * SearchBar — the Home hero search. Uses the established Input component (default/focus/
 * disabled states) + a secondary Button. Submitting opens the Search screen with the
 * query (`/customer/search?q=…`); an empty submit opens it on Popular Searches.
 * Styling: .hw-search*.
 */
export function SearchBar() {
  const router = useRouter();
  return (
    <form
      className="hw-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/customer/search?q=${encodeURIComponent(q)}` : "/customer/search");
      }}
    >
      <Input
        className="hw-search__input"
        type="search"
        name="q"
        placeholder="Search by role, skills or keywords"
        aria-label="Search"
      />
      <Button type="submit" variant="secondary" className="hw-search__btn">Search</Button>
    </form>
  );
}

export default SearchBar;
