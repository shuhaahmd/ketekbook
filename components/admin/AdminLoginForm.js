
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("You do not have administrator access.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <a href="/" className="brand">
          <span className="brand-icon">K</span>
          <span>
            Ketek<span className="brand-light">Book</span>
          </span>
        </a>

        <div className="admin-login-heading">
          <p className="section-eyebrow">ADMINISTRATION</p>
          <h1>Welcome back.</h1>
          <p>Sign in to manage your sports facility.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage && (
            <p className="admin-login-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="booking-submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
            {!isLoading && <span> ↗</span>}
          </button>
        </form>

        <p className="admin-login-footer">
          Restricted access · Authorised administrators only
        </p>
      </div>
    </main>
  );
}
