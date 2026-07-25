/**
 * Embeds a file in the document's /EmbeddedFiles name tree.
 * @param {PDFDocument} doc
 * @param {string} filename
 * @param {string|Uint8Array} data
 */
export async function createAttachment(doc, filename, data) {
  await doc.attach(data, filename);
}

/**
 * Lists all embedded file names.
 * Note: pdf-lib does not have a direct API to list attachments,
 * so this inspects the document catalog's Names tree.
 * @param {PDFDocument} doc
 * @returns {string[]}
 */
export function listAttachments(doc) {
  const catalog = doc.catalog;
  if (!catalog) { return []; }
  try {
    return _extractNames(catalog);
  } catch {
    return [];
  }
}

function _extractNames(catalog) {
  const names = catalog.lookupMaybe('Names');
  if (!names) { return []; }
  const embedded = names.lookupMaybe('EmbeddedFiles');
  if (!embedded) { return []; }
  const namesArr = embedded.lookupMaybe('Names');
  if (!namesArr || !Array.isArray(namesArr)) { return []; }
  const result = [];
  for (let i = 0; i < namesArr.length; i += 2) {
    result.push(namesArr[i].string || namesArr[i]);
  }
  return result;
}

/**
 * Seeds the document with default project files.
 * @param {PDFDocument} doc
 */
export async function seedProjectFiles(doc) {
  await createAttachment(doc, 'main.js',
    'console.log("Hello from Petey!");\n');
  await createAttachment(doc, 'README.txt',
    'Petey IDE - A self-contained development environment in a PDF.\n');
}
