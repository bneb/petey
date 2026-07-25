/**
 * Generates the ES5 init function passed to the JS-Interpreter constructor.
 * Sets up polyfilled APIs (console, graphics) inside the interpreter's
 * sandbox so user code can call them.
 *
 * @param {string} terminalFieldName
 * @returns {string} ES5 init function body as a string
 */
export function interpreterInitCode(terminalFieldName) {
  return [
    'function(interpreter, scope) {',
    '  // --- console object ---',
    '  var consoleOut = interpreter.createObject(interpreter.OBJECT);',
    '  interpreter.setProperty(scope, "console", consoleOut);',
    '',
    '  var logFunc = interpreter.createNativeFunction(function() {',
    '    var args = Array.prototype.slice.call(arguments);',
    '    var field = _doc.getField("' + terminalFieldName + '");',
    '    if (field) {',
    '      field.value = (field.value || "") + args.join(" ") + "\\n";',
    '    }',
    '  });',
    '  interpreter.setProperty(consoleOut, "log", logFunc);',

    '}',
  ].join('\n');
}

/**
 * Generates the ES5 code that creates an Interpreter, runs user code,
 * and writes output/errors to the terminal field.
 *
 * @param {string} editorFieldName
 * @param {string} terminalFieldName
 * @returns {string} ES5 JavaScript code string
 */
export function runUserCodeFunction(editorFieldName, terminalFieldName) {
  return [
    'function runUserCode() {',
    '  var editor = _doc.getField("' + editorFieldName + '");',
    '  var terminal = _doc.getField("' + terminalFieldName + '");',
    '  if (!editor || !terminal) { return; }',
    '',

    '  terminal.value = "";',
    '',
    '  var code = editor.value;',
    '  if (!code || code.trim() === "") {',
    '    terminal.value = "No code to run.";',
    '    return;',
    '  }',
    '',
    '  try {',
    '    var initFunc = ' + interpreterInitCode(terminalFieldName) + ';',
    '    var interpreter = new Interpreter(code, initFunc);',
    '    interpreter.run();',
    '    if (interpreter.value !== undefined) {',
    '      terminal.value += "=> " + interpreter.value;',
    '    }',
    '  } catch (err) {',
    '    terminal.value = "Error: " + (err.message || err);',
    '  }',
    '}',
  ].join('\n');
}

/**
 * Generates the complete bridge script that wires form fields
 * to the JS-Interpreter runtime.
 *
 * @param {string} editorFieldName
 * @param {string} terminalFieldName
 * @returns {string} ES5 JavaScript code string
 */
export function createInterpreterBridge(editorFieldName, terminalFieldName) {
  return runUserCodeFunction(editorFieldName, terminalFieldName);
}
