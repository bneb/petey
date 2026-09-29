import { getFieldNames } from '../injected/runtime.js';

/**
 * Returns the configuration for the code editor text field.
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @returns {{ name: string, x: number, y: number, width: number, height: number, multiline: true, fontSize: number }}
 */
export function editorFieldConfig(rect) {
  var names = getFieldNames();
  return {
    name: names.editor,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    multiline: true,
    fontSize: 10,
    borderWidth: 1,
  };
}
