# Frontend Refactoring Documentation

## Overview
The frontend has been completely refactored from server-side rendered templates to a modern Single Page Application (SPA) using React, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI + Tailwind)
- **Routing**: React Router DOM v6
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API

## Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # shadcn/ui primitive components
│   │   ├── Layout.tsx  # Main application layout
│   │   └── Navbar.tsx  # Responsive navigation bar
│   ├── lib/            # Utilities (cn helper, etc.)
│   ├── pages/          # Page components
│   │   ├── Home.tsx            # Landing page
│   │   ├── Topic.tsx           # Learning content
│   │   ├── Problems.tsx        # Problem list
│   │   └── ProblemDetail.tsx   # Coding environment
│   ├── types/          # TypeScript interfaces
│   ├── App.tsx         # Main app component & routing
│   └── main.tsx        # Entry point
```

## Key Features
1.  **Modern UI/UX**: Clean, minimalist design using `shadcn/ui`.
2.  **Responsive Design**: Fully responsive layout working on mobile, tablet, and desktop.
3.  **Interactive Coding**: Integrated Monaco Editor with syntax highlighting and auto-completion.
4.  **Live Feedback**: Real-time code execution and test case validation.
5.  **Type Safety**: Full TypeScript support for better maintainability.

## Getting Started
1.  Navigate to `frontend/` directory.
2.  Run `npm install` to install dependencies.
3.  Run `npm run dev` to start the development server.
4.  Ensure the Flask backend is running on port 5000 (`python app.py`).
