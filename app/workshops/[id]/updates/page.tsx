"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import type { Workshop, WorkshopUpdate } from "@/lib/types";
import UpdateForm from "@/components/UpdateForm";
import ReactMarkdown from "react-markdown";

export default function UpdatesPage() {
  const params = useParams();
  const workshopId = params.id as string;
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [updates, setUpdates] = useState<WorkshopUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<WorkshopUpdate | null>(
    null,
  );

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

    // Load updates
    const { data: updatesData, error: updatesError } = await supabase
      .from("workshop_updates")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false });

    if (updatesError) {
      console.error("Error loading updates:", updatesError);
    } else {
      setUpdates(updatesData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [workshopId]);

  const handleDelete = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("workshop_updates")
      .delete()
      .eq("id", updateId);

    if (error) {
      console.error("Error deleting update:", error);
      alert("Failed to delete update");
    } else {
      loadData();
    }
  };

  const handleEdit = (update: WorkshopUpdate) => {
    setEditingUpdate(update);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUpdate(null);
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            Manage updates for this workshop
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href={`/workshops/${workshopId}`}
            className="rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Edit Workshop
          </Link>
          <Link
            href={`/workshops/${workshopId}/resources`}
            className="rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Manage Resources
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Add Update
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-4">
              {editingUpdate ? "Edit Update" : "New Update"}
            </h2>
            <UpdateForm
              workshopId={workshopId}
              update={editingUpdate || undefined}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {updates.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4">
            <p className="text-gray-500 text-sm">
              No updates yet. Add your first update to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <div className="text-xs text-gray-500">
                        {formatDate(update.created_at)}
                      </div>
                      {update.author_name && (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                          {update.author_name}
                        </span>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-900">
                      <ReactMarkdown>{update.comment}</ReactMarkdown>
                    </div>
                    {update.image_url && (
                      <div className="mt-4">
                        <img
                          src={update.image_url}
                          alt="Update image"
                          className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:gap-1 sm:ml-4">
                    <button
                      onClick={() => handleEdit(update)}
                      className="flex-1 sm:flex-none text-center sm:text-right text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-2 sm:px-0 sm:py-0 rounded-md sm:rounded-none bg-indigo-50 sm:bg-transparent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
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
