// components\custom\ChatView.jsx
"use client";
import { MessagesContext } from "@/app/context/MessagesContext";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import Colors from "@/app/data/Colors";
import Lookup from "@/app/data/Lookup";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { ArrowRight, Link } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput,setuserInput]=useState();
  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);
  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    setMessages(result?.messages);
    console.log(result);
  };

  // Default image for unsigned-in users
  const defaultUserImage = "https://placehold.co/35x35/cccccc/ffffff?text=U";

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll ">
        {messages?.map((msg, index) => (
          <div
            key={index}
            className="p-3 rounded-lg mb-2 flex gap-2 items-start"
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
            <h2>{msg.content}</h2>
          </div>
        ))}
      </div>

      <div
        style={{ backgroundColor: Colors.BACKGROUND }}
        className="p-5 border rounded-xl max-w-2xl w-full mt-3"
      >
        <div className="flex gap-2">
          <textarea
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
