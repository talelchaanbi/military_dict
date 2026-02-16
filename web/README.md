# Military Dictionary Project

This project is a Next.js application for a military dictionary, managing terms, definitions, and abbreviations across different sections (e.g., DEP 12, DEP 13).

## Prerequisites

- Node.js (v18+ recommended)
- MySQL Database

## Setup

1.  **Clone the repository** and navigate to the `web` directory:
    ```bash
    cd web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `web` directory based on your configuration. Example:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/military_dict"
    ADMIN_USERNAME="admin"
    ADMIN_PASSWORD="admin123"
    ```

## Database Management

This project uses Prisma for database management.

### Migrations

To run migrations and set up the database schema:

```bash
npx prisma migrate dev
```

This will create the tables in your MySQL database.

### Seeding Data

This project has a unified seeding command that handles:
1.  **Restoring base data** from `prisma/seed_data.sql` (if database is empty).
2.  **Seeding DEP 13** data from `prisma/dep13_data.json`.
3.  **Creating/Updating Admin user**.

To initialize or reset your database with all necessary data, simply run:

```bash
npm run seed
```

This single command will ensure your database is fully populated and ready.

## Reviewing Useless Fields

To clean up unused fields or optimize the schema:

1.  Review `prisma/schema.prisma`.
2.  Identify fields that are no longer used by the application logic.
3.  Remove them from the model.
4.  Create a migration:
    ```bash
    npx prisma migrate dev --name remove_unused_fields
    ```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
