# DevFlow - Project Management Dashboard

DevFlow is a scalable web application for managing development projects, work items, sprints, and team activities. It provides a modern dashboard for tracking metrics, boards for organizing tasks, and recent activity logs. Built with a frontend in React and a backend in Node.js/Express with MongoDB for persistent data storage, it's designed for easy CRUD operations on work items and activities.

## Features
- **Dashboard**: View key metrics like active work items, sprint progress, and recent builds.
- **Boards**: Kanban-style boards for managing work items across columns (To Do, In Progress, etc.) with drag-and-drop (or menu-based) movement.
- **CRUD Operations**: Create, read, update, and delete work items and activities via intuitive UI dialogs and buttons.
- **Recent Activity**: Dynamic log of actions like creates, moves, and updates.
- **Scalable Backend**: Uses MongoDB for data persistence, with REST API for full scalability.
- **Deployment-Ready**: Easy to deploy to Vercel (frontend + backend as monorepo).

## Tech Stack
- **Frontend**: React, Vite, Shadcn UI, Tailwind CSS, React Router, Tanstack Query.
- **Backend**: Node.js, Express, Mongoose (MongoDB ORM).
- **Database**: MongoDB (Atlas for cloud hosting).
- **Other**: Axios for API calls, dotenv for environment variables.

## Setup
1. Clone the repo: `git clone <repo-url>`.
2. Install dependencies: `npm install`.
3. Set up MongoDB: Add your MONGO_URI to `.env` in the root.
4. Start backend: `npm run backend` (runs on port 3001).
5. Start frontend: `npm run dev` (runs on port 5173).
6. Access at http://localhost:5173.

For production, deploy to Vercel: Configure Vercel to run `npm run build` for frontend and `npm run backend` for server (use Vercel Serverless Functions if needed).

## Contact
For questions or collaborations, contact the developer at tammyhartline@gmail.com. To see more of my projects in production, visit https://tammyhartline.tech.
