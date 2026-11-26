
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

function isValidBookingId(id) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return { error: "You are not authorised to manage bookings." };
  }

  return { supabase };
}

export async function cancelBooking(bookingId) {
  if (!isValidBookingId(bookingId)) {
    return { success: false, message: "Invalid booking ID." };
  }

  const { supabase, error: authError } = await verifyAdmin();

  if (authError) {
    return { success: false, message: authError };
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return {
      success: false,
      message: "Booking not found or it is no longer confirmed.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    message: "Booking cancelled successfully.",
  };
}

export async function completeBooking(bookingId) {
  if (!isValidBookingId(bookingId)) {
    return { success: false, message: "Invalid booking ID." };
  }

  const { supabase, error: authError } = await verifyAdmin();

  if (authError) {
    return { success: false, message: authError };
  }

  // Only complete confirmed bookings after their session ends.
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, end_at")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchError || !booking) {
    return { success: false, message: "Booking not found." };
  }

  if (booking.status !== "confirmed") {
    return {
      success: false,
      message: "Only confirmed bookings can be completed.",
    };
  }

  if (new Date(booking.end_at).getTime() > Date.now()) {
    return {
      success: false,
      message: "This booking can only be completed after its end time.",
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return {
      success: false,
      message: "Booking could not be updated. Please refresh and try again.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    message: "Booking marked as completed.",
  };
}

export async function markBookingAsPaid(bookingId) {
  if (!isValidBookingId(bookingId)) {
    return { success: false, message: "Invalid booking ID." };
  }

  const { supabase, error: authError } = await verifyAdmin();

  if (authError) {
    return { success: false, message: authError };
  }

  // Only confirmed, unpaid bookings can be marked as paid.
  const { data, error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .eq("payment_status", "unpaid")
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return {
      success: false,
      message: "Booking is not eligible for payment update.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    message: "Payment marked as paid.",
  };
}
