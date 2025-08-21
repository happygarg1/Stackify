"use client"
import { MessagesContext } from '@/app/context/MessagesContext';
import Lookup from '@/app/data/Lookup';
import Prompt from '@/app/data/Prompt';
import { api } from '@/convex/_generated/api';
import { SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { Loader2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import { countToken } from './ChatView';
import { UserDetailContext } from '@/app/context/UserDetailContext';
import SandpackPreviewClient from './SandpackPreviewClient';
import { ActionContext } from '@/app/context/ActionContext';

function CodeView() {
    const {id}=useParams();
    const {userDetail,setUserDetail}=useContext(UserDetailContext);
    const [activeTab,setActiveTab]=useState('code');
    const [files,setFiles]=useState(Lookup?.DEFAULT_FILE)
    const {messages,setMessages}=useContext(MessagesContext);
    const UpdateFiles=useMutation(api.workspace.UpdateFiles)

    const convex=useConvex();
    const [loading,setLoading]=useState(false);
    const UpdateTokens=useMutation(api.users.UpdateToken);
    const {action,setAction}=useContext(ActionContext);

    useEffect(()=>{
        id && GetFiles();
    },[id])

    useEffect(()=>{
        setActiveTab('preview');
    },[action])
    const GetFiles=async()=>{
        setLoading(true)
        const result=await convex.query(api.workspace.GetWorkspace,{
            workspaceId:id
        });
        const mergedFiles={...Lookup.DEFAULT_FILE,...result?.fileData}
        setFiles(mergedFiles);

        setLoading(false)
    }
    useEffect(()=>{
        if(messages?.length>0){
            const role=messages[messages?.length-1].role;
            if(role=='user'){
                GenerateAiCode();
            }
        }
    },[messages])
    const GenerateAiCode=async ()=>{
        setLoading(true);
        const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
        const result=await axios.post('/api/gen-ai-code',{
            prompt:PROMPT
        })
        console.log(result.data);
        const aiResp=result.data;

        const mergedFiles={...Lookup.DEFAULT_FILE,...aiResp?.files}
        setFiles(mergedFiles);
        await UpdateFiles({
            workspaceId:id,
            files:aiResp?.files
        })

        const token=Number(userDetail?.token)-Number(countToken(JSON.stringify(aiResp)));
             await UpdateTokens({
              userId:userDetail?._id,
              token:token
        })
        setUserDetail(prev=>({
            ...prev,
            token:token
        }))
        setLoading(false)
        
    }
  return (
    <div className='relative'>
    <div className='bg-[#181818] w-full p-2 border'>
        <div className='flex items-center flex-wrap shrink-0 bg-black p-1 justify-center w-[140px] gap-3'>
            <h2 onClick={()=>setActiveTab('code')} className={`text-sm text-white cursor-pointer ${activeTab=='code' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'} `}>Code</h2>
            <h2 onClick={()=>setActiveTab('preview')} className={`text-sm text-white cursor-pointer ${activeTab=='preview' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'} `}>Preview</h2>
        </div>
    </div>
        <SandpackProvider template='react' theme={'dark'} files={files}
        customSetup={{
            dependencies:{
                ...Lookup.DEPENDANCY
            }
        }}

        options={{
            externalResources:['https://cdn.tailwindcss.com']
        }}
        >
            <SandpackLayout>
                {activeTab=='code'?<>
                    <SandpackFileExplorer style={{height:'80vh'}}/>
                    <SandpackCodeEditor style={{height:'80vh'}}/>
                </>:<>
                   <SandpackPreviewClient/>
                </>}   
            </SandpackLayout>
        </SandpackProvider>

        {loading && <div className='p-10 bg-gray-900 opacity-90 absolute top-0 rounded-lg w-full h-full items-center justify-center'>
            <Loader2Icon className='animate-spin h-10 w-10 text-white mt-50'/>
            <h2 className='text-white'>Generating your files...</h2>
        </div>}
    </div>
  )
}

export default CodeView