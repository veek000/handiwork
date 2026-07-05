"use client";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

/**
 * SearchBar — the hero search. Uses the established Input component (default/focus/
 * disabled states) + a secondary Button, rather than a bare input. Non-functional in
 * this prototype (submit prevented; no backend). Styling: .hw-search*.
 */
export function SearchBar() {
  return (
    <form className="hw-search" onSubmit={(e) => e.preventDefault()} role="search">
      <Input
        className="hw-search__input"
        type="search"
        placeholder="Search by role, skills or keywords"
        aria-label="Search"
      />
      <Button type="submit" variant="secondary" className="hw-search__btn">Search</Button>
    </form>
  );
}

export default SearchBar;
