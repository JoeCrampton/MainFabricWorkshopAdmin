import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import WorkshopsList from "@/components/WorkshopsList";

export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const supabase = createClient();

  const { data: workshops, error } = await supabase
    .from("workshops")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workshops:", error);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Workshops
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your workshop content and resources
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/workshops/sync"
            className="block rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Sync from Shopify
          </Link>
          <Link
            href="/workshops/new"
            className="block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add workshop
          </Link>
        </div>
      </div>

      <WorkshopsList initialWorkshops={workshops || []} />
    </div>
  );
}
