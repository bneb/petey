import { describe, it, expect } from 'vitest';
import {
  consoleLogPolyfill,
  fsReadPolyfill,
  fsWritePolyfill,
  setTimeoutPolyfill,
  allPolyfills,
} from '../../src/interpreter/polyfills.js';

const ES6_PATTERNS = [
  { name: 'const declaration', pattern: /\bconst\s+\w+\s*=/ },
  { name: 'let declaration', pattern: /\blet\s+\w+\s*=/ },
  { name: 'arrow function', pattern: /=>/ },
  { name: 'template literal', pattern: /`/ },
  { name: 'class declaration', pattern: /\bclass\s+/ },
];

function assertES5(code, label) {
  for (const { name, pattern } of ES6_PATTERNS) {
    if (pattern.test(code)) {
      return { valid: false, reason: `${label} contains ES6+ syntax: ${name}` };
    }
  }
  return { valid: true };
}

describe('consoleLogPolyfill', () => {
  it('generates code with the correct terminal field name', () => {
    const code = consoleLogPolyfill('test_term');
    expect(code).toContain('getField("test_term")');
    expect(code).toMatch(/console\.log\s*=\s*function/);
  });

  it('generates valid ES5 code', () => {
    const result = assertES5(consoleLogPolyfill('term'), 'consoleLogPolyfill');
    expect(result.valid).toBe(true);
  });
});

describe('fsReadPolyfill', () => {
  it('generates code with getDataObjectContents', () => {
    const code = fsReadPolyfill();
    expect(code).toContain('getDataObjectContents');
    expect(code).toContain('fs.readFile');
  });

  it('generates valid ES5 code', () => {
    const result = assertES5(fsReadPolyfill(), 'fsReadPolyfill');
    expect(result.valid).toBe(true);
  });
});

describe('fsWritePolyfill', () => {
  it('generates code with createDataObject', () => {
    const code = fsWritePolyfill();
    expect(code).toContain('createDataObject');
    expect(code).toContain('fs.writeFile');
  });

  it('generates valid ES5 code', () => {
    const result = assertES5(fsWritePolyfill(), 'fsWritePolyfill');
    expect(result.valid).toBe(true);
  });
});

describe('setTimeoutPolyfill', () => {
  it('generates a synchronous stub', () => {
    const code = setTimeoutPolyfill();
    expect(code).toContain('setTimeout');
    expect(code).toContain('fn()');
  });

  it('generates valid ES5 code', () => {
    const result = assertES5(setTimeoutPolyfill(), 'setTimeoutPolyfill');
    expect(result.valid).toBe(true);
  });
});

describe('allPolyfills', () => {
  it('combines all polyfills with the given terminal name', () => {
    const code = allPolyfills('term_out');
    expect(code).toContain('term_out');
    expect(code).toMatch(/console\.log\s*=\s*function/);
    expect(code).toContain('fs.readFile');
    expect(code).toContain('fs.writeFile');
    expect(code).toContain('setTimeout');
  });

  it('generates valid ES5 code', () => {
    const result = assertES5(allPolyfills('t'), 'allPolyfills');
    expect(result.valid).toBe(true);
  });
});
