
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  cancelBooking,
  completeBooking,
  markBookingAsPaid,
} from "../../app/admin/actions";

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuching",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kuching",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

export default function BookingsTable({ bookings = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        booking.booking_reference?.toLowerCase().includes(searchTerm) ||
        booking.customer_name?.toLowerCase().includes(searchTerm) ||
        booking.customer_phone?.toLowerCase().includes(searchTerm) ||
        booking.courts?.name?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  function runAction(action, bookingId, reference) {
    const confirmed = window.confirm(
      `Are you sure you want to ${action.label.toLowerCase()} booking ${reference}?`
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await action.handler(bookingId);
      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  return (
    <section className="admin-bookings-section">
      <div className="admin-section-heading">
        <div>
          <p className="section-eyebrow">BOOKING MANAGEMENT</p>
          <h2>Recent bookings</h2>
        </div>
      </div>

      <div className="booking-table-controls">
        <input
          type="search"
          placeholder="Search name, phone or reference..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="booking-search-input"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="booking-filter-select"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <p className="booking-results-count">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>

      {message && (
        <p className="booking-action-message" role="status">
          {message}
        </p>
      )}

      {filteredBookings.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No bookings found</h3>
          <p>Try changing your search or status filter.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-bookings-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Court</th>
                <th>Date & time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.booking_reference}</td>

                  <td>
                    <strong>{booking.customer_name || "Guest"}</strong>
                    <small>{booking.customer_phone || "-"}</small>
                  </td>

                  <td>
                    {booking.courts?.name || "Unknown court"}
                    <small>{booking.courts?.sports?.name || ""}</small>
                  </td>

                  <td>
                    {formatDate(booking.start_at)}
                    <small>
                      {formatTime(booking.start_at)} –{" "}
                      {formatTime(booking.end_at)}
                    </small>
                  </td>

                  <td>
                    RM {Number(booking.total_amount).toFixed(2)}
                  </td>

                  <td>
                    <span className={`admin-status ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>

                  <td>
                    <span className={`admin-status ${booking.payment_status}`}>
                      {booking.payment_status}
                    </span>
                  </td>

                  <td>
                    <div className="booking-actions">
                      {booking.status === "confirmed" && (
                        <>
                          <button
                            type="button"
                            className="booking-complete-button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                {
                                  label: "Mark as completed",
                                  handler: completeBooking,
                                },
                                booking.id,
                                booking.booking_reference
                              )
                            }
                          >
                            Complete
                          </button>

                          <button
                            type="button"
                            className="booking-cancel-button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                {
                                  label: "Cancel",
                                  handler: cancelBooking,
                                },
                                booking.id,
                                booking.booking_reference
                              )
                            }
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {booking.status === "confirmed" &&
                        booking.payment_status === "unpaid" && (
                          <button
                            type="button"
                            className="booking-paid-button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                {
                                  label: "Mark as paid",
                                  handler: markBookingAsPaid,
                                },
                                booking.id,
                                booking.booking_reference
                              )
                            }
                          >
                            Mark paid
                          </button>
                        )}

                      {booking.status !== "confirmed" && (
                        <span className="booking-no-action">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
