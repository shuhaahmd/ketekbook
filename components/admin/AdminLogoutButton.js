
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Unable to log out. Please try again.");
      setIsLoading(false);
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="admin-logout-button"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Log out"}
    </button>
  );
}
