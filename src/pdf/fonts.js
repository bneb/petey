import { StandardFonts } from 'pdf-lib';

let _fontRef = null;

/**
 * Embeds Courier (monospace) font in the document.
 * Must be called before fontRef().
 * @param {PDFDocument} doc
 * @returns {Promise<PDFFont>}
 */
export async function embedMonospaceFont(doc) {
  _fontRef = await doc.embedFont(StandardFonts.Courier);
  return _fontRef;
}

/**
 * Returns the embedded monospace font reference.
 * @returns {PDFFont}
 */
export function fontRef() {
  return _fontRef;
}
