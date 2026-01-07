"use client";
import React, { useEffect, useState } from "react";
import BlogEditor from "./BlogEditor";
import toast from "react-hot-toast";
import { notFound, useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

function UpdateBlog() {
  const { slug } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<ArticleFormData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`/api/blog/${slug}`);
        setInitialData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          notFound();
        }
        toast.error("Failed to load article");
        console.error(error);
      } finally {
        setFetching(false);
      }
    };

    if (slug) fetchBlog();
  }, [slug]);

  const handleSubmit = async (data: ArticleFormData, coverImage?: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("content", data.content);
      formData.append("keywords", JSON.stringify(data.keywords));
      formData.append("collectionId", data.collectionId || "");
      formData.append("status", data.status);

      if (coverImage) {
        formData.append("coverImgUrl", coverImage);
      }

      const response = await fetch(`/api/blog/${slug}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to update blog");
      }

      toast.success("Blog updated successfully");
      router.push("/articles");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update blog"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="pt-4 h-full bg-primary/20">
      <BlogEditor
        initialData={initialData}
        isEditing={true}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

export default UpdateBlog;
