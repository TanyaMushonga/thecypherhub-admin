"use client";
import React from "react";
import BlogEditor from "../../../components/othercomponents/BlogEditor";
import { ScrollArea } from "../../../components/ui/scroll-area";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

interface PublishedArticleWithMetadata extends Article {
  publicationMetadata?: {
    collectionName?: string;
    collectionDescription?: string;
    nextArticleTitle?: string;
    nextArticleDate?: string;
  };
}

function AddArticlePage() {
  const router = useRouter();

  const [showEmailDialog, setShowEmailDialog] = React.useState(false);
  const [articleData, setArticleData] =
    React.useState<PublishedArticleWithMetadata | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: ArticleFormData, coverImage?: File) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("content", data.content);
    formData.append("keywords", JSON.stringify(data.keywords));
    formData.append("slug", data.slug);
    formData.append("collectionId", data.collectionId || "");

    // Auto-publish if content is provided
    const hasContent =
      data.content && data.content.replace(/<[^>]*>/g, "").trim().length > 0;
    formData.append("status", hasContent ? "published" : data.status);

    if (coverImage) {
      formData.append("coverImgUrl", coverImage);
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/add-blog", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to create article";
        try {
          const errorData = await response.json();
          if (
            errorData.error &&
            errorData.error.code === "P2002" &&
            errorData.error.meta?.target?.includes("slug")
          ) {
            errorMessage =
              "An article with this slug already exists. Please choose a different slug.";
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === "string") {
            errorMessage = errorData.error;
          }
        } catch {
          const textError = await response.text();
          if (textError) errorMessage = textError;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Success: Ask to send notifications
      toast.success("Blog created successfully!");

      // Set article data (including publicationMetadata) for email notification
      setArticleData(result);
      setShowEmailDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNotification = async () => {
    if (!articleData) return;

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

        // Use the article description and collection metadata
        const articleDetails = {
          title: articleData.title,
          description: articleData.description,
          slug: articleData.slug,
          collectionName: articleData.publicationMetadata?.collectionName,
          collectionDescription:
            articleData.publicationMetadata?.collectionDescription,
          nextArticleTitle: articleData.publicationMetadata?.nextArticleTitle,
          nextArticleDate: articleData.publicationMetadata?.nextArticleDate,
        };

        for (let i = 0; i < total; i += batchSize) {
          const batch = subscribers.slice(i, i + batchSize);

          toast.loading(
            `Sending batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(total / batchSize)}... (${sentCount}/${total})`,
            { id: "sending" }
          );

          // Call send-batch with article details
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
      router.push("/articles");
    }
  };

  const handleSkipNotification = () => {
    setShowEmailDialog(false);
    router.push("/articles");
  };

  return (
    <ScrollArea className="bg-primary pt-4 h-full">
      <BlogEditor onSubmit={handleSubmit} loading={isSubmitting} />

      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to send an email notification to all subscribers about
              this new article?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipNotification}>
              No, Just Publish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-close to allow async operation (handled in function)
                handleSendNotification();
              }}
            >
              Yes, Send Notification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}

export default AddArticlePage;
