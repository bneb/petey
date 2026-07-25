import { PDFName, PDFHexString } from 'pdf-lib';

/**
 * Creates a multi-line text field (/Tx) on the given page.
 * @param {PDFPage} page
 * @param {PDFFont} font
 * @param {{ name: string, x: number, y: number, width: number, height: number, fontSize?: number, multiline?: boolean, readonly?: boolean, defaultValue?: string }} config
 * @returns {PDFTextField}
 */
function applyFieldStyle(opts, config) {
  if (config.textColor) { opts.textColor = config.textColor; }
  if (config.backgroundColor) { opts.backgroundColor = config.backgroundColor; }
  if (config.borderColor) { opts.borderColor = config.borderColor; }
  if (config.borderWidth) { opts.borderWidth = config.borderWidth; }
  return opts;
}

export function createTextField(page, font, config) {
  var field = page.doc.getForm().createTextField(config.name);
  var addOpts = applyFieldStyle({ x: config.x, y: config.y, width: config.width, height: config.height }, config);
  field.addToPage(page, addOpts);
  field.setFontSize(config.fontSize || 10);
  if (config.multiline) { field.enableMultiline(); }
  if (config.readonly) { field.enableReadOnly(); }
  if (config.defaultValue) { field.setText(config.defaultValue); }
  return field;
}

/**
 * Creates a push button on the given page with an optional JS action
 * set directly on the widget annotation dictionary.
 * @param {PDFPage} page
 * @param {PDFFont} font
 * @param {{ name: string, x: number, y: number, width: number, height: number, label: string, action?: string }} config
 * @returns {PDFButton}
 */
export function createButton(page, font, config) {
  var field = page.doc.getForm().createButton(config.name);
  var addOpts = applyFieldStyle({
    font: font,
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
  }, config);
  field.addToPage(config.label, page, addOpts);

  // Set JS action directly on the widget annotation
  if (config.action) {
    setButtonJS(field, config.action);
  }

  return field;
}

/**
 * Sets a JavaScript MouseUp action directly on the button's widget annotation.
 * This bakes the action into the PDF structure rather than relying on
 * document-level scripts that might run before fields are initialized.
 * @param {PDFButton} field
 * @param {string} jsCode
 */
export function setButtonJS(field, jsCode) {
  var context = field.doc.context;
  var actionDict = context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFHexString.fromText(jsCode),
  });
  var aaDict = context.obj({ U: actionDict });

  // Set on each widget annotation — /A for activation, /AA/U for MouseUp
  var widgets = field.acroField.getWidgets();
  for (var i = 0; i < widgets.length; i++) {
    widgets[i].dict.set(PDFName.of('A'), actionDict);
    widgets[i].dict.set(PDFName.of('AA'), aaDict);
  }

  // Also set on the field dictionary — this is where Acrobat's
  // field.setAction("MouseUp", ...) stores it.
  field.acroField.dict.set(PDFName.of('AA'), aaDict);
}

/**
 * Creates a list box on the given page (for file tree display).
 * @param {PDFPage} page
 * @param {PDFFont} font
 * @param {{ name: string, x: number, y: number, width: number, height: number, items?: string[] }} config
 * @returns {PDFDropdown}
 */
export function createListBox(page, font, config) {
  var field = page.doc.getForm().createOptionList(config.name);
  var addOpts = applyFieldStyle({ x: config.x, y: config.y, width: config.width, height: config.height }, config);
  field.addToPage(page, addOpts);
  if (config.items && config.items.length > 0) { field.setOptions(config.items); }
  field.setFontSize(config.fontSize || 10);
  field.enableSelectOnClick();
  
  if (config.action) {
    setListBoxJS(field, config.action);
  }
  return field;
}

/**
 * Sets a JavaScript action directly on the list box annotation.
 * @param {PDFDropdown} field
 * @param {string} jsCode
 */
export function setListBoxJS(field, jsCode) {
  var context = field.doc.context;
  var actionDict = context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFHexString.fromText(jsCode),
  });
  // /K for Keystroke, /V for Validate, /A for Selection
  var aaDict = context.obj({ V: actionDict, K: actionDict });
  field.acroField.dict.set(PDFName.of('AA'), aaDict);
}
