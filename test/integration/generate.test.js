import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { generate } from '../../src/generate.js';

describe('PDF generation', () => {
  it('produces a valid PDF with the correct structure', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(undefined, true);
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
    var pdfBytes = await generate(undefined, true);
    var doc = await PDFDocument.load(pdfBytes);
    var editor = doc.getForm().getTextField('code_editor');
    expect(editor).toBeDefined();
    expect(editor.isMultiline()).toBe(true);
  });

  it('terminal field is readonly', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(undefined, true);
    var doc = await PDFDocument.load(pdfBytes);
    var terminal = doc.getForm().getTextField('terminal_out');
    expect(terminal).toBeDefined();
    expect(terminal.isReadOnly()).toBe(true);
  });

  it('includes all action buttons including Build', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(undefined, true);
    var doc = await PDFDocument.load(pdfBytes);
    var form = doc.getForm();

    var buttons = ['run_btn', 'save_btn', 'new_btn', 'build_btn'];
    for (var i = 0; i < buttons.length; i++) {
      var btn = form.getButton(buttons[i]);
      expect(btn, buttons[i] + ' should exist').toBeDefined();
    }
  });

  it('contains the demo script in the editor', { timeout: 60000 }, async function () {
    var pdfBytes = await generate(undefined, true);
    var doc = await PDFDocument.load(pdfBytes);
    var editor = doc.getForm().getTextField('code_editor');
    var text = editor.getText();
    expect(text).toContain('function twoSum');
  });
});
