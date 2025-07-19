# Task Manager Frontend

This is the frontend for a full-stack task management application, built with the Next.js App Router, React, TypeScript, and styled with Tailwind CSS. It connects to the corresponding [Task Manager API](https://github.com/your-username/task-manager-api).

---

## Features

- **Modern UI:** A clean and responsive user interface.
- **Dark Mode:** Built-in theme toggling for user preference.
- **Authentication:** Client-side handling for user registration, login, and Google OAuth.
- **Interactive Boards:** Full drag-and-drop functionality for managing tasks between lists.
- **Global State Management:** Uses React Context API for authentication state.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Drag & Drop:** `Dnd Kit`
- **Theming:** `next-themes`
- **Deployment:** Vercel

---

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

- Node.js (v18 or later)
- A running instance of the [backend API](https://github.com/your-username/task-manager-api).

### 2. Clone the Repository

```bash
git clone https://github.com/Ghost-web-ops/task-manager-frontend.git
cd task-manager-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

- Create a `.env.local` file in the root of the project.
- Add the following variable, pointing to your local backend server's URL.

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000"
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/). When deploying, ensure you set the `NEXT_PUBLIC_API_BASE_URL` environment variable to the public URL of your deployed backend API on Railway.
