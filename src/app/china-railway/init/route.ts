export async function GET() {
  const response = await fetch(`https://kyfw.12306.cn/otn/leftTicket/init`);
  const setCookie = response.headers.get("Set-Cookie")!
  const headers = new Headers({"Set-Cookie": setCookie.replace(/Path=\/[^,]+/gi, 'Path=/')})

  return new Response(null, {headers});
}
