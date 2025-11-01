import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SHOPIFY_STORE = "mainfabric.myshopify.com";
const SHOPIFY_API_VERSION = "2024-01";
const WORKSHOP_COLLECTION_ID = "503854825767";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get Shopify token from environment
    const shopifyToken = Deno.env.get("SHOPIFY_ADMIN_API_TOKEN");
    if (!shopifyToken) {
      throw new Error("SHOPIFY_ADMIN_API_TOKEN not configured");
    }

    // 2. Verify authentication (optional but recommended)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Fetch products from Shopify collection
    const shopifyUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/collections/${WORKSHOP_COLLECTION_ID}/products.json?limit=250`;

    console.log("Fetching workshops from Shopify...");
    const shopifyResponse = await fetch(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": shopifyToken,
        "Content-Type": "application/json",
      },
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      throw new Error(`Shopify API error: ${shopifyResponse.status} ${errorText}`);
    }

    const { products } = await shopifyResponse.json();
    console.log(`Found ${products.length} products in Shopify collection`);

    // 4. Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. For each product, upsert workshop
    const results = {
      created: 0,
      updated: 0,
      errors: [] as Array<{ product: string; error: string }>,
    };

    for (const product of products) {
      try {
        const workshopData = {
          shopify_product_id: product.id,
          title: product.title,
          description: stripHtml(product.body_html || product.title),
          image_url: product.images?.[0]?.src || null,
          difficulty: parseDifficulty(product),
          duration: parseDuration(product),
          updated_at: new Date().toISOString(),
        };

        console.log(`Processing: ${product.title} (ID: ${product.id})`);

        // Check if workshop exists
        const { data: existing, error: selectError } = await supabase
          .from("workshops")
          .select("id")
          .eq("shopify_product_id", product.id)
          .maybeSingle();

        if (selectError) {
          throw selectError;
        }

        if (existing) {
          // Update existing workshop
          const { error: updateError } = await supabase
            .from("workshops")
            .update(workshopData)
            .eq("shopify_product_id", product.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`Updated: ${product.title}`);
          results.updated++;
        } else {
          // Insert new workshop
          const { error: insertError } = await supabase
            .from("workshops")
            .insert(workshopData);

          if (insertError) {
            throw insertError;
          }

          console.log(`Created: ${product.title}`);
          results.created++;
        }
      } catch (error) {
        console.error(`Error processing ${product.title}:`, error);
        results.errors.push({
          product: product.title,
          error: error.message || String(error),
        });
      }
    }

    console.log("Sync complete:", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return new Response(
      JSON.stringify({
        error: error.message || String(error),
        created: 0,
        updated: 0,
        errors: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Strip HTML tags from a string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Parse difficulty from Shopify product tags
 */
function parseDifficulty(product: any): "Beginner" | "Intermediate" | "Advanced" {
  const tags = (product.tags || "").toLowerCase();
  const title = (product.title || "").toLowerCase();
  const combined = `${tags} ${title}`;

  if (combined.includes("advanced")) return "Advanced";
  if (combined.includes("intermediate")) return "Intermediate";
  return "Beginner";
}

/**
 * Parse duration from Shopify product title or description
 */
function parseDuration(product: any): string {
  const text = `${product.title} ${product.body_html || ""}`.toLowerCase();

  // Try to find patterns like "2 hours", "3 days", "1 week"
  const hourMatch = text.match(/(\d+)\s*(hour|hr)s?/);
  if (hourMatch) {
    const num = parseInt(hourMatch[1]);
    return `${num} hour${num > 1 ? "s" : ""}`;
  }

  const dayMatch = text.match(/(\d+)\s*days?/);
  if (dayMatch) {
    const num = parseInt(dayMatch[1]);
    return `${num} day${num > 1 ? "s" : ""}`;
  }

  const weekMatch = text.match(/(\d+)\s*weeks?/);
  if (weekMatch) {
    const num = parseInt(weekMatch[1]);
    return `${num} week${num > 1 ? "s" : ""}`;
  }

  // Default to "TBD" if no duration found
  return "TBD";
}
