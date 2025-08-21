const{
    GoogleGenerativeAI,
}=require("@google/generative-ai");

const apiKey=process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI=new GoogleGenerativeAI(apiKey);

const model=genAI.getGenerativeModel({
    model:"gemini-2.0-flash-exp",
})

const generationConfig={
    temperature:1,
    topP:0.95,
    topK:40,
    maxOutputTokens:8192,
    responseMimeType:"text/plain",
};

const CodeGenerationConfig={
    temperature:1,
    topP:0.95,
    topK:40,
    maxOutputTokens:8192,
    responseMimeType:"application/json",
};

   export const chatSession=model.startChat({
        generationConfig,
        history:[
        ],
    });

    export const GenAiCode=model.startChat({
        generationConfig:CodeGenerationConfig,
        history:[
            {
                role:"user",
                parts:[
                    {text:"Generate to do app : Generate a Project in React"}
                ],
            },
            {
                role:"model",
                parts:[
                    {text:"```json\n{\n \"projectTitle\": \"Simple To-Do App\",\n"}
                ],
            },
        ],
    })

    // const result=await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
