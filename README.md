# Subscription Tracked

Subscription Tracked is a full-stack web application designed to help users manage and monitor their ongoing subscriptions, calculate upcoming expenses, and receive renewal reminders. The project is split into a frontend client and a backend API.

## Project Structure

* **subtrack**: The backend API built with Node.js, Express, and MongoDB.
* **subtrack-frontend**: The frontend client built with React, Vite, and Tailwind CSS.

## Prerequisites

To run this project locally, you will need:
* Node.js installed on your machine
* A local or cloud MongoDB database instance

## Installation and Local Setup

### 1. Setting Up the Backend

Navigate to the backend directory, install the required dependencies, configure your environment, and start the server:

```bash
cd subtrack/backend
npm install
```

Create a `.env` file in the `subtrack/backend` directory with the following variables:

```env
DB_URL=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Optional SMTP Configuration for email reminders
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL="SubTrack" <noreply@subtrack.com>
```

Start the backend server:

```bash
npm start
```

The backend server will run on `http://localhost:5000`.

### 2. Setting Up the Frontend

Navigate to the frontend directory, install the required dependencies, configure the API URL, and start the development server:

```bash
cd subtrack-frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`.

## Deployed Application

The production build of this application is deployed and available at:
https://subscription-tracked-pxd7.vercel.app/
