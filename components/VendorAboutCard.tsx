import Link from "next/link";
import type { VendorUser } from "@/types";
import { Avatar } from "@/components/Avatar";

/**
 * VendorAboutCard — "About {first name}" on Service Detail (Figma 6619:3942
 * "Frame 1000011046", 361px column on desktop / full width under Book Service on
 * mobile): verified avatar, name + Available badge, location, bio, and a
 * "View Profile" secondary action. Styling: .hw-about*.
 */
export function VendorAboutCard({ vendor, profileHref }: { vendor: VendorUser; profileHref: string }) {
  const first = vendor.fullName.split(" ")[0];
  return (
    <section className="hw-about" aria-labelledby={`about-${vendor.id}`}>
      <div className="hw-about__top">
        <h2 id={`about-${vendor.id}`} className="hw-about__title">About {first}</h2>
        <div className="hw-about__who">
          <Avatar name={vendor.fullName} src={vendor.avatarUrl} size={40} verified={vendor.verified} />
          <div className="hw-about__id">
            <span className="hw-about__namerow">
              <span className="hw-about__name">{first}</span>
              {vendor.availability === "available" ? <span className="hw-badge">Available</span> : null}
            </span>
            <span className="hw-about__loc">
              <hw-icon suppressHydrationWarning name="map-pin" variant="hollow" size="12"></hw-icon>
              {vendor.location}
            </span>
          </div>
        </div>
        <p className="hw-about__bio">{vendor.bio}</p>
      </div>
      <Link href={profileHref} className="hw-about__cta">View Profile</Link>
    </section>
  );
}

export default VendorAboutCard;
