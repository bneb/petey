import { createServer } from 'http';
import vm from 'vm';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const PORT = 3099;

/**
 * Executes JavaScript code in a sandboxed Node VM and returns the result.
 * @param {string} code
 * @returns {{ stdout: string, stderr: string }}
 */
function createSandbox(out) {
  return {
    console: {
      log: function () { out.stdout += Array.prototype.slice.call(arguments).join(' ') + '\n'; },
      error: function () { out.stderr += Array.prototype.slice.call(arguments).join(' ') + '\n'; },
    },
    require: function (mod) { return require(mod); },
  };
}

function runInSandbox(code, sandbox, out) {
  try {
    var context = vm.createContext(sandbox);
    new vm.Script(code, { timeout: 5000 }).runInContext(context);
  } catch (err) {
    out.stderr += err.message || String(err);
  }
}

function executeCode(code) {
  var out = { stdout: '', stderr: '' };
  runInSandbox(code, createSandbox(out), out);
  return out;
}

function handleExecute(body) {
  try {
    var data = JSON.parse(body);
    return { status: 200, body: executeCode(data.code || '') };
  } catch (e) {
    return { status: 400, body: { error: e.message } };
  }
}

export function startServer(port) {
  var listenPort = port || PORT;
  var server = createServer(handleRequest);
  return new Promise(function (resolve) {
    server.listen(listenPort, function () {
      console.log('Petey thin-client server listening on port ' + listenPort);
      resolve(server);
    });
  });
}

function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { return endReq(res, 204); }
  if (req.method === 'GET' && req.url === '/health') { return endJson(res, 200, { status: 'ok' }); }
  if (req.method === 'POST' && req.url === '/execute') { return handlePost(req, res); }
  endReq(res, 404, 'Not found');
}

function handlePost(req, res) {
  var body = '';
  req.on('data', function (c) { body += c; });
  req.on('end', function () {
    var r = handleExecute(body);
    endJson(res, r.status, r.body);
  });
}

function endReq(res, status, body) {
  res.writeHead(status);
  res.end(body || '');
}

function endJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// Run when executed directly
const isMain = process.argv[1] &&
  (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));

if (isMain) {
  startServer().catch(function (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
