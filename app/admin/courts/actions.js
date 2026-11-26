
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

export async function updateCourtRate(courtId, newRate) {
  const supabase = await createClient();

  // Verify admin login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in again.",
    };
  }

  // Verify admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return {
      success: false,
      message: "You are not authorised to update court rates.",
    };
  }

  // Validate court ID
  if (
    typeof courtId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courtId)
  ) {
    return {
      success: false,
      message: "Invalid court ID.",
    };
  }

  // Validate rate
  const rate = Number(newRate);

  if (
    newRate === "" ||
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate > 10000 ||
    !/^\d+(\.\d{1,2})?$/.test(String(newRate))
  ) {
    return {
      success: false,
      message: "Please enter a valid rate between RM0.00 and RM10,000.00.",
    };
  }

  // Update Supabase
  const { error } = await supabase
    .from("courts")
    .update({ hourly_rate: rate })
    .eq("id", courtId);

  if (error) {
    return {
      success: false,
      message: "Unable to update the court rate.",
    };
  }

  revalidatePath("/admin/courts");
  revalidatePath("/booking");
  revalidatePath("/");

  return {
    success: true,
    message: "Court rate updated successfully!",
  };
}
