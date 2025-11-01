"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import type { Workshop } from "@/lib/types";
import { useRouter } from "next/navigation";

interface WorkshopsListProps {
  initialWorkshops: Workshop[];
}

export default function WorkshopsList({
  initialWorkshops,
}: WorkshopsListProps) {
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (workshop: Workshop) => {
    const confirmMessage = workshop.shopify_product_id
      ? `Delete "${workshop.title}"? This workshop came from Shopify and will be re-created if you sync again.`
      : `Delete "${workshop.title}"? This action cannot be undone. All resources, updates, and subscriptions will also be deleted.`;

    if (!confirm(confirmMessage)) return;

    setDeleting(workshop.id);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("workshops")
        .delete()
        .eq("id", workshop.id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setWorkshops(workshops.filter((w) => w.id !== workshop.id));

      // Refresh the page to get updated data
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting workshop:", error);
      alert(`Failed to delete workshop: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      {/* Mobile card view */}
      <div className="mt-8 block sm:hidden">
        {workshops && workshops.length > 0 ? (
          <div className="space-y-4">
            {workshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-white shadow rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {workshop.title}
                    </h3>
                    {workshop.shopify_product_id && (
                      <span className="text-xs text-gray-500">
                        Shopify ID: {workshop.shopify_product_id}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 whitespace-nowrap ${
                      workshop.difficulty === "Beginner"
                        ? "bg-green-100 text-green-800"
                        : workshop.difficulty === "Intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {workshop.difficulty}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>Duration: {workshop.duration}</div>
                  <div>
                    Created:{" "}
                    {new Date(workshop.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Link
                    href={`/workshops/${workshop.id}`}
                    className="text-center rounded-md bg-white px-2 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/workshops/${workshop.id}/resources`}
                    className="text-center rounded-md bg-indigo-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Resources
                  </Link>
                  <Link
                    href={`/workshops/${workshop.id}/updates`}
                    className="text-center rounded-md bg-indigo-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Updates
                  </Link>
                  <button
                    onClick={() => handleDelete(workshop)}
                    disabled={deleting === workshop.id}
                    className="text-center rounded-md bg-red-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                  >
                    {deleting === workshop.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center text-sm text-gray-500">
            No workshops found. Create your first workshop to get started.
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="mt-8 hidden sm:block flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Difficulty
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {workshops && workshops.length > 0 ? (
                    workshops.map((workshop) => (
                      <tr key={workshop.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {workshop.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              workshop.difficulty === "Beginner"
                                ? "bg-green-100 text-green-800"
                                : workshop.difficulty === "Intermediate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {workshop.difficulty}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {workshop.duration}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {workshop.shopify_product_id ? (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              Shopify
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                              Manual
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(workshop.created_at).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/workshops/${workshop.id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/workshops/${workshop.id}/resources`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Resources
                          </Link>
                          <Link
                            href={`/workshops/${workshop.id}/updates`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Updates
                          </Link>
                          <button
                            onClick={() => handleDelete(workshop)}
                            disabled={deleting === workshop.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === workshop.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-8 text-center text-sm text-gray-500"
                      >
                        No workshops found. Create your first workshop to get
                        started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
