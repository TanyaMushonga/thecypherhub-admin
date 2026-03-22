"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getCollections(): Promise<Collection[]> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Unauthorized");

  return (await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      articles: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          content: true,
          readTime: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          keywords: true,
          slug: true,
          collectionId: true,
          status: true,
          publishedAt: true,
        },
      },
    },
  })) as unknown as Collection[];
}

export async function getCollectionById(
  id: string
): Promise<Collection | null> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Unauthorized");

  return (await prisma.collection.findFirst({
    where: { id },
    include: {
      articles: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          content: true,
          readTime: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          keywords: true,
          slug: true,
          collectionId: true,
          status: true,
          publishedAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })) as unknown as Collection | null;
}

export async function toggleArticlePublication(
  slug: string,
  status: "published" | "unpublished"
) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Unauthorized");

  const article = await prisma.articles.findUnique({
    where: { slug, authorId: loggedInUser.id },
  });

  if (!article) throw new Error("Article not found");

  const updatedArticle = await prisma.articles.update({
    where: { slug, authorId: loggedInUser.id },
    data: {
      status,
      publishedAt:
        status === "published" && !article.publishedAt
          ? new Date()
          : article.publishedAt,
    },
  });

  revalidatePath(`/collections/${article.collectionId}`);
  revalidatePath("/articles");
  revalidatePath("/");

  // Revalidate the public blog
  try {
    const pathsToRevalidate = ["/blog", `/blog/${slug}`, "/api/blogs", "/"];
    // If it's part of a collection/series, revalidate that too on public site
    const collection = await prisma.collection.findUnique({
      where: { id: article.collectionId || "" },
    });
    if (collection?.slug) {
      pathsToRevalidate.push(`/series/${collection.slug}`);
      pathsToRevalidate.push(`/series/${collection.slug}/${slug}`);
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paths: pathsToRevalidate,
      }),
    });
  } catch (revalidateError) {
    console.error("Failed to revalidate public blog:", revalidateError);
  }

  return updatedArticle;
}
