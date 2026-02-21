# LinkedIn Post Generator

Automated AI-driven LinkedIn post generator.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    OPENAI_API_KEY=sk-...
    DATABASE_URL="file:./dev.db"
    ```

3.  **Database Setup**:
    Initialize the SQLite database:
    ```bash
    npx prisma db push
    ```

## Running the App

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000).

## Scheduler

To run the daily scheduler (external to the app server):

```bash
node scheduler.js
```
Use a process manager like PM2 to keep this running permanently, or set up a system cron job to run this script daily.

## Features

- **Dashboard**: View recent generated posts and their validation status.
- **Settings**: Configure business details (Product, Audience, etc.).
- **Manual Generation**: Button to trigger generation for "today".
- **AI Validation**: Posts are automatically validated against strict rules (No emojis, etc.).
