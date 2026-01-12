import prisma from "../../../../lib/prisma";
import { put, del } from "@vercel/blob";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idOrSlug = url.pathname.split("/").pop();

    if (!idOrSlug) {
      return new Response(JSON.stringify({ error: "ID or Slug is required" }), {
        status: 400,
      });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        articles: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!collection) {
      return new Response(JSON.stringify({ error: "Collection not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(collection), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching collection detail:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const slug = formData.get("slug") as string | null;
    const coverImgFile = formData.get("coverImgUrl") as File | null;

    // Standard usage since client is regenerated
    const existing = await prisma.collection.findUnique({
      where: { id, authorId: loggedInUser.id },
    });

    if (!existing) {
      return new Response(JSON.stringify({ error: "Collection not found" }), {
        status: 404,
      });
    }

    let coverImgUrl = existing.coverImgUrl;
    if (coverImgFile && coverImgFile.size > 0) {
      if (coverImgUrl) {
        try {
          await del(coverImgUrl);
        } catch (e) {
          console.error("Failed to delete old collection cover:", e);
        }
      }
      const blob = await put(
        `collection-${slug || existing.slug}`,
        coverImgFile,
        {
          access: "public",
        }
      );
      coverImgUrl = blob.url;
    }

    const collection = await prisma.collection.update({
      where: { id, authorId: loggedInUser.id },
      data: {
        name: name || undefined,
        description: description !== null ? description : undefined,
        slug: slug || undefined,
        coverImgUrl: coverImgUrl || undefined,
      },
    });

    revalidatePath("/collections");
    revalidatePath("/articles");
    revalidatePath("/");

    return new Response(JSON.stringify(collection), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    // Cascade hard delete to all articles in this collection
    await prisma.articles.deleteMany({
      where: { collectionId: id, authorId: loggedInUser.id },
    });

    // Hard delete the collection
    await prisma.collection.delete({
      where: { id, authorId: loggedInUser.id },
    });

    revalidatePath("/collections");
    revalidatePath("/articles");
    revalidatePath("/");

    return new Response(
      JSON.stringify({ message: "Collection deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting collection:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
