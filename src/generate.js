import { writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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

var PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));

/**
 * Reads SOURCE_DATE_EPOCH, the reproducible-builds convention.
 * @returns {Date|null}
 */
function sourceDateEpoch() {
  var raw = String(process.env.SOURCE_DATE_EPOCH || '').trim();
  if (!/^\d+$/.test(raw)) { return null; }
  return new Date(parseInt(raw, 10) * 1000);
}

/**
 * Reads the committer timestamp of HEAD, which is fixed for a given commit.
 * @returns {Date|null}
 */
function gitCommitDate() {
  try {
    var out = execFileSync('git', ['log', '-1', '--format=%ct'], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    var epoch = parseInt(String(out).trim(), 10);
    return isFinite(epoch) && epoch > 0 ? new Date(epoch * 1000) : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the timestamp stamped into the generated PDF.
 *
 * pdf-lib stamps CreationDate and ModDate with the wall-clock time when the
 * document is constructed (updateInfoDict, called from the PDFDocument
 * constructor), so two builds of identical source never matched byte for byte.
 * Pinning the timestamp to a commit-derived value makes releases reproducible:
 * anyone who checks out the tag and rebuilds gets the same bytes.
 *
 * Order: SOURCE_DATE_EPOCH, then the HEAD commit date, then the Unix epoch so
 * an export without git history still builds deterministically.
 *
 * @returns {Date}
 */
export function resolveBuildDate() {
  return sourceDateEpoch() || gitCommitDate() || new Date(0);
}

/**
 * Overrides pdf-lib's wall-clock CreationDate/ModDate with a fixed instant.
 * @param {PDFDocument} doc
 * @param {Date} date
 */
function pinBuildDate(doc, date) {
  doc.setCreationDate(date);
  doc.setModificationDate(date);
}

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
 * @param {string} [outputPath] - defaults to petey.pdf in the CWD
 * @param {boolean} [skipRuntime] - omit the injected runtime (structure tests)
 * @param {Date} [buildDate] - timestamp to stamp; defaults to resolveBuildDate()
 */
export async function generate(outputPath, skipRuntime = false, buildDate = resolveBuildDate()) {
  var doc = await createDocument();
  setMetadata(doc, { title: 'Petey IDE', author: 'Petey', creator: 'petey (pdf-lib)' });
  pinBuildDate(doc, buildDate);
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
