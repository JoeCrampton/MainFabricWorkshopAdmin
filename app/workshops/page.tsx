import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { Workshop } from "@/lib/types";

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
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/workshops/new"
            className="block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add workshop
          </Link>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="mt-8 block sm:hidden">
        {workshops && workshops.length > 0 ? (
          <div className="space-y-4">
            {workshops.map((workshop: Workshop) => (
              <div
                key={workshop.id}
                className="bg-white shadow rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-gray-900 flex-1 mr-2">
                    {workshop.title}
                  </h3>
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
                <div className="flex gap-2">
                  <Link
                    href={`/workshops/${workshop.id}`}
                    className="flex-1 text-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/workshops/${workshop.id}/resources`}
                    className="flex-1 text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Resources
                  </Link>
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
                    workshops.map((workshop: Workshop) => (
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
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Resources
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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
    </div>
  );
}
