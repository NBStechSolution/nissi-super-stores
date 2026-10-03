


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "text" NOT NULL,
    "customer_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "address" "text" NOT NULL,
    "items" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "subtotal" numeric DEFAULT 0 NOT NULL,
    "discount_amount" numeric DEFAULT 0 NOT NULL,
    "applied_coupon" "text",
    "delivery_fee" numeric DEFAULT 0 NOT NULL,
    "total_amount" numeric DEFAULT 0 NOT NULL,
    "delivery_type" "text" DEFAULT 'Normal'::"text" NOT NULL,
    "status" "text" DEFAULT 'Placed'::"text" NOT NULL,
    "delivery_window" "text" DEFAULT 'Within 15 Mins'::"text",
    "is_emergency" boolean DEFAULT false,
    "payment_method" "text" DEFAULT 'COD'::"text" NOT NULL,
    "payment_status" "text" DEFAULT 'Unpaid'::"text" NOT NULL,
    "upi_id" "text" DEFAULT 'abicharan07@axl'::"text",
    "utr" "text" DEFAULT ''::"text",
    "payment_proof" "text",
    "assigned_rider" "text" DEFAULT 'Raju M. (+91 91234 56789)'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "assigned_rider_id" "uuid"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_secure_order"("p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_delivery_type" "text", "p_payment_method" "text", "p_items" "jsonb", "p_applied_coupon" "text" DEFAULT NULL::"text") RETURNS "public"."orders"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
  v_order public.orders;
  v_item jsonb;
  v_variant_id uuid;
  v_product_id text;
  v_quantity integer;
  v_variant record;

  v_subtotal numeric := 0;
  v_discount_amount numeric := 0;
  v_delivery_fee numeric := 0;
  v_total_amount numeric := 0;

  v_coupon text;
  v_order_id text;
  v_items jsonb := '[]'::jsonb;
