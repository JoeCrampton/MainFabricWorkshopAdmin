"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import type { WorkshopUpdate } from "@/lib/types";
import MarkdownEditor from "./MarkdownEditor";
import ImageUpload from "./ImageUpload";

interface UpdateFormProps {
  workshopId: string;
  update?: WorkshopUpdate;
  onClose: () => void;
}

export default function UpdateForm({
  workshopId,
  update,
  onClose,
}: UpdateFormProps) {
  const [comment, setComment] = useState(update?.comment || "");
  const [imageUrl, setImageUrl] = useState(update?.image_url || "");
  const [authorName, setAuthorName] = useState(update?.author_name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const updateData = {
        workshop_id: workshopId,
        comment,
        image_url: imageUrl || null,
        author_name: authorName || null,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (update) {
        const result = await supabase
          .from("workshop_updates")
          .update(updateData)
          .eq("id", update.id);
        error = result.error;
      } else {
        const result = await supabase
          .from("workshop_updates")
          .insert([updateData]);
        error = result.error;
      }

      if (error) {
        console.error("Error saving update:", error);
        alert("Failed to save update");
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Comment (Markdown)
        </label>

        <MarkdownEditor
          value={comment}
          onChange={setComment}
          placeholder="Enter update comment..."
          height={250}
        />
      </div>

      <div>
        <label
          htmlFor="authorName"
          className="block text-sm font-medium text-gray-900"
        >
          Author Name
        </label>
        <input
          type="text"
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Optional"
          className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
        />
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        label="Update Image (optional)"
        bucket="workshop-updates"
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : update
              ? "Update Update"
              : "Create Update"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
