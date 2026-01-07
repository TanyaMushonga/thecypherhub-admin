import prisma from "../../../lib/prisma";
import { validateRequest } from "@/auth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      where: { isDeleted: false },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        articles: {
          where: {
            isDeleted: false,
            status: "published",
          },
        },
      },
    });

    return new Response(JSON.stringify(collections), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const slug = formData.get("slug") as string;
    const coverImgFile = formData.get("coverImgUrl") as File | null;

    if (!name || !slug) {
      return new Response(
        JSON.stringify({ error: "Name and Slug are required" }),
        {
          status: 400,
        }
      );
    }

    let coverImgUrl = "";
    if (coverImgFile && coverImgFile.size > 0) {
      const blob = await put(`collection-${slug}`, coverImgFile, {
        access: "public",
      });
      coverImgUrl = blob.url;
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        slug,
        coverImgUrl,
        authorId: loggedInUser.id,
      },
    });

    return new Response(JSON.stringify(collection), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
