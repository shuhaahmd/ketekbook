
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import "./dashboard.css";
import BookingsTable from "../../components/admin/BookingsTable";
import AdminLogoutButton from "../../components/admin/AdminLogoutButton";
import Link from "next/link";
import BookingsRealtimeRefresh from "../../components/admin/BookingsRealtimeRefresh";


export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Check whether the user is authenticated.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check whether the authenticated user is an admin.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/admin/login");
  }

  // Get dashboard statistics.
  const [
    { count: totalBookings },
    { count: confirmedBookings },
    { count: cancelledBookings },
    { count: activeCourts },
    { data: bookings, error: bookingsError },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled"),

    supabase
      .from("courts")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("bookings")
      .select(`
        id,
        booking_reference,
        customer_name,
        customer_phone,
        start_at,
        end_at,
        total_amount,
        status,
        payment_status,
        courts (
          name,
          sports (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <main className="admin-dashboard">
      <BookingsRealtimeRefresh/>
        
      <header className="admin-dashboard-header">
        <div>
          <p className="section-eyebrow">KETEKBOOK ADMINISTRATION</p>
          <h1>Dashboard</h1>
          <p>Manage your facility and monitor bookings.</p>
        </div>

        <div className="admin-header-actions">
            <Link href="/admin/courts" className="admin-home-link">
             Manage Courts
        </Link>
            <Link href="/" className="admin-home-link">
            View website ↗
        </Link>

  <AdminLogoutButton />
</div>
      </header>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <span>Total bookings</span>
          <strong>{totalBookings ?? 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Confirmed bookings</span>
          <strong>{confirmedBookings ?? 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Cancelled bookings</span>
          <strong>{cancelledBookings ?? 0}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Active courts</span>
          <strong>{activeCourts ?? 0}</strong>
        </div>
      </section>

      {bookingsError ? (
        <p>Unable to load bookings. Please try again.</p>
      ) : (
        <BookingsTable bookings={bookings || []} />
      )}
    </main>
  );
}
