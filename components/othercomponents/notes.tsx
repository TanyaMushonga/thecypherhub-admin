"use client";
import React, { useEffect, useRef, useTransition } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  sendEmailToMyselfAction,
  sendEmailToSubscribersAction,
} from "@/app/(main)/actions/Notes";
import toast from "react-hot-toast";
import { Input } from "../ui/input";

function Notes() {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPendingSubscribers, startTransitionSubscribers] = useTransition();
  const [subject, setSubject] = React.useState("");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      editorRef.current &&
      !quillInstanceRef.current
    ) {
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image", "code-block"],
            ["clean"],
          ],
        },
      });

      const toolbar =
        editorRef.current.parentElement?.querySelector(".ql-toolbar");
      if (toolbar instanceof HTMLElement) {
        toolbar.style.backgroundColor = "#10173b";
        toolbar.style.color = "#ffffff";
        toolbar.style.border = "1px solid #ccc";
        toolbar.style.borderBottom = "none";
        toolbar.style.borderRadius = "5px 5px 0 0";
        toolbar.style.padding = "5px";
        toolbar.style.boxSizing = "border-box";
      }
      if (toolbar) {
        const icons = toolbar.querySelectorAll(".ql-stroke, .ql-fill");
        icons.forEach((icon) => {
          (icon as HTMLElement).style.stroke = "#ffffff"; // Set stroke color to white
          // Set fill color to white
        });
      }
      const editor = editorRef.current.querySelector(".ql-editor");
      if (editor instanceof HTMLElement) {
        editor.style.color = "#fff";
        editor.style.backgroundColor = "#171e42";
        editor.style.fontSize = "16px"; // Increase font size
        editor.style.lineHeight = "1.6";
      }
    }
  }, []);

  const sendToSubscribers = () => {
    if (quillInstanceRef.current) {
      const content = quillInstanceRef.current.root.innerHTML;
      startTransitionSubscribers(() => {
        sendEmailToSubscribersAction(content, subject).then((res) => {
          if (res.success) {
            toast.success("Email sent successfully!");
          }
          if (res.error) {
            toast.error(res.error);
          }
        });
      });
    }
  };
  const sendToMyself = () => {
    if (quillInstanceRef.current) {
      const content = quillInstanceRef.current.root.innerHTML;
      startTransition(() => {
        sendEmailToMyselfAction(content, subject).then((res) => {
          if (res.success) {
            toast.success(res.success);
          }
          if (res.error) {
            toast.error(res.error);
          }
        });
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl text-white my-5">
        Send notes to your subscribers
      </h2>
      <div
        ref={editorRef}
        style={{
          height: "300px",
          border: "1px solid #ccc",
          backgroundColor: "#171e42",
        }}
      ></div>
      <div className="mt-4">
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-blue-950 text-white"
        />
        <div className="flex flex-row gap-4">
          <button
            onClick={sendToMyself}
            disabled={isPending || !subject || !quillInstanceRef.current}
            className="mt-4 px-4 py-2 bg-blue-700 text-white rounded"
          >
            {isPending ? "Sending..." : "Send to myself"}
          </button>

          <button
            onClick={sendToSubscribers}
            disabled={
              isPendingSubscribers || !subject || !quillInstanceRef.current
            }
            className="mt-4 px-4 py-2 bg-blue-700 text-white rounded"
          >
            {isPendingSubscribers ? "Sending..." : "Send to subscribers"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notes;
