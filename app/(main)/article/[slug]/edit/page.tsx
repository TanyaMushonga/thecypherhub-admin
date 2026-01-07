"use client";
import React, { useEffect, useState, useCallback } from "react";
import BlogEditor from "../../../../../components/othercomponents/BlogEditor";
import { useParams, notFound, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditArticlePage() {
  const { slug } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<ArticleFormData | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blog/${slug}`);
      setInitialData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        notFound();
      }
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug, fetchBlog]);

  const handleSubmit = async (data: ArticleFormData, coverImage?: File) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("content", data.content);
      formData.append("keywords", JSON.stringify(data.keywords));

      // Auto-publish if content is provided
      const hasContent =
        data.content && data.content.replace(/<[^>]*>/g, "").trim().length > 0;
      formData.append("status", hasContent ? "published" : data.status);
      if (data.collectionId) {
        formData.append("collectionId", data.collectionId);
      }

      if (coverImage) {
        formData.append("coverImgUrl", coverImage);
      }

      const response = await fetch(`/api/blog/${slug}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success("Article updated successfully");
      router.push("/collections"); // Or wherever appropriate
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <main className="bg-primary min-h-[90vh] w-full pt-5">
      <BlogEditor
        initialData={initialData}
        isEditing={true}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />
    </main>
  );
}
