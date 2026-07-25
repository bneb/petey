# Petey IDE

<div align="center">
  <img src="logo.png" alt="Petey Logo" width="300" />
</div>

Petey is a fully self-contained JavaScript IDE running entirely inside a standard PDF document. It leverages Adobe Acrobat's native JavaScript engine combined with a bundled, sandboxed ES5 JS-Interpreter to execute code directly from within the PDF.

## Features

<div align="center">
  <img src="docs/still_1.png" alt="Petey UI Still 1" width="250" style="margin: 5px;" />
  <img src="docs/still_2.png" alt="Petey UI Still 2" width="250" style="margin: 5px;" />
  <img src="docs/still_3.png" alt="Petey UI Still 3" width="250" style="margin: 5px;" />
</div>

- **In-PDF Execution**: Write and run JavaScript entirely inside the PDF. No external dependencies or internet connection required for the core engine.
- **Algorithm Library**: Comes with built-in LeetCode-style algorithms (Two Sum, Fibonacci, Reverse String) out of the box.
- **Virtual File System (VFS)**: Securely create, edit, and save your own custom scripts within the PDF. The VFS bypasses strict Acrobat attachment security policies by persisting files into a hidden JSON text field.
- **Thin-Client Networking**: (Optional) Run the local thin-client server (`npm run serve`) to allow the PDF to bridge its `console.log` output out of the sandbox and into your host terminal.

## Architecture

- **`src/generate.js`**: The `pdf-lib` generation script that compiles the PDF, creates the AcroForm UI (file tree, editor, terminal, buttons), and bundles the injected scripts.
- **`src/injected/`**: The JavaScript payload injected into the PDF's Acrobat JS engine. This includes ES5 polyfills and the JS-Interpreter bridge.
- **`src/ui/`**: Layout algorithms, form field configuration, and Acrobat action scripts (e.g., button click handlers, VFS parsing).
- **`src/interpreter/`**: Adapters and polyfills for Neil Fraser's JS-Interpreter to run seamlessly in the restrictive Acrobat environment.
- **`src/thin-client/`**: The Node.js local server bridging PDF network requests to the host environment.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the PDF**
   ```bash
   npm run build
   ```
   This will generate `petey.pdf` in the project root.

3. **Run the IDE**
   Open `petey.pdf` in **Adobe Acrobat** or **Adobe Acrobat Reader**. 
   *(Note: Browser-based PDF viewers like Chrome or Safari do not support AcroForm JavaScript execution.)*

4. **Run the Thin-Client (Optional)**
   ```bash
   npm run serve
   ```
   With the server running, clicking "Run" in the PDF will stream the execution output to your terminal.

## Testing

The project is thoroughly tested using Vitest.

```bash
npm test
```

## License

MIT
