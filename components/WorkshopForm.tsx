"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Workshop } from "@/lib/types";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface WorkshopFormProps {
  workshop?: Workshop;
  onSubmit: (data: Partial<Workshop>) => Promise<void>;
}

export default function WorkshopForm({
  workshop,
  onSubmit,
}: WorkshopFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(workshop?.title || "");
  const [description, setDescription] = useState(workshop?.description || "");
  const [difficulty, setDifficulty] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >(workshop?.difficulty || "Beginner");
  const [duration, setDuration] = useState(workshop?.duration || "");
  const [imageUrl, setImageUrl] = useState(workshop?.image_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        description,
        difficulty,
        duration,
        image_url: imageUrl || null,
      });
      router.push("/workshops");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save workshop");
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
            htmlFor="difficulty"
            className="block text-sm font-medium text-gray-900"
          >
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value as "Beginner" | "Intermediate" | "Advanced",
              )
            }
            className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-900"
          >
            Duration
          </label>
          <input
            type="text"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 2 hours"
            required
            className="mt-1 sm:mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-sm sm:leading-6 px-3"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-900"
        >
          Image URL (optional)
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
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
            height={300}
            textareaProps={{
              placeholder:
                "Enter workshop description with markdown formatting...",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : workshop
              ? "Update Workshop"
              : "Create Workshop"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
