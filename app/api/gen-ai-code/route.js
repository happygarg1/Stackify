import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { prompt } = await req.json();
    let resp = null; // Initialize resp outside the try block

    try {
        const result = await GenAiCode.sendMessage(prompt);
        resp = result.response.text(); // Assign the response here

        // Safely attempt to parse the AI response
        const parsedResponse = JSON.parse(resp);

        // If parsing is successful, return the JSON
        return NextResponse.json(parsedResponse);
    } catch (e) {
        // If an error occurs, check if it's a parsing error
        if (e instanceof SyntaxError) {
            console.error("Syntax Error: Could not parse AI response as JSON.", e);
            // Return the raw response in the error for debugging
            return NextResponse.json({ 
                error: "AI response is not valid JSON.",
                rawResponse: resp
            }, { status: 500 });
        }
        
        // Handle other errors (e.g., failed API call)
        console.error("API Error:", e);
        return NextResponse.json({ 
            error: "An unexpected error occurred." 
        }, { status: 500 });
    }
}