import { describe, it, expect } from 'vitest';
import { createDocument, addPage } from '../../src/pdf/document.js';
import { embedMonospaceFont } from '../../src/pdf/fonts.js';
import { createTextField, createButton, createListBox } from '../../src/pdf/fields.js';

async function setup() {
  const doc = await createDocument();
  const page = addPage(doc, [800, 600]);
  const font = await embedMonospaceFont(doc);
  return { doc, page, font };
}

describe('createTextField', () => {
  it('creates a text field with the given name', async () => {
    const { page, font } = await setup();
    const field = createTextField(page, font, {
      name: 'code_editor',
      x: 50, y: 100, width: 700, height: 400,
    });
    expect(field).toBeDefined();
    expect(field.getName()).toBe('code_editor');
  });

  it('enables multiline when config.multiline is true', async () => {
    const { page, font } = await setup();
    const field = createTextField(page, font, {
      name: 'editor',
      x: 50, y: 100, width: 700, height: 400,
      multiline: true,
    });
    expect(field.isMultiline()).toBe(true);
  });

  it('enables readonly when config.readonly is true', async () => {
    const { page, font } = await setup();
    const field = createTextField(page, font, {
      name: 'terminal',
      x: 50, y: 50, width: 700, height: 40,
      readonly: true,
    });
    expect(field.isReadOnly()).toBe(true);
  });

  it('sets default value when provided', async () => {
    const { page, font } = await setup();
    const field = createTextField(page, font, {
      name: 'editor',
      x: 50, y: 100, width: 700, height: 400,
      defaultValue: 'console.log("hi");',
    });
    expect(field.getText()).toBe('console.log("hi");');
  });
});

describe('createButton', () => {
  it('creates a button with the given name', async () => {
    const { page, font } = await setup();
    const button = createButton(page, font, {
      name: 'run_btn',
      x: 600, y: 10, width: 80, height: 30,
      label: 'Run',
    });
    expect(button).toBeDefined();
    expect(button.getName()).toBe('run_btn');
  });
});

describe('createListBox', () => {
  it('creates a list box with the given items', async () => {
    const { page, font } = await setup();
    const listBox = createListBox(page, font, {
      name: 'file_tree',
      x: 0, y: 0, width: 200, height: 600,
      items: ['main.js', 'README.md'],
    });
    expect(listBox).toBeDefined();
    expect(listBox.getName()).toBe('file_tree');
  });
});
