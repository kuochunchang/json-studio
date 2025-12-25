# JSON Studio

A powerful, browser-based JSON processing toolkit designed for developers.

## Key Features

- **Multi-Tab Editor**: Work on multiple JSON files simultaneously with a browser-like tab interface.
- **Smart Scratchpad**: All your files are automatically saved to your browser's local storage. No data loss on refresh.
- **Live Preview & Tools**:
    - **Viewer**: Interactive tree view to explore complex JSON structures.
    - **Table**: View JSON arrays as readable data tables.
    - **Query**: Filter and extract data using JSONPath-like queries.
    - **Transform**: Map and modify JSON structures in real-time.
    - **Diff**: Compare two JSON files side-by-side to spot changes.
- **Formatting Tools**: One-click Format (Pretty-print) and Minify functions.

## How to Operate

### Managing Files
- **Create**: Click the **"+"** button in the tab bar or side menu to create a new "Untitled" scratchpad.
- **Open**: Click any file in the **SCRATCHPAD** list on the left sidebar to open it in a new tab.
- **Rename**: Double-click a file name in the sidebar (or use the context menu if implemented) to rename it.
- **Delete**: Hover over a file in the **SCRATCHPAD** sidebar and click the **"X"** icon to permanently delete it.

### Using Tabs
- **Switch**: Click on a tab to switch between active files.
- **Close Tab**: Click the **"X"** on a tab to remove it from the editor view. *Note: Closing a tab does not delete the file; it remains in your SCRATCHPAD.*
- **Empty State**: Closing all tabs will show an empty workbench. Simply select a file from the sidebar to continue.

### Processing JSON
1. **Input**: Type or paste your JSON into the **SOURCE** editor pane on the left.
2. **Format/Minify**: Use the magic wand (format) or minimize icons in the editor toolbar.
3. **Switch Tools**: Use the tool selector in the right pane to toggle between **Viewer**, **Table**, **Query**, and **Transform**.
4. **Diff Mode**: Select the **Diff** tool to enter a full-screen comparison mode.
