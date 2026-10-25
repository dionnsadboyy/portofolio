'use strict';
// Exercise the Pages Request/Response adapter without a Cloudflare account or live AI calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

module.exports = async function checkPages() {
  // Load the edge ES module without changing the project's CommonJS configuration.
  const handlerUrl = pathToFileURL(require.resolve('../api/portfolio-assistant.js')).href;
  const source = fs.readFileSync(path.join(__dirname, '../functions/api/portfolio-assistant.js'), 'utf8')
    .replace('"../../api/portfolio-assistant.js"', JSON.stringify(handlerUrl));
  const {onRequest} = await import('data:text/javascript,' + encodeURIComponent(source));
  const configured = Object.freeze({LLM_BASE_URL:'https://provider.invalid/v1', LLM_API_KEY:'test-only', LLM_MODEL:'test-model'});
  const keys = Object.keys(configured), previousEnv = keys.map(key => process.env[key]);
  const previousFetch = global.fetch, previousError = console.error;
  let checks = 0, providerCalls = 0;
  const call = (method, body, env = {}, headers = {}) => onRequest({env, request:new Request('https://portfolio.test/api/portfolio-assistant', {
    method, ...(body === undefined ? {} : {body:typeof body === 'string' ? body : JSON.stringify(body)}), headers,
  })});
  async function expect(response, status) {
    const result = await response;
    assert.equal(result.status, status);
    assert.equal(result.headers.get('Cache-Control'), 'no-store');
    checks++;
    return result;
  }
  try {
    keys.forEach(key => {process.env[key] = 'node-fallback-must-not-be-used';});
    global.fetch = async (url, options) => {
      providerCalls++;
      assert.equal(url, configured.LLM_BASE_URL + '/chat/completions');
      assert.equal(options.headers.Authorization, 'Bearer ' + configured.LLM_API_KEY);
      assert.equal(JSON.parse(options.body).model, configured.LLM_MODEL);
      return new Response('{"error":"provider unavailable"}', {status:503});
    };
    console.error = () => {}; // Expected provider failure; no diagnostic files.
    const health = await Promise.all([
      expect(call('GET', undefined, configured), 200),
      expect(call('GET'), 200),
    ]);
    assert.deepEqual(await health[0].json(), {success:true, available:true});
    assert.deepEqual(await health[1].json(), {success:true, available:false});
    await expect(call('POST', {message:'gua mau bkin sistem order realtime, gua mau joki ke dia?'}), 503);
    await expect(call('POST', {message:''}), 400);
    await expect(call('POST', {message:'x'.repeat(601)}), 400);
    await expect(call('POST', {message:'Dion', history:[{role:'system', content:'invalid'}]}), 400);
    await expect(call('POST', '{broken'), 400);
    await expect(call('POST', '{}', {}, {'Content-Length':'32001'}), 413);
    // Actual UTF-8 byte limit, including streams without a Content-Length header.
    const bytes = new TextEncoder().encode('\u00e9'.repeat(16001));
    const stream = new ReadableStream({start(controller) {
      controller.enqueue(bytes.slice(0,16001)); controller.enqueue(bytes.slice(16001)); controller.close();
    }});
    await expect(onRequest({env:{},request:new Request('https://portfolio.test/api/portfolio-assistant', {method:'POST',body:stream,duplex:'half'})}), 413);
    const method = await expect(call('PUT'), 405);
    assert.equal(method.headers.get('Allow'), 'GET, POST');
    assert.equal(providerCalls, 0, 'Health, validation and missing config must not call a provider');
    const failure = await expect(call('POST', {message:'Ceritakan Dion'}, configured), 502);
    assert.equal((await failure.json()).success, false);
    assert.equal(providerCalls, 1);
    assert.deepEqual(keys.map(key => process.env[key]), keys.map(() => 'node-fallback-must-not-be-used'));
    console.log(`PASS: ${checks} Pages adapter contracts, isolated request environment, streamed UTF-8 body limit and provider failure. No live provider request sent.`);
  } finally {
    global.fetch = previousFetch; console.error = previousError;
    keys.forEach((key,index) => {if(previousEnv[index] === undefined) delete process.env[key]; else process.env[key] = previousEnv[index];});
  }
};

if (require.main === module) module.exports().catch(error => {console.error(error.message); process.exitCode = 1;});
