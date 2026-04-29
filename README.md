# CPDS Template Builder

A React + TypeScript application for building dynamic table export templates.

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
│   ├── Sidebar.tsx         
│   ├── ColumnLibrary.tsx    
│   ├── BuilderCanvas.tsx    
│   ├── TablePreview.tsx    
│   └── ColumnSettings.tsx   
├── pages/
│   ├── TemplateListPage.tsx
│   └── BuilderPage.tsx    
├── store/
│   └── templateStore.ts    
├── data/
│   └── columnLibrary.ts    
├── utils/
│   ├── mockData.ts          
│   ├── exportUtils.ts    
│   └── storage.ts          
├── types/
│   └── index.ts           
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
