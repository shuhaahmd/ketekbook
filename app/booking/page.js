
import { createClient } from "../../lib/supabase/server";
import BookingForm from "../../components/booking/BookingForm";
import "./booking.css";

export default async function BookingPage() {
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

  if (error) {
    return (
      <main className="booking-page">
        <p className="error-message">
          Unable to load courts: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-page-heading">
        <p className="section-eyebrow">LET'S GET YOU PLAYING</p>
        <h1>Book your <span>court.</span></h1>
        <p>
          Choose your court, pick your time, and get ready
          for your next game.
        </p>
      </div>

      <BookingForm courts={courts || []} />
    </main>
  );
}
