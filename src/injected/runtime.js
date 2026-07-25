import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { allPolyfills } from '../interpreter/polyfills.js';
import { createInterpreterBridge } from '../interpreter/adapter.js';
import { getAlgorithmsCode } from './algorithms.js';
import { fileTreeUpdateScript } from '../ui/filetree.js';
import { connectorScript } from '../thin-client/connector.js';

var __dirname = dirname(fileURLToPath(import.meta.url));



var FIELD_NAMES = {
  editor: 'code_editor',
  terminal: 'terminal_out',
  fileTree: 'file_tree',
  vfs: 'vfs_storage',
};

/**
 * Reads a vendored source file.
 * @param {string} filename
 * @returns {string}
 */
function readVendorFile(filename) {
  return readFileSync(join(__dirname, 'vendor', filename), 'utf-8');
}

/**
 * Generates ES5 polyfills needed by the JS-Interpreter in Acrobat.
 * @returns {string}
 */
function interpreterPolyfills() {
  return [
    'if (typeof Array.from === "undefined") {',
    '  Array.from = function(arr) {',
    '    return Array.prototype.slice.call(arr);',
    '  };',
    '}',
    'if (typeof globalThis === "undefined") {',
    '  var globalThis = this;',
    '}',
    'if (typeof Interpreter !== "undefined" && Interpreter.prototype) {',
    '  Interpreter.prototype["REGEXP_MODE"] = 1;',
    '}',
  ].join('\n');
}

/**
 * Builds the complete runtime JS to be injected into the PDF.
 * @returns {string} Complete ES5 JavaScript runtime as a single string
 */
export function buildRuntime() {

  return [
    '// --- document reference (captured at load time) ---',
    'var _doc = this;',
    '',
    '// --- acorn.js ---',
    readVendorFile('acorn.js'),
    '',
    '// --- interpreter.js ---',
    readVendorFile('interpreter.js'),
    '',
    '// --- environment polyfills ---',
    interpreterPolyfills(),
    '',
    '// --- petey polyfills ---',
    allPolyfills(FIELD_NAMES.terminal),
    '',
    '// --- algorithms definitions ---',
    getAlgorithmsCode(),
    '',
    '// --- interpreter bridge ---',
    createInterpreterBridge(FIELD_NAMES.editor, FIELD_NAMES.terminal),
    '',
    '// --- file tree script ---',
    fileTreeUpdateScript(),
    '',
    '// --- thin-client connector ---',
    connectorScript(),
    '',
    '// --- force appearance generation ---',
    'try { app.runtimeHighlight = false; } catch (e) {}',
    'try {',
    '  var _f1 = _doc.getField("' + FIELD_NAMES.editor + '");',
    '  if (_f1) { ',
    '    var _v1 = _f1.value; _f1.value = " "; _f1.value = _v1; ',
    '  }',
    '  var _f2 = _doc.getField("' + FIELD_NAMES.terminal + '");',
    '  if (_f2) {',
    '    var _v2 = _f2.value; _f2.value = " "; _f2.value = _v2; ',
    '  }',
    '} catch(e) {}',
  ].join('\n');
}

/**
 * Field name constants used in the PDF form.
 */
export function getFieldNames() {
  return {
    editor: FIELD_NAMES.editor,
    terminal: FIELD_NAMES.terminal,
    fileTree: FIELD_NAMES.fileTree,
    vfs: FIELD_NAMES.vfs,
  };
}
