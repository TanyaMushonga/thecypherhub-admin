import { validateRequest } from "@/auth";
import prisma from "../../../../lib/prisma";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const { user: loggedInUser } = await validateRequest();

    const blog = await prisma.articles.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
        ...(!loggedInUser ? { status: "published" } : {}),
      },
      include: {
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(blog), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
      }
    );
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
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const blog = await prisma.articles.findUnique({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const collectionId = formData.get("collectionId") as string | null;
    const category =
      (formData.get("category") as string) ||
      (collectionId ? null : blog.category || "General");
    const content = formData.get("content") as string;
    const keywords = JSON.parse(formData.get("keywords") as string);
    const SLUG = formData.get("slug") as string;
    const status = formData.get("status") as string;
    const publishedAtStr = formData.get("publishedAt") as string | null;
    const coverImgFile = formData.get("coverImgUrl") as File | null;

    if (!Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: "Keywords must be an array" }),
        {
          status: 400,
        }
      );
    }

    let coverImgUrl = blog.coverImgUrl!;
    if (coverImgFile && coverImgFile.size > 0) {
      if (coverImgUrl) {
        try {
          await del(coverImgUrl);
        } catch (e) {
          console.error("Failed to delete old cover image:", e);
        }
      }

      // Upload the new image to Vercel Blob
      const coverImgName = `blog-${SLUG}`;
      const blob = await put(coverImgName, coverImgFile, {
        access: "public",
      });

      coverImgUrl = blob.url;
    }

    let publishedAt = blog.publishedAt;
    if (status === "published" && !blog.publishedAt) {
      publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();
    } else if (publishedAtStr) {
      publishedAt = new Date(publishedAtStr);
    } else if (status === "unpublished" && !publishedAtStr) {
      // Keep existing publishedAt if it was previously published,
      // or keep it null if it's still unpublished.
    }

    const updatedData = {
      title,
      description,
      category: category as string | null,
      coverImgUrl,
      content,
      keywords,
      slug: SLUG,
      collectionId: collectionId || null,
      status: status,
      publishedAt,
    };

    const updatedBlog = await prisma.articles.update({
      where: { slug: slug, authorId: loggedInUser.id },
      data: updatedData,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");
    revalidatePath(`/api/blog/${slug}`);

    return new Response(JSON.stringify(updatedBlog), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
      }
    );
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
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "slug is required" }), {
        status: 400,
      });
    }

    const blog = await prisma.articles.findUnique({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }
    await prisma.articles.update({
      where: { slug: slug, authorId: loggedInUser.id },
      data: { isDeleted: true },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");

    return new Response(
      JSON.stringify({ message: "Blog deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
      }
    );
  }
}
