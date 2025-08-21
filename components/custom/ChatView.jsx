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
import Image from "next/image";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import React, { useContext, useEffect, useState } from "react";
import { useSidebar } from "../ui/sidebar";
import { toast } from "sonner";


// A more robust token count function
export const countToken = (inputText) => {
  if (!inputText) return 0;
  return inputText.trim().split(/\s+/).filter(word => word).length;
};

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput, setuserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const { toggleSidebar } = useSidebar();
  const updateTokens = useMutation(api.users.UpdateToken);

  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    setMessages(Array.isArray(result?.messages) ? result.messages : []);
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
    const aiResp = {
      role: "ai",
      content: result.data.result,
    };
    
    // Create a new array that includes all messages up to the AI's response
    const updatedMessages = [...messages, aiResp];
    
    setMessages(updatedMessages);

    await UpdateMessages({
      messages: updatedMessages,
      workspaceId: id,
    });

    const tokensUsed = countToken(aiResp.content);
    const newTokens = Number(userDetail?.token) - tokensUsed;

    setUserDetail(prev => ({
      ...prev,
      token: newTokens,
    }));
    
    await updateTokens({
      userId: userDetail?._id,
      token: newTokens,
    });

    setLoading(false);
  };

  const onGenerate = async (input) => {
    if (userDetail?.token < 10) {
      toast("You don't have enough tokens to generate.");
      return;
    }

    // Optimistically add the new user message to the state
    const newUserMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setuserInput("");
  };

  const defaultUserImage = "https://placehold.co/35x35/cccccc/ffffff?text=U";

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll scrollbar-hide">
        {Array.isArray(messages) && messages?.map((msg, index) => (
          <div
            key={index}
            className="p-3 rounded-lg mb-2 flex gap-2 items-start leading-7"
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,
            }}
          >
            {msg?.role == "user" && (
              <Image
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

      <div className="flex gap-2 items-end">
        {userDetail && (
          <Image
            className="rounded-full cursor-pointer"
            onClick={toggleSidebar}
            src={userDetail?.picture}
            alt="user"
            width={30}
            height={30}
          />
        )}
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
    </div>
  );
}

export default ChatView;