BEGIN
  -- Validate customer details
  IF NULLIF(trim(p_customer_name), '') IS NULL THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF NULLIF(trim(p_phone), '') IS NULL THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;

  IF NULLIF(trim(p_address), '') IS NULL THEN
    RAISE EXCEPTION 'Delivery address is required';
  END IF;

  -- Validate delivery type
  IF p_delivery_type NOT IN ('Normal', 'Emergency') THEN
    RAISE EXCEPTION 'Invalid delivery type';
  END IF;

  -- Validate payment method
  IF p_payment_method NOT IN (
    'Doorstep UPI Scanner',
    'Card on Delivery (POS Swipe)',
    'Cash on Delivery (COD)'
  ) THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  -- Validate order items
  IF jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Validate variants, stock and calculate authoritative subtotal
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(v_item->>'productId', '');
    v_variant_id := NULLIF(v_item->>'variantId', '')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'Product ID is required for every item';
    END IF;

    IF v_variant_id IS NULL THEN
      RAISE EXCEPTION 'Variant ID is required for every item';
    END IF;

    IF v_quantity IS NULL OR v_quantity < 1 THEN
      RAISE EXCEPTION 'Invalid item quantity';
    END IF;

    SELECT
      pv.id,
      pv.product_id,
      pv.unit,
      pv.price,
      pv.mrp,
      pv.stock,
      pv.low_stock_threshold
    INTO v_variant
    FROM public.product_variants pv
    WHERE pv.id = v_variant_id
      AND pv.product_id = v_product_id
      AND pv.is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant is unavailable';
    END IF;

    IF v_variant.stock < v_quantity THEN
      RAISE EXCEPTION
        'Insufficient stock for % (% available)',
        v_variant.unit,
        v_variant.stock;
    END IF;

    v_subtotal :=
      v_subtotal + (v_variant.price * v_quantity);

    v_items := v_items || jsonb_build_array(
      jsonb_build_object(
        'productId', v_variant.product_id,
        'variantId', v_variant.id,
        'unit', v_variant.unit,
        'price', v_variant.price,
        'mrp', v_variant.mrp,
        'quantity', v_quantity
      )
    );
  END LOOP;

  -- Validate and calculate coupon
  v_coupon := upper(NULLIF(trim(p_applied_coupon), ''));

  IF v_coupon = 'FIRST50'
     AND v_subtotal >= 199 THEN

    v_discount_amount := LEAST(50, v_subtotal);

  ELSIF v_coupon = 'NISSI10'
     AND v_subtotal >= 99 THEN

    v_discount_amount :=
      LEAST(ROUND(v_subtotal * 0.10), 100);

  ELSIF v_coupon = 'UGADI20'
     AND v_subtotal >= 149 THEN

    v_discount_amount := LEAST(30, v_subtotal);

  ELSIF v_coupon IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid or unavailable coupon code';
  END IF;

  -- Current delivery-fee rule
  IF v_subtotal > 0 AND v_subtotal < 199 THEN
    v_delivery_fee := 10;
  ELSE
    v_delivery_fee := 0;
  END IF;

  -- Calculate authoritative total
  v_total_amount :=
    GREATEST(0, v_subtotal - v_discount_amount)
    + v_delivery_fee;

  -- Generate server-side order ID
  v_order_id :=
    'ORD-' ||
    upper(
      substr(
        replace(gen_random_uuid()::text, '-', ''),
        1,
        10
      )
    );

  -- Atomically deduct variant stock
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id :=
      NULLIF(v_item->>'variantId', '')::uuid;

    v_quantity :=
      (v_item->>'quantity')::integer;

    UPDATE public.product_variants
    SET
      stock = stock - v_quantity,
      updated_at = now()
    WHERE id = v_variant_id
      AND stock >= v_quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION
        'Stock changed while placing the order. Please try again.';
    END IF;
  END LOOP;

  -- Create the order
  INSERT INTO public.orders (
    id,
    customer_name,
    phone,
    address,
    items,
    subtotal,
    discount_amount,
    applied_coupon,
    delivery_fee,
    total_amount,
    delivery_type,
    status,
    delivery_window,
    is_emergency,
    payment_method,
    payment_status,
    upi_id,
    utr,
    payment_proof,
    assigned_rider,
    created_at,
    updated_at
  )
  VALUES (
    v_order_id,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_address),
    v_items,
    v_subtotal,
    v_discount_amount,
    CASE
      WHEN v_coupon IS NULL THEN NULL
      ELSE v_coupon
    END,
    v_delivery_fee,
    v_total_amount,
    p_delivery_type,
    'Placed',
    CASE
      WHEN p_delivery_type = 'Emergency'
        THEN 'Within 15 Mins'
      ELSE '2:15 PM – 5:15 PM'
    END,
    p_delivery_type = 'Emergency',
    p_payment_method,
    'Unpaid (Collect at Doorstep)',
    NULL,
    '',
    NULL,
    NULL,
    now(),
    now()
  )
  RETURNING *
  INTO v_order;

  RETURN v_order;
END;
$$;


ALTER FUNCTION "public"."create_secure_order"("p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_delivery_type" "text", "p_payment_method" "text", "p_items" "jsonb", "p_applied_coupon" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    address
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_management_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role')
      in ('admin', 'manager', 'management'),
    false
  );
$$;


ALTER FUNCTION "public"."is_management_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'staff',
    false
  );
$$;


