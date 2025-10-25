"use client";

import WorkshopForm from "@/components/WorkshopForm";
import { createClient } from "@/lib/supabase-client";
import type { Workshop } from "@/lib/types";

export default function NewWorkshopPage() {
  const handleSubmit = async (data: Partial<Workshop>) => {
    const supabase = createClient();

    const { error } = await supabase.from("workshops").insert([
      {
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        difficulty: data.difficulty,
        duration: data.duration,
      },
    ]);

    if (error) {
      console.error("Error creating workshop:", error);
      throw error;
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
          Create New Workshop
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Add a new workshop with description and resources
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <WorkshopForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
