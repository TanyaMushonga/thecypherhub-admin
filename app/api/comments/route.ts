import { sendCommentNotification } from "@/lib/emails";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const articleId = url.searchParams.get("articleId");

    if (!articleId) {
      return new Response(JSON.stringify({ error: "articleId is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const comments = await prisma.comments.findMany({
      where: {
        articleId: articleId,
        article: {
          isDeleted: false,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(comments), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export const POST = async (request: Request) => {
  try {
    const { articleId, comment } = await request.json();
    if (!comment || !articleId) {
      return new Response(
        JSON.stringify({ error: "comment and articleId are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const newComment = await prisma.comments.create({
      data: {
        comment,
        article: {
          connect: {
            id: articleId,
          },
        },
      },
    });
    const article = await prisma.articles.findUnique({
      where: {
        id: articleId,
      },
    });

    await sendCommentNotification(
      article?.title ?? "Untitled Article",
      comment
    );

    return new Response(JSON.stringify(newComment), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error posting comment:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
