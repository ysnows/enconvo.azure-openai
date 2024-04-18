import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function proxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    // const body = {
    //     "stream": true,
    //     "messages": [
    //         {
    //             "content": "1+1=?",
    //             "role": "user"
    //         }
    //     ],
    //     "frequency_penalty": 0,
    //     "model": "gpt-3.5-turbo",
    //     "temperature": 1,
    //     "presence_penalty": 0,
    //     "max_tokens": 256,
    //     "top_p": 1
    // }

    // const response = await fetch("https://ai.openreader.xyz/v1/chat/completions", {
    //     "method": "POST",
    //     "headers": {
    //         "Content-Type": "application/json",
    //         "Authorization": "Bearer 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"
    //     },
    //     "body": JSON.stringify(body)
    // })
    const body = {
        "messages": [
            {
                "content": [
                    {
                        "type": "text",
                        "text": "Describe this image."
                    }
                ],
                "role": "user"
            }
        ],
        "model": "claude-3-sonnet-20240229",
        "max_tokens": 1024,
        "stream": false
    }


    const response = await fetch("https://api.anthropic.com/v1/messages", {
        "method": "POST",
        "headers": {
            "Accept": "application/json",
            "Anthropic-Version": "2023-06-01",
            "Content-Type": "application/json",
            "X-Api-Key": "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"
        },
        "body": JSON.stringify(body)
    })

    const json = await response.json()

    //@ts-ignore
    return { jsonBody: json };
};

app.http('proxy', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: proxy
});
