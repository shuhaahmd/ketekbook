
import Link from "next/link";

export default function CourtCard({ court, index = 0 }) {
  const sport = court.sports?.name || "Sports";
  const isFutsal = sport === "Futsal";
  const courtNumber = court.name.match(/\d+/)?.[0] || index + 1;
  const price = Number(court.hourly_rate);

  return (
    <article className="court-card">
      <div
        className={`court-visual ${
          isFutsal ? "futsal-visual" : "pickleball-visual"
        }`}
      >
        <div className="visual-top">
          <span className="sport-tag">
            {isFutsal ? "⚽ FUTSAL" : "🏓 PICKLEBALL"}
          </span>

          <span className="court-number">
            {String(courtNumber).padStart(2, "0")}
          </span>
        </div>

        <div className="court-art">
          <div className="court-center-line" />
          <div className="court-center-circle" />
          <div className="court-side-box left-box" />
          <div className="court-side-box right-box" />
        </div>

        <span className="visual-caption">
          KETEKBOOK SPORTS CLUB
        </span>
      </div>

      <div className="court-info">
        <div>
          <p className="court-category">{sport} COURT</p>
          <h3>{court.name}</h3>
        </div>

        <div className="court-bottom">
          <div className="court-price">
            {price > 0 ? (
              <>
                <strong>RM {price.toFixed(2)}</strong>
                <span>/ hour</span>
              </>
            ) : (
              <span className="price-pending">
                Pricing coming soon
              </span>
            )}
          </div>
        </div>

        <Link
        href={`/booking?courtId=${court.id}`}
         className="court-book-button"
        >
           Book This Court
        </Link>
      </div>
    </article>
  );
}
