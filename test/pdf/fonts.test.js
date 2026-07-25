import { describe, it, expect } from 'vitest';
import { embedMonospaceFont, fontRef } from '../../src/pdf/fonts.js';
import { createDocument } from '../../src/pdf/document.js';

describe('embedMonospaceFont', () => {
  it('embeds a font and returns it', async () => {
    const doc = await createDocument();
    const font = await embedMonospaceFont(doc);
    expect(font).toBeDefined();
    expect(fontRef()).toBe(font);
  });

  it('embeds Courier (monospace)', async () => {
    const doc = await createDocument();
    const font = await embedMonospaceFont(doc);
    expect(font.name).toContain('Courier');
  });
});
