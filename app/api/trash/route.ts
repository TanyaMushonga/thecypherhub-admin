import prisma from "../../../lib/prisma";
import { validateRequest } from "@/auth";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const [deletedArticles, deletedCollections] = await Promise.all([
      prisma.articles.findMany({
        where: { isDeleted: true, authorId: loggedInUser.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.collection.findMany({
        where: { isDeleted: true, authorId: loggedInUser.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return new Response(
      JSON.stringify({
        articles: deletedArticles,
        collections: deletedCollections,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching trash items:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
