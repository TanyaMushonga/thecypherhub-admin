"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getCollections(): Promise<Collection[]> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Unauthorized");

  return (await prisma.collection.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      articles: {
        where: { isDeleted: false, status: "published" },
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
    where: { id, isDeleted: false },
    include: {
      articles: {
        where: { isDeleted: false, status: "published" },
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

  return updatedArticle;
}
