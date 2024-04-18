
export class AIController {

  static async handleRequest(request: Request) {
    const url = new URL(request.url);
    const fetchAPI = request.url.replace(url.host, 'chat.openai.com');
    console.log("url", fetchAPI, request.headers)

    // 部分代理工具，请求又浏览器发起，跨域请求时会先发送一个 preflight 进行检查，也就是 OPTIONS 请求
    // 需要响应该请求，否则后续的 POST 会失败
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    let body: any;
    if (request.method === 'POST') body = await request.json();



    const payload = {
      method: request.method,
      headers: {
        ...request.headers
      },
      body: typeof body === 'object' ? JSON.stringify(body) : '{}',
    };
    // 在 Cloudflare 中，HEAD 和 GET 请求带 body 会报错
    if (['HEAD', 'GET'].includes(request.method)) delete payload.body;

    // 入参中如果包含了 stream=true，则表现形式为非流式输出
    const response = await fetch(fetchAPI, payload);
    if (body && body.stream && body.stream === false) {
      const results = await response.json();
      return new Response(JSON.stringify(results), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  }

}

