/**
 * Generates ES5 code that polyfills console.log to write to a PDF form field.
 * Acrobat's JS environment has a global `console` object, but we redirect it
 * to the terminal field so users see output in the IDE.
 *
 * @param {string} terminalFieldName - name of the terminal /Tx field
 * @returns {string} ES5 JavaScript code string
 */
export function consoleLogPolyfill(terminalFieldName) {
  return [
    'if (typeof console === "undefined") { var console = {}; }',
    'var _peteyConsolePrintln = console.println;',
    'console.log = function() {',
    '  var field = _doc.getField("' + terminalFieldName + '");',
    '  var args = Array.prototype.slice.call(arguments);',
    '  var text = args.join(" ") + "\\n";',
    '  if (field) {',
    '    field.value = (field.value || "") + text;',
    '  }',
    '  if (_peteyConsolePrintln) { _peteyConsolePrintln.call(console, text); }',
    '};',
  ].join('\n');
}

/**
 * Generates ES5 code that provides a virtual fs.readFile using Doc.attachments.
 * @returns {string} ES5 JavaScript code string
 */
export function fsReadPolyfill() {
  return [
    'var fs = fs || {};',
    'fs.readFile = function(filename) {',
    '  try {',
    '    var data = _doc.getDataObjectContents(filename);',
    '    return util.stringFromStream(data);',
    '  } catch (e) {',
    '    throw new Error("File not found: " + filename);',
    '  }',
    '};',
  ].join('\n');
}

/**
 * Generates ES5 code that provides a virtual fs.writeFile using Doc.attachments.
 * @returns {string} ES5 JavaScript code string
 */
export function fsWritePolyfill() {
  return [
    'fs.writeFile = function(filename, content) {',
    '  var stream = util.streamFromString(content);',
    '  _doc.createDataObject(filename, stream);',
    '};',
  ].join('\n');
}

/**
 * Generates a setTimeout stub (Acrobat has no event loop).
 * @returns {string} ES5 JavaScript code string
 */
export function setTimeoutPolyfill() {
  return [
    'var setTimeout = function(fn, delay) {',
    '  fn();',
    '};',
  ].join('\n');
}

/**
 * Generates all polyfills as a single ES5 code block.
 * @param {string} terminalFieldName
 * @returns {string}
 */
export function allPolyfills(terminalFieldName) {
  return [
    consoleLogPolyfill(terminalFieldName),
    fsReadPolyfill(),
    fsWritePolyfill(),
    setTimeoutPolyfill(),
  ].join('\n\n');
}
