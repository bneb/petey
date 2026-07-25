import { describe, it, expect } from 'vitest';
import { calculateLayout, PAGE_WIDTH, PAGE_HEIGHT } from '../../src/ui/layout.js';

describe('calculateLayout', () => {
  it('returns positions for all UI elements including canvas and build btn', function () {
    var layout = calculateLayout(PAGE_WIDTH, PAGE_HEIGHT);
    var elements = ['fileTree', 'editor', 'terminal',
      'runBtn', 'saveBtn', 'newFileBtn', 'buildBtn'];
    for (var i = 0; i < elements.length; i++) {
      expect(layout[elements[i]], elements[i]).toBeDefined();
    }
  });

  it('keeps all elements within page bounds', function () {
    var layout = calculateLayout(PAGE_WIDTH, PAGE_HEIGHT);
    var elements = [
      layout.fileTree, layout.editor, layout.terminal,
      layout.runBtn, layout.saveBtn, layout.newFileBtn,
      layout.buildBtn,
    ];
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      expect(el.x + el.width).toBeLessThanOrEqual(PAGE_WIDTH);
      expect(el.y + el.height).toBeLessThanOrEqual(PAGE_HEIGHT);
      expect(el.x).toBeGreaterThanOrEqual(0);
      expect(el.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('has no overlapping between editor and terminal', function () {
    var layout = calculateLayout(PAGE_WIDTH, PAGE_HEIGHT);
    var editorBottom = layout.editor.y;
    var terminalTop = layout.terminal.y + layout.terminal.height;
    expect(terminalTop).toBeLessThanOrEqual(editorBottom);
  });

  it('has file tree on the left of editor', function () {
    var layout = calculateLayout(PAGE_WIDTH, PAGE_HEIGHT);
    var fileTreeRight = layout.fileTree.x + layout.fileTree.width;
    expect(fileTreeRight).toBeLessThanOrEqual(layout.editor.x);
  });
});
