import { getFieldNames } from '../injected/runtime.js';

/**
 * Generates ES5 code that sends editor content to localhost server
 * and writes the response to the terminal field.
 * Uses Acrobat's Net.HTTP API. Falls back to embedded interpreter
 * if the server is unreachable.
 *
 * @returns {string} ES5 JavaScript code string
 */
export function connectorScript() {
  var names = getFieldNames();
  return [
    'function runOnServer() {',
    '  var editor = _doc.getField("' + names.editor + '");',
    '  var terminal = _doc.getField("' + names.terminal + '");',
    '  if (!editor || !terminal) { return; }',
    '',
    '  var code = editor.value;',
    '  if (!code || code.trim() === "") {',
    '    terminal.value = "No code to run.";',
    '    return;',
    '  }',
    '',
    '  terminal.value = "Connecting to server...";',
    '  try {',
    '    var req = Net.HTTP.request({',
    '      cURL: "http://localhost:3099/execute",',
    '      cMethod: "POST",',
    '      cContentType: "application/json",',
    '      oRequest: JSON.stringify({ code: code }),',
    '    });',
    '    var response = req.response();',
    '    var result = JSON.parse(response);',
    '    if (result.stdout) {',
    '      terminal.value = result.stdout;',
    '    }',
    '    if (result.stderr) {',
    '      terminal.value += "\\n[stderr]\\n" + result.stderr;',
    '    }',
    '    if (result.error) {',
    '      terminal.value = "Server error: " + result.error;',
    '    }',
    '  } catch (err) {',
    '    terminal.value = "Server unavailable. Falling back to embedded interpreter.\\n\\n";',
    '    runUserCode();',
    '  }',
    '}',
  ].join('\n');
}
