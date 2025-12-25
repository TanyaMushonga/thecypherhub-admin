import { revalidatePath } from "next/cache";
import prisma from "../../../lib/prisma";
import { calculateReadTime } from "../../../lib/utils";
import { validateRequest } from "@/auth";
import { put } from "@vercel/blob";


export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const content = formData.get("content") as string;
    const keywords = JSON.parse(formData.get("keywords") as string);
    const slug = formData.get("slug") as string;
    const coverImgFile = formData.get("coverImgUrl") as File;

    if (!Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: "Keywords must be an array" }),
        {
          status: 400,
        }
      );
    }

    let coverImgUrl = "";
    if (coverImgFile) {
      const coverImgName = `${slug}`;
      const blob = await put(coverImgName, coverImgFile, {
        access: "public",
      });

      coverImgUrl = blob.url;
    }

    const readTime: string = calculateReadTime(content!);

    const data = {
      title,
      description,
      category,
      coverImgUrl,
      content,
      keywords,
      slug,
      readTime: readTime,
      authorId: loggedInUser.id,
    };

    const createdArticle = await prisma.articles.create({
      data,
    });



    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");

    return new Response(
      JSON.stringify({ message: "Blog created successfully" }),
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error("Error saving blog:", error);
    return new Response(JSON.stringify({ message: "error", error: error }), {
      status: 500,
    });
  }
}
