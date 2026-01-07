import { revalidatePath } from "next/cache";
import prisma from "../../../lib/prisma";
import { calculateReadTime } from "../../../lib/utils";
import { validateRequest } from "@/auth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const collectionId = formData.get("collectionId") as string | null;
    const category =
      (formData.get("category") as string) || (collectionId ? null : "General");
    const content = (formData.get("content") as string) || "";
    const keywordsRaw = formData.get("keywords") as string;
    const keywords = keywordsRaw ? JSON.parse(keywordsRaw) : [];
    const slug = formData.get("slug") as string;
    const status = (formData.get("status") as string) || "unpublished";
    const publishedAtStr = formData.get("publishedAt") as string | null;
    const coverImgFile = formData.get("coverImgUrl") as File | null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (publishedAtStr) {
      const selectedDate = new Date(publishedAtStr);
      if (selectedDate < today) {
        return new Response(
          JSON.stringify({
            message: "Planned/Publish Date cannot be in the past",
          }),
          { status: 400 }
        );
      }
    }

    if (!title || title.length < 50 || title.length > 60) {
      return new Response(
        JSON.stringify({
          message: "Title must be between 50 and 60 characters",
        }),
        { status: 400 }
      );
    }

    if (!Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ message: "Keywords must be an array" }),
        {
          status: 400,
        }
      );
    }

    let coverImgUrl = "";
    if (coverImgFile && coverImgFile.size > 0) {
      const coverImgName = `blog-${slug}`;
      const blob = await put(coverImgName, coverImgFile, {
        access: "public",
      });

      coverImgUrl = blob.url;
    }

    const readTime: string = calculateReadTime(content);

    let publishedAt: Date | null = null;
    if (status === "published") {
      publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();
    } else if (publishedAtStr) {
      publishedAt = new Date(publishedAtStr);
    }

    const data = {
      title,
      description,
      category: category as string | null,
      coverImgUrl,
      content,
      keywords,
      slug,
      readTime: readTime,
      authorId: loggedInUser.id,
      collectionId: collectionId || null,
      status: status,
      publishedAt,
    };

    // Check if slug already exists
    if (slug) {
      const existingArticle = await prisma.articles.findUnique({
        where: { slug },
      });

      if (existingArticle) {
        return new Response(
          JSON.stringify({
            message: "An article with this slug already exists.",
            error: {
              code: "P2002",
              meta: { target: ["slug"] },
            },
          }),
          { status: 400 }
        );
      }
    }

    await prisma.articles.create({
      data,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");

    return new Response(
      JSON.stringify({ message: "Blog created successfully" }),
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error("Error saving blog:", error);
    // Ensure Prisma errors are returned in a way the client can handle them if they happen during create
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while saving the blog";

    // Check if it's a Prisma unique constraint error
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return new Response(
        JSON.stringify({
          message:
            "A unique constraint failed. Check if the slug is already in use.",
          error: error,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        message: errorMessage,
        error: error,
      }),
      { status: 500 }
    );
  }
}
