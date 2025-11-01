"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";

interface SyncResult {
  created: number;
  updated: number;
  errors: Array<{ product: string; error: string }>;
}

export default function SyncWorkshopsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabase = createClient();

      // Get the current session to use for authorization
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be logged in to sync workshops");
      }

      // Get Supabase URL from environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Call the Edge Function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/sync-shopify-workshops`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sync failed");
      }

      const data: SyncResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Sync error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Sync Workshops from Shopify
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Import workshops from your Shopify store collection into the admin
            panel. This will create new workshops or update existing ones based
            on their Shopify product ID.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/workshops"
            className="rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Back to Workshops
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            How it works
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>
              Fetches all products from Shopify collection ID: 503854825767
            </li>
            <li>
              Creates new workshops or updates existing ones (matched by Shopify
              product ID)
            </li>
            <li>
              Imports title, description, image, and attempts to parse difficulty
              and duration
            </li>
            <li>You can manually edit any workshop details after syncing</li>
          </ul>
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="w-full sm:w-auto rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Syncing...
            </span>
          ) : (
            "Sync Now"
          )}
        </button>

        {loading && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              Syncing workshops from Shopify... This may take a moment.
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-3">
              Sync Complete!
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.created}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Workshops Created
                </div>
              </div>
              <div className="bg-white rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.updated}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Workshops Updated
                </div>
              </div>
              <div className="bg-white rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.errors.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Errors</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-red-900 mb-2">
                  Errors:
                </h4>
                <ul className="space-y-2">
                  {result.errors.map((err, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-red-50 border border-red-200 rounded p-2"
                    >
                      <span className="font-medium">{err.product}:</span>{" "}
                      {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <Link
                href="/workshops"
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                View all workshops →
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">
              Sync Failed
            </h3>
            <p className="text-sm text-red-800">{error}</p>
            <div className="mt-3">
              <p className="text-xs text-red-700">
                Common issues:
              </p>
              <ul className="list-disc list-inside text-xs text-red-700 mt-1 space-y-1">
                <li>SHOPIFY_ADMIN_API_TOKEN not configured in Supabase</li>
                <li>Network connectivity issues</li>
                <li>Invalid Shopify collection ID</li>
                <li>Database permission issues</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-2">
          ⚠️ Before You Sync
        </h3>
        <ul className="list-disc list-inside text-xs text-yellow-800 space-y-1">
          <li>
            Ensure you've run the database migration to add the
            shopify_product_id column
          </li>
          <li>
            Verify SHOPIFY_ADMIN_API_TOKEN is set in Supabase Edge Function
            secrets
          </li>
          <li>
            The sync will NOT delete workshops that no longer exist in Shopify
          </li>
          <li>
            Existing workshops will be updated with latest data from Shopify
          </li>
        </ul>
      </div>
    </div>
  );
}
