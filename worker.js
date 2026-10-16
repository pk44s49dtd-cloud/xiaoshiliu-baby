// 小石榴待产清单 - Cloudflare Worker
// 部署到Cloudflare Workers后，把URL填到HTML里

const PASSWORD = 'shiliu2027'; // 改这里设置你的密码

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Password',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/state') {
      const data = await env.SHILIU_KV.get('checklist');
      return new Response(data || '{}', {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST' && url.pathname === '/state') {
      const auth = request.headers.get('X-Auth-Password');
      if (auth !== PASSWORD) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const body = await request.text();
      await env.SHILIU_KV.put('checklist', body);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
