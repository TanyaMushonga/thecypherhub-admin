"use client";
import React, { useEffect, useState, useCallback } from "react";
import BlogEditor from "../../../../../components/othercomponents/BlogEditor";
import { useParams, notFound, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

      const updatedArticle = await response.json();

      toast.success("Article updated successfully");

      // Check for publication transition
      if (
        initialData?.status === "unpublished" &&
        updatedArticle.status === "published"
      ) {
        setPublishedArticleData(updatedArticle);
        setShowEmailDialog(true);
      } else {
        router.push(
          data.collectionId
            ? `/collections/${data.collectionId}`
            : "/collections"
        );
      }
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article");
    } finally {
      setIsSubmitting(false);
    }
  };

  interface PublishedArticleWithMetadata extends Article {
    publicationMetadata?: {
      collectionName?: string;
      collectionDescription?: string;
      nextArticleTitle?: string;
      nextArticleDate?: string;
    };
  }

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [publishedArticleData, setPublishedArticleData] =
    useState<PublishedArticleWithMetadata | null>(null);

  const handleSendNotification = async () => {
    if (!publishedArticleData) return;

    try {
      toast.loading("Fetching subscribers...", { id: "sending" });
      const subResponse = await fetch("/api/subscribers");
      const subData = await subResponse.json();

      if (!subResponse.ok)
        throw new Error(subData.error || "Failed to fetch subscribers");

      const subscribersList = Array.isArray(subData) ? subData : [];
      const subscribers: string[] = subscribersList.map((sub: Subscribers) => sub.email);

      if (subscribers.length === 0) {
        toast.error("No active subscribers found", { id: "sending" });
      } else {
        const total = subscribers.length;
        const batchSize = 5;
        let sentCount = 0;

        const articleDetails = {
          title: publishedArticleData.title,
          description: publishedArticleData.description,
          slug: publishedArticleData.slug,
          collectionName:
            publishedArticleData.publicationMetadata?.collectionName,
          collectionDescription:
            publishedArticleData.publicationMetadata?.collectionDescription,
          nextArticleTitle:
            publishedArticleData.publicationMetadata?.nextArticleTitle,
          nextArticleDate:
            publishedArticleData.publicationMetadata?.nextArticleDate,
        };

        for (let i = 0; i < total; i += batchSize) {
          const batch = subscribers.slice(i, i + batchSize);

          toast.loading(
            `Sending batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(total / batchSize)}... (${sentCount}/${total})`,
            { id: "sending" }
          );

          await fetch("/api/send-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipients: batch,
              type: "article",
              article: articleDetails,
            }),
          });

          sentCount += batch.length;
        }
        toast.success(`Notifications sent to ${total} subscribers!`, {
          id: "sending",
        });
      }
    } catch (emailError: unknown) {
      console.error(emailError);
      toast.error(
        "Failed to send notifications: " +
          (emailError instanceof Error ? emailError.message : "Unknown error"),
        {
          id: "sending",
        }
      );
    } finally {
      setShowEmailDialog(false);
      router.push(
        publishedArticleData.collectionId
          ? `/collections/${publishedArticleData.collectionId}`
          : "/collections"
      );
    }
  };

  const handleSkipNotification = () => {
    setShowEmailDialog(false);
    router.push(
      initialData?.collectionId
        ? `/collections/${initialData.collectionId}`
        : "/collections"
    );
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
      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email Notification?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Do you want to send an email notification to all subscribers about
              this article?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleSkipNotification}
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 font-bold"
            >
              No, Just Update
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSendNotification();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none font-bold"
            >
              Yes, Send Notification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