ALTER FUNCTION "public"."is_staff_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "product_id" "text" NOT NULL,
    "unit" "text" NOT NULL,
    "price" numeric NOT NULL,
    "mrp" numeric NOT NULL,
    "stock" integer DEFAULT 0 NOT NULL,
    "low_stock_threshold" integer DEFAULT 5 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_variants_low_stock_threshold_check" CHECK (("low_stock_threshold" >= 0)),
    CONSTRAINT "product_variants_mrp_check" CHECK (("mrp" >= (0)::numeric)),
    CONSTRAINT "product_variants_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "product_variants_stock_check" CHECK (("stock" >= 0))
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "name_te" "text",
    "category" "text" DEFAULT 'grocery'::"text" NOT NULL,
    "price" numeric NOT NULL,
    "mrp" numeric NOT NULL,
    "unit" "text" DEFAULT '1 kg'::"text" NOT NULL,
    "stock" integer DEFAULT 20 NOT NULL,
    "low_stock_threshold" integer DEFAULT 5 NOT NULL,
    "badge" "text" DEFAULT 'Fresh'::"text",
    "description" "text" DEFAULT ''::"text",
    "image_2d" "text",
    "fallback_emoji" "text" DEFAULT '🛒'::"text",
    "image_bg" "text" DEFAULT '#F5F5F0'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "address" "text",
    "role" "text" DEFAULT 'customer'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_settings" (
    "id" bigint NOT NULL,
    "is_store_open" boolean DEFAULT true NOT NULL,
    "is_holiday_closed" boolean DEFAULT false NOT NULL,
    "holiday_reason" "text" DEFAULT ''::"text" NOT NULL,
    "emergency_available" boolean DEFAULT true NOT NULL,
    "staff_available" boolean DEFAULT true NOT NULL,
    "normal_window" "text" DEFAULT 'Normal 2:15–5:15 PM'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."store_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_unit_key" UNIQUE ("product_id", "unit");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_settings"
    ADD CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id");



CREATE INDEX "product_variants_product_id_idx" ON "public"."product_variants" USING "btree" ("product_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_assigned_rider_id_fkey" FOREIGN KEY ("assigned_rider_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public read on products" ON "public"."products" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Management can delete product variants" ON "public"."product_variants" FOR DELETE TO "authenticated" USING ("public"."is_management_user"());



CREATE POLICY "Management can delete store settings" ON "public"."store_settings" FOR DELETE TO "authenticated" USING ("public"."is_management_user"());



CREATE POLICY "Management can insert product variants" ON "public"."product_variants" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_management_user"());



CREATE POLICY "Management can insert store settings" ON "public"."store_settings" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_management_user"());



CREATE POLICY "Management can update product variants" ON "public"."product_variants" FOR UPDATE TO "authenticated" USING ("public"."is_management_user"()) WITH CHECK ("public"."is_management_user"());



CREATE POLICY "Management can update store settings" ON "public"."store_settings" FOR UPDATE TO "authenticated" USING ("public"."is_management_user"()) WITH CHECK ("public"."is_management_user"());



CREATE POLICY "Management read orders" ON "public"."orders" FOR SELECT TO "authenticated" USING ("public"."is_management_user"());



CREATE POLICY "Management write orders" ON "public"."orders" TO "authenticated" USING ("public"."is_management_user"()) WITH CHECK ("public"."is_management_user"());



CREATE POLICY "Management write products" ON "public"."products" TO "authenticated" USING ("public"."is_management_user"()) WITH CHECK ("public"."is_management_user"());



CREATE POLICY "Public can view active product variants" ON "public"."product_variants" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "Public can view store settings" ON "public"."store_settings" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Staff can update assigned orders" ON "public"."orders" FOR UPDATE TO "authenticated" USING (("public"."is_staff_user"() AND ("assigned_rider_id" = "auth"."uid"()))) WITH CHECK (("public"."is_staff_user"() AND ("assigned_rider_id" = "auth"."uid"())));



CREATE POLICY "Staff can view assigned orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("public"."is_staff_user"() AND ("assigned_rider_id" = "auth"."uid"())));



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_secure_order"("p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_delivery_type" "text", "p_payment_method" "text", "p_items" "jsonb", "p_applied_coupon" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_secure_order"("p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_delivery_type" "text", "p_payment_method" "text", "p_items" "jsonb", "p_applied_coupon" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_secure_order"("p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_delivery_type" "text", "p_payment_method" "text", "p_items" "jsonb", "p_applied_coupon" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_management_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_management_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_management_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."store_settings" TO "anon";
GRANT ALL ON TABLE "public"."store_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."store_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







