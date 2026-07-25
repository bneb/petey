import { describe, it, expect } from 'vitest';
import { editorFieldConfig } from '../../src/ui/editor.js';

describe('editorFieldConfig', () => {
  it('returns multiline text field config', () => {
    const rect = { x: 100, y: 200, width: 400, height: 300 };
    const config = editorFieldConfig(rect);
    expect(config.name).toBe('code_editor');
    expect(config.multiline).toBe(true);
    expect(config.x).toBe(100);
    expect(config.y).toBe(200);
    expect(config.width).toBe(400);
    expect(config.height).toBe(300);
    expect(config.fontSize).toBeGreaterThan(0);
  });
});
