"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const [
      totalSubscribers,
      activeSubscribers,
      articlesCount,
      commentsCount,
      collectionsCount,
    ] = await Promise.all([
      prisma.subscribers.count(),
      prisma.subscribers.count({ where: { status: 1 } }),
      prisma.articles.count({ where: { isDeleted: false } }),
      prisma.comments.count(),
      prisma.collection.count({ where: { isDeleted: false } }),
    ]);

    return {
      subscribers: totalSubscribers,
      activeSubscribers,
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
