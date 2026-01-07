import { validateRequest } from "@/auth";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { type, id } = await req.json();

    if (!type || !id) {
      return new Response(
        JSON.stringify({ error: "Type and ID are required" }),
        {
          status: 400,
        }
      );
    }

    if (type === "article") {
      await prisma.articles.update({
        where: { id: id, authorId: loggedInUser.id },
        data: { isDeleted: false },
      });
    } else if (type === "collection") {
      await prisma.collection.update({
        where: { id: id, authorId: loggedInUser.id },
        data: { isDeleted: false },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({ message: "Item restored successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error restoring item:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
