// components\custom\ChatView.jsx
"use client";
import { MessagesContext } from "@/app/context/MessagesContext";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import Colors from "@/app/data/Colors";
import Lookup from "@/app/data/Lookup";
import Prompt from "@/app/data/Prompt";
import { api } from "@/convex/_generated/api";
import axios from "axios";
import { useConvex, useMutation } from "convex/react";
import { ArrowRight, Link, Loader2Icon } from "lucide-react";
import { Content } from "next/font/google";
import Image from "next/image";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import React, { useContext, useEffect, useState } from "react";

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput, setuserInput] = useState();
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);
  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    setMessages(result?.messages);
    // console.log(result);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const role = messages[messages?.length - 1].role;
      if (role == "user") {
        GetAiResponse();
      }
    }
  }, [messages]);
  const GetAiResponse = async () => {
    setLoading(true);
    const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
    const result = await axios.post("/api/ai-chat", {
      prompt: PROMPT,
    });
    // console.log(result.data.result);
    const aiResp = {
      role: "ai",
      content: result.data.result,
    };
    setMessages((prev) => [...prev, aiResp]);
    await UpdateMessages({
      messages: [...messages, aiResp],
      workspaceId: id,
    });
    setLoading(false);
  };
  const onGenerate = (input) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
    ]);
    setuserInput("");
  };
  // Default image for unsigned-in users
  const defaultUserImage = "https://placehold.co/35x35/cccccc/ffffff?text=U";

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll scrollbar-hide">
        {messages?.map((msg, index) => (
          <div
            key={index}
            className="p-3 rounded-lg mb-2 flex gap-2 items-start leading-7"
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,
            }}
          >
            {msg?.role == "user" && (
              <Image
                // Conditional check
                src={userDetail?.picture || defaultUserImage}
                alt="userImage"
                width={35}
                height={35}
                className="rounded-full"
              />
            )}
            <div className="flex flex-col">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div
            className="p-3 rounded-lg mb-2 flex gap-2 items-center"
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,
            }}
          >
            <Loader2Icon className="animate-spin" />
            <h2>Generating response</h2>
          </div>
        )}
      </div>

      <div
        style={{ backgroundColor: Colors.BACKGROUND }}
        className="p-5 border rounded-xl max-w-2xl w-full mt-3"
      >
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={(event) => setuserInput(event.target.value)}
            className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
            placeholder={Lookup.INPUT_PLACEHOLDER}
          />
          {userInput && (
            <ArrowRight
              onClick={() => onGenerate(userInput)}
              className="bg-blue-500 p-2 h-8 w-8 rounded-md cursor-pointer"
            />
          )}
        </div>
        <div>
          <Link className="h-10 w-5" />
        </div>
      </div>
    </div>
  );
}

export default ChatView;
