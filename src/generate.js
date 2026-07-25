import { writeFileSync } from 'fs';
import { PDFName, PDFBool, rgb } from 'pdf-lib';
import { createDocument, addPage, setMetadata } from './pdf/document.js';
import { embedMonospaceFont } from './pdf/fonts.js';
import { createTextField, createButton, createListBox } from './pdf/fields.js';
import { calculateLayout, PAGE_WIDTH, PAGE_HEIGHT } from './ui/layout.js';
import { editorFieldConfig } from './ui/editor.js';
import { terminalFieldConfig } from './ui/terminal.js';
import { fileTreeConfig } from './ui/filetree.js';
import { buildRuntime } from './injected/runtime.js';
import { algorithms } from './injected/algorithms.js';
import {
  runButtonAction,
  saveButtonAction,
  newFileButtonAction,
  buildPdfAction,
} from './ui/actions.js';



/**
 * Creates a standard text field for the code editor.
 */
function createEditor(page, font, rect, defaultValue) {
  var config = editorFieldConfig(rect);
  config.defaultValue = defaultValue;
  return createTextField(page, font, config);
}

/**
 * Generates the complete Petey PDF and writes it to disk.
 */
export async function generate(outputPath, skipRuntime = false) {
  var doc = await createDocument();
  setMetadata(doc, { title: 'Petey IDE', author: 'Petey', creator: 'petey (pdf-lib)' });
  var page = addPage(doc, [PAGE_WIDTH, PAGE_HEIGHT]);
  var font = await embedMonospaceFont(doc);
  var layout = calculateLayout(PAGE_WIDTH, PAGE_HEIGHT);
  var demoCode = algorithms['Two Sum'];

  createFields(page, font, layout, demoCode);
  if (!skipRuntime) { doc.addJavaScript('petey_runtime', buildRuntime()); }

  doc.getForm().updateFieldAppearances(font);
  if (!skipRuntime) { enableNeedAppearances(doc); }
  return writePdf(await doc.save(), outputPath);
}

function createFields(page, font, layout, demoCode) {
  createEditor(page, font, layout.editor, demoCode);
  createTextField(page, font, terminalFieldConfig(layout.terminal));
  createListBox(page, font, fileTreeConfig(layout.fileTree, Object.keys(algorithms)));
  var btnStyle = { borderWidth: 1, borderColor: rgb(0.5, 0.5, 0.5), backgroundColor: rgb(0.9, 0.9, 0.9) };
  createButton(page, font, { name: 'run_btn',   label: 'Run',   action: runButtonAction(),   ...layout.runBtn, ...btnStyle });
  createButton(page, font, { name: 'save_btn',  label: 'Save',  action: saveButtonAction(),  ...layout.saveBtn, ...btnStyle });
  createButton(page, font, { name: 'new_btn',   label: 'New',   action: newFileButtonAction(), ...layout.newFileBtn, ...btnStyle });
  createButton(page, font, { name: 'build_btn', label: 'Build', action: buildPdfAction(),    ...layout.buildBtn, ...btnStyle });

  // Hidden VFS storage field
  createTextField(page, font, { 
    name: 'vfs_storage', 
    x: 0, y: 0, width: 0, height: 0, 
    defaultValue: '{}'
  });
}

function enableNeedAppearances(doc) {
  const acroFormRef = doc.catalog.get(PDFName.of('AcroForm'));
  const acroForm = doc.context.lookup(acroFormRef);
  if (acroForm) { acroForm.set(PDFName.of('NeedAppearances'), PDFBool.True); }
}

function writePdf(pdfBytes, outputPath) {
  var output = outputPath || 'petey.pdf';
  writeFileSync(output, pdfBytes);
  console.log('Generated ' + output + ' (' + pdfBytes.length + ' bytes)');
  return pdfBytes;
}

// CLI entry point
var isMain = process.argv[1] &&
  (process.argv[1].endsWith('generate.js') || process.argv[1].endsWith('generate'));

if (isMain) {
  generate().catch(function (err) {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  });
}
