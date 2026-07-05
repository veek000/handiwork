import { categories } from "@/mocks/categories";
import { services } from "@/mocks/services";
import { Button } from "@/components/Button";
import { SearchBar } from "@/components/SearchBar";
import { CategoryTile } from "@/components/CategoryTile";
import { ServiceCard } from "@/components/ServiceCard";
import { formatNaira } from "@/lib/time";

// Customer Home (Figma 291:35211 desktop / 290:3862 mobile). Backed by real mock data:
// categories → mocks/categories, services → mocks/services. The signed-in user +
// notifications are handled by the shell (DashboardShell → DashboardHeader). Hero,
// invite banners and search are static/non-functional per the design scope.
// "Popular Services" = all mock services (no popularity flag by design).
export default function CustomerHome() {
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

      {/* Invite banners (static) — two colourways, each with an illustration */}
      <section className="hw-invite">
        <div className="hw-invite__card hw-invite__card--light">
          <div className="hw-invite__text">
            <p className="hw-invite__title">Invite your friends &amp; get up to {formatNaira(2000)}</p>
            <p className="hw-invite__sub">
              Introduce your friends to the easiest way to find and hire professionals for your needs.
            </p>
            <Button variant="primary">
              Invite Friends <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="14"></hw-icon>
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-invite__art" src="/assets/illustration/illustration-22.svg" alt="" aria-hidden="true" />
        </div>

        <div className="hw-invite__card hw-invite__card--dark">
          <div className="hw-invite__text">
            <p className="hw-invite__title">Invite your friends &amp; get up to {formatNaira(2000)}</p>
            <p className="hw-invite__sub">
              Introduce your friends to the easiest way to find and hire professionals for your needs.
            </p>
            <Button variant="secondary">
              Invite Friends <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="14"></hw-icon>
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-invite__art" src="/assets/illustration/illustration-23.svg" alt="" aria-hidden="true" />
        </div>
      </section>

      {/* Popular services */}
      <section className="hw-section">
        <div className="hw-section__head">
          <h2 className="hw-section__title">Popular Services</h2>
          <a href="#" className="hw-link">View all</a>
        </div>
        <div className="hw-svc-grid">
          {services.slice(0, 5).map((s) => (
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
