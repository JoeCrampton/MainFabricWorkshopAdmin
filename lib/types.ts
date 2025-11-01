export interface Workshop {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  shopify_product_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkshopResource {
  id: string;
  workshop_id: string;
  title: string;
  type: "video" | "image" | "instruction" | "pdf";
  url: string | null;
  video_url: string | null;
  description: string | null;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}

export interface WorkshopWithResources extends Workshop {
  resources: WorkshopResource[];
}

export interface WorkshopUpdate {
  id: string;
  workshop_id: string;
  comment: string;
  image_url: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}
