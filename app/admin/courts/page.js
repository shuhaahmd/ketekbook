
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import CourtRateEditor from "../../../components/admin/CourtRateEditor";
import "../dashboard.css";

export const instant = false;

export default async function ManageCourtsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login");
  }

  const { data: courts, error } = await supabase
    .from("courts")
    .select(`
      id,
      name,
      hourly_rate,
      is_active,
      sports (
        name
      )
    `)
    .order("name");

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p className="section-eyebrow">KETEKBOOK ADMINISTRATION</p>
          <h1>Manage Courts</h1>
          <p>Manage your courts and hourly pricing.</p>
        </div>

        <Link href="/admin" className="admin-home-link">
          ← Back to Dashboard
        </Link>
      </header>

      {error ? (
        <p>Unable to load courts. Please try again.</p>
      ) : (
        <section className="admin-bookings-section">
          <div className="admin-section-heading">
            <div>
              <h2>All Courts</h2>
              <p>Update the hourly rate for each court.</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Court</th>
                  <th>Sport</th>
                  <th>Hourly Rate</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {courts?.map((court) => (
                  <tr key={court.id}>
                    <td>{court.name}</td>
                    <td>{court.sports?.name || "Unknown"}</td>
                    <td>
                      <CourtRateEditor court={court} />
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          court.is_active ? "confirmed" : "cancelled"
                        }`}
                      >
                        {court.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
