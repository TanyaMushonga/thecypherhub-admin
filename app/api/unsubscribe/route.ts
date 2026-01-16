import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return new Response(JSON.stringify({ error: "The email is required" }), {
        status: 400,
      });
    }
    const subscriber = await prisma.subscribers.findUnique({
      where: { email },
    });
    if (!subscriber) {
      return new Response(JSON.stringify({ error: "Subscriber not found" }), {
        status: 400,
      });
    }
    const deletedSubscriber = await prisma.subscribers.delete({
      where: { email: subscriber.email },
    });
    if (deletedSubscriber) {
      return new Response(
        JSON.stringify({
          message: "Unsubscribed successfully, We're sad to see you go.",
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
