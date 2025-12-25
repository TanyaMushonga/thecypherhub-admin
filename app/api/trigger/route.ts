import { createAppRoute } from "@trigger.dev/nextjs";
import { client } from "@/trigger";
// Import jobs to ensure they are registered
import "@/jobs/emailNotes";
import "@/jobs/newArticleJob";
import "@/jobs/forgotPassword";

//this route is used to send and receive data with Trigger.dev
export const { POST, dynamic } = createAppRoute(client);
