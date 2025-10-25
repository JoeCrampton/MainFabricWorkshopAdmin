"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-client";
import type { WorkshopResource } from "@/lib/types";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface ResourceFormProps {
  workshopId: string;
  resource?: WorkshopResource;
  onClose: () => void;
}

export default function ResourceForm({
  workshopId,
  resource,
  onClose,
}: ResourceFormProps) {
  const [title, setTitle] = useState(resource?.title || "");
  const [type, setType] = useState<"video" | "image" | "instruction" | "pdf">(
    resource?.type || "instruction",
  );
  const [url, setUrl] = useState(resource?.url || "");
  const [videoUrl, setVideoUrl] = useState(resource?.video_url || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    resource?.thumbnail_url || "",
  );
  const [displayOrder, setDisplayOrder] = useState(
    resource?.display_order || 0,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const resourceData = {
        workshop_id: workshopId,
        title,
        type,
        url: url || null,
        video_url: videoUrl || null,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        display_order: displayOrder,
      };

      let error;

      if (resource) {
        const result = await supabase
          .from("workshop_resources")
          .update(resourceData)
          .eq("id", resource.id);
        error = result.error;
      } else {
        const result = await supabase
          .from("workshop_resources")
          .insert([resourceData]);
        error = result.error;
      }

      if (error) {
        console.error("Error saving resource:", error);
        alert("Failed to save resource");
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
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-900"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-900"
          >
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) =>
              setType(
                e.target.value as "video" | "image" | "instruction" | "pdf",
              )
            }
            className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
          >
            <option value="instruction">Instruction</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="displayOrder"
            className="block text-sm font-medium text-gray-900"
          >
            Display Order
          </label>
          <input
            type="number"
            id="displayOrder"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
            className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-900"
        >
          Resource URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/resource"
          className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
        />
      </div>

      {type === "video" && (
        <div>
          <label
            htmlFor="videoUrl"
            className="block text-sm font-medium text-gray-900"
          >
            Video URL
          </label>
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="thumbnailUrl"
          className="block text-sm font-medium text-gray-900"
        >
          Thumbnail URL
        </label>
        <input
          type="url"
          id="thumbnailUrl"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://example.com/thumbnail.jpg"
          className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description (Markdown)
        </label>

        <div data-color-mode="light">
          <MDEditor
            value={description}
            onChange={(value) => setDescription(value || "")}
            preview="edit"
            height={250}
            textareaProps={{
              placeholder: "Enter resource description...",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : resource
              ? "Update Resource"
              : "Create Resource"}
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
