export async function proxyToApi(request, env) {
  const apiOrigin = env.API_ORIGIN || 'https://effulgent-sawine-bfe6b3.netlify.app/.netlify/functions/api';

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(apiOrigin);
  targetUrl.pathname = `${targetUrl.pathname.replace(/\/+$/, '')}${requestUrl.pathname}`;
  targetUrl.search = requestUrl.search;
  targetUrl.hash = '';
  const proxiedRequest = new Request(targetUrl, request);
  proxiedRequest.headers.set('x-forwarded-host', requestUrl.host);
  proxiedRequest.headers.set('x-forwarded-proto', requestUrl.protocol.slice(0, -1));
  return fetch(proxiedRequest);
}
