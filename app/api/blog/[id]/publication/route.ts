import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const slug = url.pathname.split("/").slice(-2, -1)[0]; // Get the slug from /api/blog/[slug]/publication

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug is required" }), {
        status: 400,
      });
    }

    const { status } = await req.json();

    if (status !== "published" && status !== "unpublished") {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
      });
    }

    const article = await prisma.articles.findUnique({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    if (!article) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
      });
    }

    const updatedArticle = await prisma.articles.update({
      where: { slug: slug, authorId: loggedInUser.id },
      data: {
        status,
        publishedAt:
          status === "published" && !article.publishedAt
            ? new Date()
            : article.publishedAt,
      },
    });

    return new Response(JSON.stringify(updatedArticle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error toggling publication:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
