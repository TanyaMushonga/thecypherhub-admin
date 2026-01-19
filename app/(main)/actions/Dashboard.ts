"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const [totalSubscribers, articlesCount, commentsCount, collectionsCount] =
      await Promise.all([
        prisma.subscribers.count(),
        prisma.articles.count({
          where: { status: "published" },
        }),
        prisma.comments.count(),
        prisma.collection.count(),
      ]);


    return {
      subscribers: totalSubscribers,
      activeSubscribers: totalSubscribers,
      articles: articlesCount,
      comments: commentsCount,
      collections: collectionsCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      subscribers: 0,
      activeSubscribers: 0,
      articles: 0,
      comments: 0,
      collections: 0,
      error: "Failed to fetch stats",
    };
  }
}
