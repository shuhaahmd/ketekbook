
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCourtRate } from "../../app/admin/courts/actions";

export default function CourtRateEditor({ court }) {
  const [rate, setRate] = useState(String(court.hourly_rate ?? 0));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    setMessage("");

    startTransition(async () => {
      const result = await updateCourtRate(court.id, rate);

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="court-rate-editor">
      <div className="court-rate-input-wrapper">
        <span>RM</span>
        <input
          type="number"
          min="0"
          max="10000"
          step="0.01"
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          disabled={isPending}
          aria-label={`Hourly rate for ${court.name}`}
        />
      </div>

      <button
        type="button"
        className="court-rate-save-button"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save"}
      </button>

      {message && (
        <small
          className={`court-rate-message ${
            message.includes("successfully") ? "success" : "error"
          }`}
          role="status"
        >
          {message}
        </small>
      )}
    </div>
  );
}
