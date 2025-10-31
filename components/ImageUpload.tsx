"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  bucket?: string;
  accept?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  bucket = "workshop-images",
  accept = "image/*",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type based on accept prop
    const isImage = accept.includes("image");
    const isVideo = accept.includes("video");

    if (isImage && !file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (isVideo && !file.type.startsWith("video/")) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>

      {value && (
        <div className="mb-3 relative inline-block">
          {accept.includes("video") ? (
            <video
              src={value}
              controls
              className="h-32 w-auto rounded-lg border border-gray-300"
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="h-32 w-auto rounded-lg border border-gray-300 object-cover"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-500"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        {uploading && (
          <span className="text-sm text-gray-500">Uploading...</span>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-2 text-xs text-gray-500">
        Max file size: {maxSizeMB}MB.{" "}
        {accept.includes("video")
          ? "Supported formats: MP4, WebM, MOV"
          : "Supported formats: JPG, PNG, GIF, WebP"}
      </p>
    </div>
  );
}
