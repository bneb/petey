import { describe, it, expect } from 'vitest';
import { terminalFieldConfig } from '../../src/ui/terminal.js';

describe('terminalFieldConfig', () => {
  it('returns readonly multiline field config', () => {
    const rect = { x: 100, y: 50, width: 400, height: 150 };
    const config = terminalFieldConfig(rect);
    expect(config.name).toBe('terminal_out');
    expect(config.readonly).toBe(true);
    expect(config.multiline).toBe(true);
    expect(config.x).toBe(100);
    expect(config.y).toBe(50);
    expect(config.width).toBe(400);
    expect(config.height).toBe(150);
  });
});
