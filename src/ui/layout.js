// US Letter dimensions in PDF points
export var PAGE_WIDTH = 612;
export var PAGE_HEIGHT = 792;

/**
 * Calculates the position rectangles for all UI elements.
 * All coordinates are from bottom-left origin (PDF coordinate system).
 * Layout (left to right): file tree | editor+terminal | canvas
 *
 * @param {number} pageWidth
 * @param {number} pageHeight
 * @returns {{ fileTree, editor, terminal, runBtn, saveBtn, newFileBtn, buildBtn }}
 */
export function calculateLayout(pageWidth, pageHeight) {
  var m = 15, g = 15, bH = 30, bY = 60, topY = bY + bH + g;
  var d = calcDims(pageWidth, pageHeight, m, g, topY);
  return {
    fileTree: { x: m, y: topY, width: d.ftW, height: d.cH },
    editor:  { x: d.mX,  y: d.eY, width: d.mW, height: d.eH },
    terminal:{ x: d.mX,  y: topY, width: d.mW, height: d.tH },
    runBtn:     { x: d.mX, y: bY, width: 55, height: bH },
    saveBtn:    { x: d.mX + 60,  y: bY, width: 55, height: bH },
    newFileBtn: { x: d.mX + 120, y: bY, width: 65, height: bH },
    buildBtn:   { x: d.mX + 270, y: bY, width: 75, height: bH },
  };
}

function calcDims(pw, ph, m, g, topY) {
  var ftW = 130, mX = m + ftW + g;
  var mW = pw - mX - m, tH = 220, eY = topY + tH + g;
  var eH = ph - eY - m, cH = ph - topY - m;
  return { ftW: ftW, mX: mX, mW: mW, tH: tH, eY: eY, eH: eH, cH: cH };
}
