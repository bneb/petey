import { getFieldNames } from '../injected/runtime.js';
import { rgb } from 'pdf-lib';

/**
 * Returns the configuration for the file tree list box.
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @param {string[]} [items] - initial file list
 * @returns {{ name: string, x: number, y: number, width: number, height: number, items: string[] }}
 */
export function fileTreeConfig(rect, items) {
  var names = getFieldNames();
  return {
    name: names.fileTree,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    items: items || [],
    borderWidth: 1,
    action: [
      'if (event.value && typeof _algorithms !== "undefined") {',
      '  var editor = this.getField("' + names.editor + '");',
      '  var terminal = this.getField("' + names.terminal + '");',
      '  if (editor) {',
      '    if (_algorithms[event.value]) {',
      '      editor.value = " "; editor.value = _algorithms[event.value];',
      '    } else {',
      '      try {',
      '        var vfsField = this.getField(names.vfs);',
      '        if (vfsField && vfsField.value) {',
      '          var vfs = eval("(" + vfsField.value + ")");',
      '          var key = encodeURIComponent(event.value);',
      '          if (vfs[key]) { editor.value = " "; editor.value = decodeURIComponent(vfs[key]); }',
      '        }',
      '      } catch (e) {}',
      '    }',
      '  }',
      '  if (terminal) { terminal.value = " "; terminal.value = ""; }',
      '}'
    ].join('\n'),
  };
}

/**
 * Script injected globally to refresh the file tree items.
 * Merges hardcoded _algorithms and dynamic _doc.getDataObject() attachments.
 * @returns {string}
 */
export function fileTreeUpdateScript() {
  var names = getFieldNames();
  return [
    'function refreshFileTree() {',
    '  var field = _doc.getField("' + names.fileTree + '");',
    '  if (!field) { return; }',
    '  var arr = [];',
    '  if (typeof _algorithms !== "undefined") {',
    '    for (var key in _algorithms) { arr.push(key); }',
    '  }',
    '  try {',
    '    var vfsField = _doc.getField(names.vfs);',
    '    if (vfsField && vfsField.value) {',
    '      var vfs = eval("(" + vfsField.value + ")");',
    '      for (var k in vfs) { arr.push(decodeURIComponent(k)); }',
    '    }',
    '  } catch (e) {}',
    '  field.setItems(arr);',
    '}'
  ].join('\n');
}


