import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  // Only signed-in farmers may call Mia; the Claude API key stays in function
  // secrets and is never sent to the app.
  fetch: withSupabase({ auth: "user" }, async () =>
    Response.json(
      { error: "Mia is not configured yet." },
      { status: 501 },
    )
  ),
};
