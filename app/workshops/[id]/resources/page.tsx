"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import type { Workshop, WorkshopResource } from "@/lib/types";
import ResourceForm from "@/components/ResourceForm";

export default function ResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [resources, setResources] = useState<WorkshopResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] =
    useState<WorkshopResource | null>(null);

  const loadData = async () => {
    const supabase = createClient();

    // Load workshop
    const { data: workshopData, error: workshopError } = await supabase
      .from("workshops")
      .select("*")
      .eq("id", workshopId)
      .single();

    if (workshopError) {
      console.error("Error loading workshop:", workshopError);
    } else {
      setWorkshop(workshopData);
    }

    // Load resources
    const { data: resourcesData, error: resourcesError } = await supabase
      .from("workshop_resources")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("display_order", { ascending: true });

    if (resourcesError) {
      console.error("Error loading resources:", resourcesError);
    } else {
      setResources(resourcesData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [workshopId]);

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("workshop_resources")
      .delete()
      .eq("id", resourceId);

    if (error) {
      console.error("Error deleting resource:", error);
      alert("Failed to delete resource");
    } else {
      loadData();
    }
  };

  const handleEdit = (resource: WorkshopResource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingResource(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {workshop?.title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage resources for this workshop
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href={`/workshops/${workshopId}`}
            className="rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Edit Workshop
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Add Resource
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-4">
              {editingResource ? "Edit Resource" : "New Resource"}
            </h2>
            <ResourceForm
              workshopId={workshopId}
              resource={editingResource || undefined}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {resources.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4">
            <p className="text-gray-500 text-sm">
              No resources yet. Add your first resource to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {resource.title}
                      </h3>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {resource.type.toUpperCase()}
                      </span>
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-600 break-words">
                        {resource.description.substring(0, 150)}
                        {resource.description.length > 150 ? "..." : ""}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Display Order: {resource.display_order}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:gap-1 sm:ml-4">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="flex-1 sm:flex-none text-center sm:text-right text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-2 sm:px-0 sm:py-0 rounded-md sm:rounded-none bg-indigo-50 sm:bg-transparent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="flex-1 sm:flex-none text-center sm:text-right text-red-600 hover:text-red-900 text-sm font-medium px-3 py-2 sm:px-0 sm:py-0 rounded-md sm:rounded-none bg-red-50 sm:bg-transparent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
