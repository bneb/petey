import { getFieldNames } from '../injected/runtime.js';

var names = getFieldNames();

/**
 * Generates ES5 action code for the Run button.
 * @returns {string}
 */
export function runButtonAction() {
  return [
    'var term = this.getField("' + names.terminal + '");',
    'if (term) { term.value = " "; term.value = ""; } // Clear terminal',
    'if (typeof runUserCode === "function") { runUserCode(); }'
  ].join('\n');
}

/**
 * Generates ES5 action code for the Save button.
 * @returns {string}
 */
export function saveButtonAction() {
  return [
    'var editor = this.getField("' + names.editor + '");',
    'var tree = this.getField("' + names.fileTree + '");',
    'if (!editor || !tree || !tree.currentValueIndices) { return; }',
    'var filename = tree.getItemAt(tree.currentValueIndices[0]);',
    'if (!filename) { return; }',
    'if (typeof _algorithms !== "undefined" && _algorithms[filename]) {',
    '  app.alert("Cannot overwrite built-in algorithms.");',
    '  return;',
    '}',
    'try {',
    '  var vfsField = this.getField(names.vfs);',
    '  var vfs = {};',
    '  if (vfsField && vfsField.value) { vfs = eval("(" + vfsField.value + ")"); }',
    '  var key = encodeURIComponent(filename);',
    '  vfs[key] = encodeURIComponent(editor.value);',
    '  var str = "{"; var first = true;',
    '  for (var k in vfs) {',
    '    if (!first) str += ",";',
    '    str += "\\"" + k + "\\":\\"" + vfs[k] + "\\"";',
    '    first = false;',
    '  }',
    '  str += "}";',
    '  if (vfsField) { vfsField.value = str; }',
    '  if (typeof refreshFileTree === "function") { refreshFileTree(); }',
    '  app.alert("Saved successfully!");',
    '} catch (e) {',
    '  app.alert("Failed to save: " + e);',
    '}'
  ].join('\n');
}

/**
 * Generates ES5 action code for the Clear button.
 * @returns {string}
 */
export function newFileButtonAction() {
  return [
    'var name = app.response({',
    '  cQuestion: "Enter file name:",',
    '  cTitle: "New File"',
    '});',
    'if (name) {',
    '  try {',
    '    var vfsField = this.getField(names.vfs);',
    '    var vfs = {};',
    '    if (vfsField && vfsField.value) { vfs = eval("(" + vfsField.value + ")"); }',
    '    var key = encodeURIComponent(name);',
    '    vfs[key] = encodeURIComponent("// Write new code here...\\n");',
    '    var str = "{"; var first = true;',
    '    for (var k in vfs) {',
    '      if (!first) str += ",";',
    '      str += "\\"" + k + "\\":\\"" + vfs[k] + "\\"";',
    '      first = false;',
    '    }',
    '    str += "}";',
    '    if (vfsField) { vfsField.value = str; }',
    '    if (typeof refreshFileTree === "function") { refreshFileTree(); }',
    '    var tree = this.getField(names.fileTree);',
    '    if (tree) { tree.value = name; }',
    '    var editor = this.getField(names.editor);',
    '    if (editor) { editor.value = " "; editor.value = "// Write new code here...\\n"; }',
    '  } catch (e) {',
    '    app.alert("Error creating file: " + e);',
    '  }',
    '}'
  ].join('\n');
}

/**
 * Generates ES5 action code for the Build PDF button.
 * @returns {string}
 */
export function buildPdfAction() {
  return [
    'app.alert("Self-build feature disabled in LeetCode demo mode.");'
  ].join('\n');
}
