"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const [totalSubscribers, activeSubscribers, articlesCount, commentsCount] = await Promise.all([
      prisma.subscribers.count(),
      prisma.subscribers.count({ where: { status: 1 } }),
      prisma.articles.count(),
      prisma.comments.count(),
    ]);

    return {
      subscribers: totalSubscribers,
      activeSubscribers,
      articles: articlesCount,
      comments: commentsCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      subscribers: 0,
      activeSubscribers: 0,
      articles: 0,
      comments: 0,
      error: "Failed to fetch stats",
    };
  }
}
