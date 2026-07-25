import { describe, it, expect } from 'vitest';
import { fileTreeConfig, fileTreeUpdateScript } from '../../src/ui/filetree.js';

describe('filetree UI', () => {
  it('generates a file tree config with action', () => {
    var config = fileTreeConfig({ x: 0, y: 0, width: 100, height: 100 });
    expect(config.action).toContain('vfsField');
  });

  it('generates the update script', () => {
    var script = fileTreeUpdateScript();
    expect(script).toContain('refreshFileTree');
  });
});
