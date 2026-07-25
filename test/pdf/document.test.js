import { describe, it, expect } from 'vitest';
import { createDocument, addPage, setMetadata } from '../../src/pdf/document.js';

describe('createDocument', () => {
  it('returns a PDFDocument instance', async () => {
    const doc = await createDocument();
    expect(doc).toBeDefined();
    expect(typeof doc.addPage).toBe('function');
  });
});

describe('addPage', () => {
  it('adds a page with the given dimensions', async () => {
    const doc = await createDocument();
    const page = addPage(doc, [800, 600]);
    expect(page).toBeDefined();
    expect(doc.getPageCount()).toBe(1);
  });

  it('returns a page with the correct size', async () => {
    const doc = await createDocument();
    const page = addPage(doc, [1024, 768]);
    const { width, height } = page.getSize();
    expect(width).toBe(1024);
    expect(height).toBe(768);
  });
});

describe('setMetadata', () => {
  it('sets title, author, and creator', async () => {
    const doc = await createDocument();
    setMetadata(doc, {
      title: 'Test PDF',
      author: 'Petey',
      creator: 'pdf-lib',
    });
    expect(doc.getTitle()).toBe('Test PDF');
    expect(doc.getAuthor()).toBe('Petey');
    expect(doc.getCreator()).toBe('pdf-lib');
  });
});
