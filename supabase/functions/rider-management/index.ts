import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });

const getProjectUrl = () => Deno.env.get("SUPABASE_URL") ?? "";
const getServiceRoleKey = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const getSupabaseClient = (jwt?: string) =>
  createClient(getProjectUrl(), getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    },
  });

const readJsonBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

const getAuthToken = (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader || "";
};

const resolveRiderStatus = (status: string | null) => {
  if (!status) return "offline";
  const normalized = status.toLowerCase();
  if (["available", "online", "ready", "idle"].includes(normalized)) return "available";
  if (["enroute", "assigned", "busy", "on_trip"].includes(normalized)) return "busy";
  if (["paused", "break", "offline"].includes(normalized)) return "offline";
  return normalized;
};

const getStatusColor = (status: string | null) => {
  switch (resolveRiderStatus(status)) {
    case "available":
      return "green";
    case "busy":
      return "amber";
    case "offline":
      return "gray";
    default:
      return "blue";
  }
};

const parsePathParams = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  return {
    segments,
    riderId: segments[1] || null,
    orderId: segments[3] || null,
  };
};

const routes = {
  "GET /health": async (_req: Request) => {
    return jsonResponse(
      {
        ok: true,
        service: "rider-management",
        timestamp: new Date().toISOString(),
        status: "healthy",
      },
      { status: 200 }
    );
  },

  "GET /riders": async (req: Request) => {
    try {
      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, status")
        .or("role.eq.staff,role.eq.rider")
        .order("full_name", { ascending: true });

      if (error) {
        return jsonResponse({ ok: false, error: error.message }, { status: 500 });
      }

      const riders = (data ?? []).map((rider) => ({
        id: rider.id,
        name: rider.full_name || rider.email || "Unnamed rider",
        email: rider.email || null,
        phone: rider.phone || null,
        role: rider.role || "rider",
        status: resolveRiderStatus(rider.status),
        color: getStatusColor(rider.status),
      }));

      return jsonResponse({ ok: true, riders }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "GET /riders/:id": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const { riderId } = parsePathParams(url.pathname);
      if (!riderId) {
        return jsonResponse({ ok: false, error: "Missing rider id" }, { status: 400 });
      }

      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);

      const { data: rider, error: riderError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, status, metadata")
        .eq("id", riderId)
        .single();

      if (riderError) {
        return jsonResponse({ ok: false, error: riderError.message }, { status: 404 });
      }

      const { data: assignments, error: assignmentError } = await supabase
        .from("orders")
        .select("id, customer_name, total_amount, status, created_at, assigned_rider_id")
        .eq("assigned_rider_id", riderId)
        .order("created_at", { ascending: false });

      if (assignmentError) {
        return jsonResponse({ ok: false, error: assignmentError.message }, { status: 500 });
      }

      return jsonResponse(
        {
          ok: true,
          rider: {
            id: rider.id,
            name: rider.full_name || rider.email || "Unnamed rider",
            email: rider.email || null,
            phone: rider.phone || null,
            role: rider.role || "rider",
            status: resolveRiderStatus(rider.status),
            color: getStatusColor(rider.status),
            metadata: rider.metadata || {},
          },
          assignments: assignments ?? [],
        },
        { status: 200 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "GET /orders": async (req: Request) => {
    try {
      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      const riderId = url.searchParams.get("rider_id");

      let query = supabase.from("orders").select(`*`);

      if (status) {
        query = query.eq("status", status);
      }

      if (riderId) {
        query = query.eq("assigned_rider_id", riderId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ ok: false, error: error.message }, { status: 500 });
      }

      return jsonResponse({ ok: true, orders: data ?? [] }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "POST /orders/:id/status": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const { orderId } = parsePathParams(url.pathname);
      if (!orderId) {
        return jsonResponse({ ok: false, error: "Missing order id" }, { status: 400 });
      }

      const payload = (await readJsonBody(req)) as {
        status?: string;
        rider_id?: string;
        note?: string;
      } | null;

      if (!payload || !payload.status) {
        return jsonResponse({ ok: false, error: "Status is required" }, { status: 400 });
      }

      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);

      const updatePayload: Record<string, string | null> = { status: payload.status };
      if (payload.rider_id) {
        updatePayload.assigned_rider_id = payload.rider_id;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        return jsonResponse({ ok: false, error: error.message }, { status: 500 });
      }

      if (payload.note) {
        await supabase.from("order_events").insert({
          order_id: orderId,
          rider_id: payload.rider_id ?? null,
          note: payload.note,
          event_type: "status_update",
          created_at: new Date().toISOString(),
        });
      }

      return jsonResponse({ ok: true, order: data }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "POST /riders/:id/assign": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const { riderId } = parsePathParams(url.pathname);
      if (!riderId) {
        return jsonResponse({ ok: false, error: "Missing rider id" }, { status: 400 });
      }

      const payload = (await readJsonBody(req)) as {
        order_id?: string;
        assigned_rider_id?: string;
      } | null;

      const targetOrderId = payload?.order_id ?? payload?.assigned_rider_id ?? null;
      if (!targetOrderId) {
        return jsonResponse({ ok: false, error: "Order id is required" }, { status: 400 });
      }

      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);
      const { data, error } = await supabase
        .from("orders")
        .update({
          assigned_rider_id: riderId,
          status: "assigned",
        })
        .eq("id", targetOrderId)
        .select()
        .single();

      if (error) {
        return jsonResponse({ ok: false, error: error.message }, { status: 500 });
      }

      return jsonResponse(
        {
          ok: true,
          message: "Order assigned to rider successfully",
          order: data,
        },
        { status: 200 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "POST /riders/:id/status": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const { riderId } = parsePathParams(url.pathname);
      if (!riderId) {
        return jsonResponse({ ok: false, error: "Missing rider id" }, { status: 400 });
      }

      const payload = (await readJsonBody(req)) as { status?: string } | null;
      if (!payload || !payload.status) {
        return jsonResponse({ ok: false, error: "Status is required" }, { status: 400 });
      }

      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);
      const { data, error } = await supabase
        .from("profiles")
        .update({ status: payload.status })
        .eq("id", riderId)
        .select()
        .single();

      if (error) {
        return jsonResponse({ ok: false, error: error.message }, { status: 500 });
      }

      return jsonResponse(
        {
          ok: true,
          rider: {
            id: data.id,
            status: resolveRiderStatus(data.status),
            color: getStatusColor(data.status),
          },
        },
        { status: 200 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "GET /summary": async (req: Request) => {
    try {
      const token = getAuthToken(req);
      const supabase = getSupabaseClient(token);

      const [{ data: ridersData, error: ridersError }, { data: orderData, error: orderError }] = await Promise.all([
        supabase.from("profiles").select("id, status, role").or("role.eq.staff,role.eq.rider"),
        supabase.from("orders").select("id, status"),
      ]);

      if (ridersError || orderError) {
        return jsonResponse(
          {
            ok: false,
            error: ridersError?.message ?? orderError?.message ?? "Failed to retrieve summary",
          },
          { status: 500 }
        );
      }

      const riderSummary = (ridersData ?? []).reduce(
        (acc, rider) => {
          const status = resolveRiderStatus(rider.status);
          acc[status] = (acc[status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const orderSummary = (orderData ?? []).reduce(
        (acc, order) => {
          const key = order.status || "unknown";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return jsonResponse(
        {
          ok: true,
          summary: {
            riders: riderSummary,
            orders: orderSummary,
            generated_at: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  },

  "OPTIONS /": (async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true }, { status: 200 });
  }

  const url = new URL(req.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const routeKey = `${req.method.toUpperCase()} ${pathname}`;
  const routeMatcher = Object.keys(routes).find((key) => {
    if (key === routeKey) return true;
    const keyParts = key.split(" ");
    if (keyParts.length !== 2) return false;
    const [method, pattern] = keyParts;
    if (method !== req.method.toUpperCase()) return false;
    const routePattern = pattern
      .split("/")
      .filter(Boolean)
      .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment));
    const targetPath = pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment);
    if (routePattern.length !== targetPath.length) return false;
    return routePattern.every((segment, index) => segment === targetPath[index] || segment === "[^/]+");
  });

  const route = routeMatcher ? routes[routeMatcher as keyof typeof routes] : undefined;
  if (!route) {
    return jsonResponse(
      {
        ok: false,
        error: `No route found for ${req.method.toUpperCase()} ${pathname}`,
      },
      { status: 404 }
    );
  }

  try {
    return await route(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
});
