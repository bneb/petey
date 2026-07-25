import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startServer } from '../../src/thin-client/server.js';
import { request } from 'http';

let server;
const PORT = 3098; // Use different port for tests

beforeAll(async () => {
  server = await startServer(PORT);
});

afterAll(() => {
  if (server) { server.close(); }
});

function httpRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    var opts = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };
    var req = request(opts, function (res) {
      var data = '';
      res.on('data', function (c) { data += c; });
      res.on('end', function () {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    if (body) { req.write(JSON.stringify(body)); }
    req.end();
  });
}

describe('thin-client server', () => {
  it('GET /health returns ok', async () => {
    var res = await httpRequest('GET', '/health');
    expect(res.status).toBe(200);
    var data = JSON.parse(res.body);
    expect(data.status).toBe('ok');
  });

  it('POST /execute runs code and returns output', async () => {
    var res = await httpRequest('POST', '/execute', {
      code: 'console.log("hello from petey");',
    });
    expect(res.status).toBe(200);
    var data = JSON.parse(res.body);
    expect(data.stdout).toContain('hello from petey');
  });

  it('POST /execute returns errors in stderr', async () => {
    var res = await httpRequest('POST', '/execute', {
      code: 'throw new Error("test error");',
    });
    expect(res.status).toBe(200);
    var data = JSON.parse(res.body);
    expect(data.stderr).toContain('test error');
  });

  it('POST /execute handles empty code', async () => {
    var res = await httpRequest('POST', '/execute', { code: '' });
    expect(res.status).toBe(200);
    var data = JSON.parse(res.body);
    expect(data.stdout).toBe('');
    expect(data.stderr).toBe('');
  });
});
