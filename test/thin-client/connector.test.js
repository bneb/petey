import { describe, it, expect } from 'vitest';
import { connectorScript } from '../../src/thin-client/connector.js';

describe('connectorScript', () => {
  it('generates code referencing editor and terminal fields', () => {
    const code = connectorScript();
    expect(code).toContain('code_editor');
    expect(code).toContain('terminal_out');
  });

  it('includes Net.HTTP.request call', () => {
    const code = connectorScript();
    expect(code).toContain('Net.HTTP.request');
    expect(code).toContain('localhost:3099');
  });

  it('falls back to embedded interpreter on error', () => {
    const code = connectorScript();
    expect(code).toContain('runUserCode()');
    expect(code).toContain('Server unavailable');
  });

  it('generates valid ES5', () => {
    const code = connectorScript();
    // Must not contain ES6+ syntax
    expect(code).not.toMatch(/\bconst\s+\w+\s*=/);
    expect(code).not.toMatch(/\blet\s+\w+\s*=/);
    expect(code).not.toMatch(/`/);
  });
});
