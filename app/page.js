
import { createClient } from "../lib/supabase/server";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CourtCard from "../components/courts/CourtCard";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const { data: courts, error } = await supabase
    .from("courts")
    .select(`
      id,
      name,
      hourly_rate,
      sports (
        name
      )
    `)
    .eq("is_active", true)
    .order("name");

  const pickleballCourts =
    courts?.filter(
      (court) => court.sports?.name === "Pickleball"
    ) || [];

  const futsalCourts =
    courts?.filter(
      (court) => court.sports?.name === "Futsal"
    ) || [];

  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" />
            YOUR GAME. YOUR TIME.
          </div>

          <h1>
            Make time
            <br />
            for <span>your game.</span>
          </h1>

          <p className="hero-description">
            Your next game starts here. Find your court,
            bring your people, and make every match count.
          </p>

          <div className="hero-actions">
          <Link href="/booking" className="primary-button">
               Book Court <span>↗</span>
          </Link>

            <a href="#about" className="secondary-button">
              Discover KetekBook <span>↓</span>
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>05</strong>
              <span>Sports courts</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>02</strong>
              <span>Sports available</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>01</strong>
              <span>Place to play</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="art-glow" />

          <div className="art-label art-label-top">
            PLAY YOUR WAY
          </div>

          <div className="hero-court">
            <div className="hero-court-line horizontal" />
            <div className="hero-court-line vertical" />
            <div className="hero-court-circle" />
            <div className="hero-court-box left" />
            <div className="hero-court-box right" />
            <div className="hero-court-net" />
          </div>

          <div className="art-floating-card">
            <span className="floating-icon">✳</span>
            <div>
              <strong>Game on.</strong>
              <span>Your court awaits.</span>
            </div>
          </div>

          <div className="art-label art-label-bottom">
            01 / 05 COURTS
          </div>
        </div>

        <div className="hero-background-text">PLAY</div>
      </section>

      {/* Features */}
      <section className="feature-strip" id="about">
        <div className="feature-item">
          <span className="feature-icon">◷</span>
          <div>
            <strong>Flexible booking</strong>
            <span>Choose your playing duration</span>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">⌖</span>
          <div>
            <strong>All in one place</strong>
            <span>Pickleball and futsal courts</span>
          </div>
        </div>

        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <div>
            <strong>Easy reservations</strong>
            <span>A simpler way to book your game</span>
          </div>
        </div>
      </section>

      {/* Courts */}
      <section className="courts-section" id="courts">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">
              FIND YOUR PLAYING SPACE
            </p>

            <h2>
              Pick your <span>court.</span>
            </h2>

            <p className="section-description">
              Whatever your game, there's a space waiting for you.
            </p>
          </div>

          <span className="court-count">05 COURTS TOTAL</span>
        </div>

        {error && (
          <p className="error-message">
            Unable to load courts: {error.message}
          </p>
        )}

        {!error && courts?.length === 0 && (
          <p>No active courts are available right now.</p>
        )}

        {[
          {
            name: "Pickleball",
            icon: "🏓",
            items: pickleballCourts,
          },
          {
            name: "Futsal",
            icon: "⚽",
            items: futsalCourts,
          },
        ].map((group) => (
          group.items.length > 0 && (
            <div className="sport-group" key={group.name}>
              <div className="sport-heading">
                <div>
                  <span className="sport-heading-icon">
                    {group.icon}
                  </span>
                  <h3>{group.name}</h3>
                </div>

                <span>{group.items.length} COURTS</span>
              </div>

              <div className="court-grid">
                {group.items.map((court, index) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </section>

      {/* Booking call to action */}
      <section className="booking-banner" id="booking-info">
        <div>
          <p className="section-eyebrow">
            READY WHEN YOU ARE
          </p>

          <h2>
            Your next game
            <br />
            starts with a <span>booking.</span>
          </h2>
        </div>

        <a href="#courts" className="banner-button">
  Explore Courts <span>↗</span>
</a>
      </section>

      <Footer />
    </main>
  );
}
