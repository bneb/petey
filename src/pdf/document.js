import { PDFDocument } from 'pdf-lib';

/**
 * Creates a new PDF document with default settings.
 * @returns {Promise<PDFDocument>}
 */
export async function createDocument() {
  return PDFDocument.create();
}

/**
 * Adds a page to the document with the given dimensions.
 * @param {PDFDocument} doc
 * @param {[number, number]} size - [width, height]
 * @returns {PDFPage}
 */
export function addPage(doc, size) {
  return doc.addPage(size);
}

/**
 * Sets document metadata.
 * @param {PDFDocument} doc
 * @param {{ title: string, author: string, creator: string }} info
 */
export function setMetadata(doc, info) {
  doc.setTitle(info.title);
  doc.setAuthor(info.author);
  doc.setCreator(info.creator);
}
