"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import WorkshopForm from "@/components/WorkshopForm";
import { createClient } from "@/lib/supabase-client";
import type { Workshop } from "@/lib/types";

export default function EditWorkshopPage() {
  const params = useParams();
  const workshopId = params.id as string;
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkshop() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", workshopId)
        .single();

      if (error) {
        console.error("Error loading workshop:", error);
      } else {
        setWorkshop(data);
      }
      setLoading(false);
    }

    loadWorkshop();
  }, [workshopId]);

  const handleSubmit = async (data: Partial<Workshop>) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("workshops")
      .update({
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        difficulty: data.difficulty,
        duration: data.duration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workshopId);

    if (error) {
      console.error("Error updating workshop:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading workshop...</p>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Workshop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Edit Workshop
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Update workshop information and description
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              href={`/workshops/${workshopId}/resources`}
              className="rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Manage Resources
            </Link>
            <Link
              href={`/workshops/${workshopId}/updates`}
              className="rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Manage Updates
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <WorkshopForm workshop={workshop} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
