
"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function BookingForm({ courts }) {
  const [courtId, setCourtId] = useState(courts[0]?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Read the selected court from the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedCourtId = params.get("courtId");

    if (
      selectedCourtId &&
      courts.some((court) => court.id === selectedCourtId)
    ) {
      setCourtId(selectedCourtId);
    }
  }, [courts]);

  const selectedCourt = courts.find(
    (court) => court.id === courtId
  );

  const hourlyRate = Number(selectedCourt?.hourly_rate || 0);
  const playingDuration = Number(duration);

  const estimatedPrice =
    hourlyRate * (playingDuration / 60);

  const startMinutes = startTime
    ? Number(startTime.split(":")[0]) * 60 +
      Number(startTime.split(":")[1])
    : null;

  const validDuration =
    Number.isFinite(playingDuration) &&
    playingDuration >= 15 &&
    playingDuration <= 480 &&
    playingDuration % 15 === 0;

  // Generate available start times in 15-minute intervals
  // Operating hours: 8:00 AM - 12:00 AM

  const availableStartTimes = validDuration
    ? Array.from(
        {
          length:
            Math.floor(
              (1440 - playingDuration - 480) / 15
            ) + 1,
        },
        (_, index) => {
          const totalMinutes = 480 + index * 15;

          const hour = Math.floor(totalMinutes / 60);
          const minute = totalMinutes % 60;

          const displayHour = hour % 12 || 12;
          const period = hour >= 12 ? "PM" : "AM";

          return {
            value: `${String(hour).padStart(2, "0")}:${String(
              minute
            ).padStart(2, "0")}`,
            label: `${displayHour}:${String(minute).padStart(
              2,
              "0"
            )} ${period}`,
          };
        }
      )
    : [];

  const selectedStartTimeLabel =
    availableStartTimes.find(
      (time) => time.value === startTime
    )?.label || "Not selected";

  const remainingMinutes =
    startMinutes === null
      ? 480
      : Math.max(0, 1440 - startMinutes);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuching",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  function resetReview() {
    setShowReview(false);
    setErrorMessage("");
  }

  function handleReview(event) {
    event.preventDefault();

    if (
      !date ||
      !startTime ||
      !duration ||
      !customerPhone.trim()
    ) {
      alert("Please complete all required details.");
      return;
    }

    const phone = customerPhone.trim();

    if (!/^\+?[0-9][0-9 -]{7,19}$/.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (date < today) {
      alert("Please select today or a future date.");
      return;
    }

    if (
      startMinutes === null ||
      startMinutes < 480 ||
      startMinutes >= 1440 ||
      startMinutes % 15 !== 0 ||
      !validDuration ||
      startMinutes + playingDuration > 1440
    ) {
      alert(
        "Bookings must be between 8:00 AM and 12:00 AM. Please check your start time and duration."
      );
      return;
    }

    setErrorMessage("");
    setShowReview(true);
  }

  async function handleConfirmBooking() {
    if (isSubmitting || confirmation) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "create_guest_booking",
        {
          p_court_id: courtId,
          p_booking_date: date,
          p_start_time: startTime,
          p_duration_minutes: playingDuration,
          p_customer_name: customerName.trim() || null,
          p_customer_phone: customerPhone.trim(),
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.booking_reference) {
        throw new Error(
          "Booking was saved, but confirmation details could not be loaded. Please contact the facility before trying again."
        );
      }

      setConfirmation(data);
      setShowReview(false);
    } catch (error) {
      console.error("Booking error:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Not selected";

    return new Date(
      `${dateString}T12:00:00+08:00`
    ).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kuching",
    });
  }

  if (courts.length === 0) {
    return (
      <div className="booking-empty">
        <h3>No courts available</h3>
        <p>Please check again later.</p>
      </div>
    );
  }

  // =====================================
  // SUCCESSFUL BOOKING
  // =====================================

  if (confirmation) {
    return (
      <div className="booking-layout">
        <section className="booking-form">
          <div className="booking-form-header">
            <span className="booking-step">✓</span>

            <div>
              <h2>Booking confirmed!</h2>
              <p>
                Your court reservation has been saved.
              </p>
            </div>
          </div>

          <div className="review-message">
            <strong>You're all set!</strong>

            <p>
              Keep your booking reference for future enquiries.
            </p>
          </div>

          <div className="summary-detail">
            <span>Booking reference</span>
            <strong>{confirmation.booking_reference}</strong>
          </div>

          <div className="summary-detail">
            <span>Booking status</span>
            <strong>Confirmed</strong>
          </div>

          <div className="summary-detail">
            <span>Payment status</span>
            <strong>Unpaid</strong>
          </div>

          <p className="summary-note">
            Please contact the facility if you need
            assistance with your reservation.
          </p>

          <button
            type="button"
            className="booking-submit"
            onClick={() => (window.location.href = "/")}
          >
            Back to home <span>↗</span>
          </button>
        </section>

        <aside className="booking-summary">
          <div className="summary-top">
            <p className="section-eyebrow">
              BOOKING CONFIRMATION
            </p>

            <h2>Your reservation</h2>
          </div>

          <div className="summary-court">
            <span className="summary-icon">
              {confirmation.sport_name === "Futsal"
                ? "⚽"
                : "🏓"}
            </span>

            <div>
              <span>{confirmation.sport_name}</span>
              <strong>{confirmation.court_name}</strong>
            </div>
          </div>

          <div className="summary-detail">
            <span>Reference</span>
            <strong>{confirmation.booking_reference}</strong>
          </div>

          <div className="summary-detail">
            <span>Date</span>
            <strong>
              {formatDate(confirmation.booking_date)}
            </strong>
          </div>

          <div className="summary-detail">
            <span>Start time</span>
            <strong>{confirmation.start_time}</strong>
          </div>

          <div className="summary-detail">
            <span>End time</span>
            <strong>{confirmation.end_time}</strong>
          </div>

          <div className="summary-detail">
            <span>Duration</span>
            <strong>
              {confirmation.duration_minutes} minutes
            </strong>
          </div>

          <div className="summary-detail">
            <span>Customer</span>
            <strong>
              {confirmation.customer_name || "Not provided"}
            </strong>
          </div>

          <div className="summary-detail">
            <span>Phone number</span>
            <strong>{confirmation.customer_phone}</strong>
          </div>

          <div className="summary-total">
            <span>Total amount</span>
            <strong>
              RM {Number(confirmation.total_amount).toFixed(2)}
            </strong>
          </div>

          <p className="summary-note">
            Payment: Unpaid
          </p>
        </aside>
      </div>
    );
  }

  // =====================================
  // BOOKING FORM
  // =====================================

  return (
    <div className="booking-layout">
      <form
        className="booking-form"
        onSubmit={handleReview}
      >
        <div className="booking-form-header">
          <span className="booking-step">01</span>

          <div>
            <h2>Booking details</h2>
            <p>
              Tell us when you would like to play.
            </p>
          </div>
        </div>

        {/* COURT SELECTION */}

        <div className="form-group">
          <label htmlFor="court">
            Select your court
          </label>

          <select
            id="court"
            value={courtId}
            onChange={(event) => {
              setCourtId(event.target.value);
              resetReview();
            }}
            required
          >
            {courts.map((court) => (
              <option
                key={court.id}
                value={court.id}
              >
                {court.sports?.name} — {court.name}
              </option>
            ))}
          </select>
        </div>

        {/* DATE AND TIME */}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">
              Booking date
            </label>

            <input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(event) => {
                setDate(event.target.value);
                setStartTime("");
                resetReview();
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">
              Start time
            </label>

            <select
              id="time"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                resetReview();
              }}
              required
            >
              <option value="">Select a time</option>

              {availableStartTimes.map((time) => (
                <option
                  key={time.value}
                  value={time.value}
                >
                  {time.label}
                </option>
              ))}
            </select>

            <p className="form-hint">
              Available times are shown in 15-minute
              intervals. Operating hours: 8:00 AM – 12:00 AM.
            </p>
          </div>
        </div>

        {/* DURATION */}

        <div className="form-group">
          <label htmlFor="duration">
            Playing duration
          </label>

          <div className="duration-input">
            <input
              id="duration"
              type="number"
              min="15"
              max={Math.min(480, remainingMinutes)}
              step="15"
              value={duration}
              onChange={(event) => {
                setDuration(event.target.value);
                setStartTime("");
                resetReview();
              }}
              required
            />

            <span>minutes</span>
          </div>

          <p className="form-hint">
            Choose between 15 and 480 minutes,
            in 15-minute increments. Your session
            must finish by midnight.
          </p>
        </div>

        {/* CUSTOMER DETAILS */}

        <div className="booking-form-header">
          <span className="booking-step">02</span>

          <div>
            <h2>Your details</h2>
            <p>
              No account needed. Just your contact number.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="customerName">
            Full name (Optional)
          </label>

          <input
            id="customerName"
            type="text"
            placeholder="Enter your name"
            maxLength={100}
            value={customerName}
            onChange={(event) => {
              setCustomerName(event.target.value);
              resetReview();
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customerPhone">
            Phone number *
          </label>

          <input
            id="customerPhone"
            type="tel"
            placeholder="e.g. 0123456789"
            maxLength={20}
            value={customerPhone}
            onChange={(event) => {
              setCustomerPhone(event.target.value);
              resetReview();
            }}
            required
          />

          <p className="form-hint">
            Used for booking enquiries and confirmation.
          </p>
        </div>

        <button
          type="submit"
          className="booking-submit"
        >
          Review booking <span>↗</span>
        </button>
      </form>

      {/* BOOKING SUMMARY */}

      <aside className="booking-summary">
        <div className="summary-top">
          <p className="section-eyebrow">
            YOUR SELECTION
          </p>

          <h2>Booking summary</h2>
        </div>

        <div className="summary-court">
          <span className="summary-icon">
            {selectedCourt?.sports?.name === "Futsal"
              ? "⚽"
              : "🏓"}
          </span>

          <div>
            <span>{selectedCourt?.sports?.name}</span>
            <strong>{selectedCourt?.name}</strong>
          </div>
        </div>

        <div className="summary-detail">
          <span>Date</span>
          <strong>
            {date ? formatDate(date) : "Not selected"}
          </strong>
        </div>

        <div className="summary-detail">
          <span>Start time</span>
          <strong>{selectedStartTimeLabel}</strong>
        </div>

        <div className="summary-detail">
          <span>Duration</span>
          <strong>
            {duration ? `${duration} minutes` : "Not selected"}
          </strong>
        </div>

        <div className="summary-detail">
          <span>Customer</span>
          <strong>
            {customerName.trim() || "Not provided"}
          </strong>
        </div>

        <div className="summary-detail">
          <span>Phone number</span>
          <strong>{customerPhone || "Not provided"}</strong>
        </div>

        <div className="summary-total">
          <span>Estimated total</span>

          <strong>
            {hourlyRate > 0 && validDuration
              ? `RM ${estimatedPrice.toFixed(2)}`
              : "Pricing coming soon"}
          </strong>
        </div>

        {showReview && (
          <div className="review-message">
            <strong>Ready to confirm?</strong>

            <p>
              Please check your booking details before
              confirming your reservation.
            </p>

            <button
              type="button"
              onClick={() => setShowReview(false)}
              disabled={isSubmitting}
            >
              Edit details
            </button>

            <button
              type="button"
              className="booking-submit"
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Confirming..."
                : "Confirm Booking"}
              {!isSubmitting && <span> ↗</span>}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="review-message">
            <strong>Unable to confirm booking</strong>
            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
            >
              Dismiss
            </button>
          </div>
        )}

        <p className="summary-note">
          No online payment required at this stage.
        </p>
      </aside>
    </div>
  );
}
