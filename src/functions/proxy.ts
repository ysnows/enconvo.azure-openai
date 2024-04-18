import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
app.setup({ enableHttpStream: true });
export async function proxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const url = new URL(request.url);
    let path = url.pathname
    path = path.replace('/api/proxy', '');

    console.log("path:", path);

    let body: any;
    if (request.method === 'POST') body = await request.json();

    let fetchAPI = `https://api.anthropic.com/v1/messages`;
    // let fetchAPI = `https://api.anthropic.com${path}`;
    console.log("fetchAPI:", fetchAPI);

    const apiKey = process.env.ANTHROPIC_API_KEY
    console.log("process.env.ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY)

    let headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    for (const [key, value] of request.headers.entries()) {
        console.log(key, value)
        if (
            key === 'connection' ||
            key === 'content-length' ||
            key === 'user-agent' ||
            key === 'content-type' ||
            key === 'host' ||
            key === 'accept'
        ) {
            continue
        }
        if (key === 'host') {
            headers['host'] = 'api.anthropic.com'
        } else {
            headers[key] = value
        }
    }


    let payload: any = {
        method: request.method,
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        body: typeof request.body === 'object' ? JSON.stringify(body) : '{}',
    };

    console.log("payload:", payload);

    const response = await fetch(fetchAPI, payload)

    console.log("response:", response.headers.get('content-type'));
    if ('application/json' === response.headers.get('content-type')) {
        const results = await response.json();
        return { jsonBody: results }
    }

    //@ts-ignore
    return { body: response.body, headers: response.headers, status: response.status, statusText: response.statusText };
};


app.http('proxy', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: proxy,
    route: "proxy/{version}/{path}",
});
