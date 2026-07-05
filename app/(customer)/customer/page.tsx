import { useCategories, useServices } from "@/hooks";
import { Button } from "@/components/Button";
import { SearchBar } from "@/components/SearchBar";
import { CategoryTile } from "@/components/CategoryTile";
import { ServiceCard } from "@/components/ServiceCard";
import { InviteCarousel } from "@/components/InviteCarousel";

// Customer Home (Figma 291:35211 desktop / 290:3862 mobile). Backed by real mock data:
// categories → mocks/categories, services → mocks/services. The signed-in user +
// notifications are handled by the shell (DashboardShell → DashboardHeader). Hero,
// invite banners and search are static/non-functional per the design scope.
// "Popular Services" = all mock services (no popularity flag by design).
export default function CustomerHome() {
  const categories = useCategories();
  const services = useServices();
  return (
    <div className="hw-home">
      {/* Hero */}
      <section className="hw-hero">
        <div className="hw-hero__inner">
          <h1 className="hw-hero__title">Book a True Professional</h1>
          <p className="hw-hero__sub">
            Find a verified artisan like a <span className="hw-hero__tag">Carpenter</span>
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Browse categories */}
      <section className="hw-section">
        <div className="hw-section__head">
          <h2 className="hw-section__title">Browse all categories</h2>
          <a href="#" className="hw-link">View all</a>
        </div>
        <div className="hw-cat-grid">
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Invite banners — two colourways; horizontal swipe + dots on mobile. */}
      <InviteCarousel />

      {/* Popular services */}
      <section className="hw-section">
        <div className="hw-section__head">
          <h2 className="hw-section__title">Popular Services</h2>
          <a href="#" className="hw-link">View all</a>
        </div>
        <div className="hw-svc-grid">
          {/* 6 on mobile (2×3), 5 on desktop (the 6th is hidden ≥1024px). */}
          {services.slice(0, 6).map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              action={<Button variant="primary" block>Book Service</Button>}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
