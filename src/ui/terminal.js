import { getFieldNames } from '../injected/runtime.js';
import { rgb } from 'pdf-lib';

/**
 * Returns the configuration for the terminal output text field.
 * Read-only, black background, green text aesthetic.
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @returns {{ name: string, x: number, y: number, width: number, height: number, multiline: true, readonly: true, fontSize: number }}
 */
export function terminalFieldConfig(rect) {
  var names = getFieldNames();
  return {
    name: names.terminal,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    multiline: true,
    readonly: true,
    fontSize: 10,
    borderWidth: 1,
  };
}
