# CPDS Template Builder

A React + TypeScript application for building dynamic table export templates, matching the Central Purchase Data System (CPDS) design.

## Tech Stack

- **React 18** + **TypeScript** (Vite)
- **TailwindCSS** – styling
- **@dnd-kit/core + sortable** – drag and drop
- **@tanstack/react-table** – table rendering
- **Zustand** – state management
- **html2canvas** – JPEG export
- **jsPDF** – PDF export
- **SheetJS (xlsx)** – Excel export
- **react-router-dom** – routing

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx          # Left navigation sidebar
│   ├── ColumnLibrary.tsx    # Draggable column library panel
│   ├── BuilderCanvas.tsx    # Sortable column drop zone
│   ├── TablePreview.tsx     # TanStack Table live preview
│   └── ColumnSettings.tsx   # Right panel column settings
├── pages/
│   ├── TemplateListPage.tsx # Template list / management
│   └── BuilderPage.tsx      # Full 3-panel builder with DnD context
├── store/
│   └── templateStore.ts     # Zustand state management
├── data/
│   └── columnLibrary.ts     # All 14 column group definitions
├── utils/
│   ├── mockData.ts          # Mock data generator
│   ├── exportUtils.ts       # JPEG / PDF / XLSX export
│   └── storage.ts           # localStorage helpers
├── types/
│   └── index.ts             # Shared TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Features

- **Template List Page** — view, create, edit, duplicate, delete templates (persisted in localStorage)
- **3-Panel Builder**
  - Left: Column Library with 14 draggable column groups
  - Center: Drop zone for building table structure + live TanStack Table preview with mock data
  - Right: Column settings (rename, alignment, width, visibility, sub-column management)
- **Drag & Drop** — drag from library to builder, reorder columns within builder
- **Nested Headers** — groups automatically create merged multi-row headers
- **Export** — JPEG (html2canvas), PDF (jsPDF), XLSX (SheetJS) preserving nested headers
