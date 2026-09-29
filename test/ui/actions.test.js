import { describe, it, expect } from 'vitest';
import {
  runButtonAction,
  saveButtonAction,
  newFileButtonAction,
  buildPdfAction,
} from '../../src/ui/actions.js';
import { fileTreeConfig, fileTreeUpdateScript } from '../../src/ui/filetree.js';
import { getFieldNames } from '../../src/injected/runtime.js';

/**
 * Every Acrobat action script produced by the generators, keyed by origin.
 * These strings are injected verbatim into the PDF and evaluated by Acrobat's
 * JS engine — they never run in Node, so nothing here can be caught at runtime.
 */
function generatedScripts() {
  return {
    runButtonAction: runButtonAction(),
    saveButtonAction: saveButtonAction(),
    newFileButtonAction: newFileButtonAction(),
    buildPdfAction: buildPdfAction(),
    fileTreeUpdateScript: fileTreeUpdateScript(),
    fileTreeConfigAction: fileTreeConfig({ x: 0, y: 0, width: 10, height: 10 }, []).action,
  };
}

/**
 * Identifiers that exist only in the Node-side generator module scope.
 * If one of these appears in generated output, the generator interpolated its
 * own variable instead of that variable's value, and Acrobat will throw
 * ReferenceError at click time.
 */
var NODE_ONLY_SYMBOLS = ['names', 'FIELD_NAMES', 'getFieldNames', 'module', 'exports'];

describe('generated Acrobat action scripts', () => {
  it('every generated script parses as valid JavaScript', () => {
    var scripts = generatedScripts();
    Object.keys(scripts).forEach(function (key) {
      expect(function () { return new Function(scripts[key]); }, key).not.toThrow();
    });
  });

  it('every getField() call is passed a string literal', () => {
    var scripts = generatedScripts();
    var total = 0;
    Object.keys(scripts).forEach(function (key) {
      var calls = scripts[key].match(/getField\(\s*([^)]*?)\s*\)/g) || [];
      total += calls.length;
      calls.forEach(function (call) {
        var arg = call.replace(/^getField\(\s*/, '').replace(/\s*\)$/, '');
        expect(arg, key + ' -> ' + call).toMatch(/^"[^"]*"$/);
      });
    });
    // buildPdfAction is a deliberate stub, so don't require a call per script.
    expect(total).toBeGreaterThan(0);
  });

  it('never leaks Node-side generator identifiers into generated output', () => {
    var scripts = generatedScripts();
    Object.keys(scripts).forEach(function (key) {
      NODE_ONLY_SYMBOLS.forEach(function (symbol) {
        var pattern = new RegExp('\\b' + symbol + '\\b');
        expect(pattern.test(scripts[key]), key + ' leaked "' + symbol + '"').toBe(false);
      });
    });
  });

  it('references the real PDF field names', () => {
    var names = getFieldNames();
    expect(saveButtonAction()).toContain('getField("' + names.vfs + '")');
    expect(newFileButtonAction()).toContain('getField("' + names.vfs + '")');
    expect(fileTreeUpdateScript()).toContain('getField("' + names.vfs + '")');
    expect(fileTreeConfig({ x: 0, y: 0, width: 10, height: 10 }, []).action)
      .toContain('getField("' + names.vfs + '")');
  });

  it('VFS round-trips through a JSON object in the hidden storage field', () => {
    // Save writes encodeURIComponent'd keys/values into a JSON blob...
    expect(saveButtonAction()).toContain('encodeURIComponent(filename)');
    expect(saveButtonAction()).toContain('encodeURIComponent(editor.value)');
    // ...and the tree loader decodes them back out of the same field.
    expect(fileTreeConfig({ x: 0, y: 0, width: 10, height: 10 }, []).action)
      .toContain('decodeURIComponent(vfs[key])');
  });
});
