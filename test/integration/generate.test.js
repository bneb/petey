import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { generate } from '../../src/generate.js';
import { buildRuntime } from '../../src/injected/runtime.js';
import { getFieldNames } from '../../src/injected/runtime.js';

/**
 * Generated PDFs are written to a scratch directory, never to the repo root.
 * `generate()` defaults its output path to `petey.pdf` in the CWD, which is
 * also the gitignored build artifact — writing there from a test would
 * silently overwrite the real build with a runtime-less stub.
 */
var tmpDir;
var stubPath;

beforeAll(function () {
  tmpDir = mkdtempSync(join(tmpdir(), 'petey-test-'));
  stubPath = join(tmpDir, 'petey.pdf');
});

afterAll(function () {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('PDF generation', () => {
  it('produces a valid PDF with the correct structure', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(stubPath, true);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    var doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toBe('Petey IDE');
    expect(doc.getAuthor()).toBe('Petey');

    var form = doc.getForm();
    var fields = form.getFields();
    expect(fields.length).toBeGreaterThanOrEqual(4);

    var fieldNames = fields.map(function (f) { return f.getName(); });
    expect(fieldNames).toContain('code_editor');
    expect(fieldNames).toContain('terminal_out');
    expect(fieldNames).toContain('file_tree');
  });

  it('code editor field is multiline', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(stubPath, true);
    var doc = await PDFDocument.load(pdfBytes);
    var editor = doc.getForm().getTextField('code_editor');
    expect(editor).toBeDefined();
    expect(editor.isMultiline()).toBe(true);
  });

  it('terminal field is readonly', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(stubPath, true);
    var doc = await PDFDocument.load(pdfBytes);
    var terminal = doc.getForm().getTextField('terminal_out');
    expect(terminal).toBeDefined();
    expect(terminal.isReadOnly()).toBe(true);
  });

  it('includes all action buttons including Build', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(stubPath, true);
    var doc = await PDFDocument.load(pdfBytes);
    var form = doc.getForm();

    var buttons = ['run_btn', 'save_btn', 'new_btn', 'build_btn'];
    for (var i = 0; i < buttons.length; i++) {
      var btn = form.getButton(buttons[i]);
      expect(btn, buttons[i] + ' should exist').toBeDefined();
    }
  });

  it('contains the demo script in the editor', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(stubPath, true);
    var doc = await PDFDocument.load(pdfBytes);
    var editor = doc.getForm().getTextField('code_editor');
    var text = editor.getText();
    expect(text).toContain('function twoSum');
  });

  it('includes the hidden VFS storage field', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(stubPath, true);
    var doc = await PDFDocument.load(pdfBytes);
    var vfs = doc.getForm().getTextField(getFieldNames().vfs);
    expect(vfs).toBeDefined();
    expect(vfs.getText()).toBe('{}');
  });

  it('embeds the runtime when skipRuntime is false', { timeout: 60000 }, async function () {
    var stubBytes = await generate(stubPath, true);
    var fullBytes = await generate(join(tmpDir, 'petey-full.pdf'), false);
    // The runtime is the bulk of the document; a stub without it is tiny.
    expect(fullBytes.length).toBeGreaterThan(stubBytes.length * 5);
  });
});

describe('injected runtime', () => {
  it('is valid JavaScript that Acrobat can evaluate', function () {
    expect(function () { return new Function(buildRuntime()); }).not.toThrow();
  });

  it('passes every getField() call a string literal', function () {
    // The bug this guards: a generator interpolating its own module-scope
    // variable (e.g. `getField(names.vfs)`) into the injected string, which
    // throws ReferenceError inside Acrobat and silently kills the VFS.
    var calls = buildRuntime().match(/getField\(\s*[^)]*?\)/g) || [];
    expect(calls.length).toBeGreaterThan(0);
    calls.forEach(function (call) {
      var arg = call.replace(/^getField\(\s*/, '').replace(/\s*\)$/, '');
      expect(arg, call).toMatch(/^"[^"]*"$/);
    });
  });

  it('wires the bridge to the form field names used by the UI', function () {
    var runtime = buildRuntime();
    var names = getFieldNames();
    expect(runtime).toContain('_doc.getField("' + names.editor + '")');
    expect(runtime).toContain('_doc.getField("' + names.terminal + '")');
    expect(runtime).toContain('_doc.getField("' + names.vfs + '")');
  });

  it('exposes the algorithm library and refresh entry point', function () {
    var runtime = buildRuntime();
    expect(runtime).toContain('var _algorithms = {}');
    expect(runtime).toContain('function refreshFileTree()');
  });
});
