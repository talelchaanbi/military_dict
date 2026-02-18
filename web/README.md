# Military Dictionary Project

This project is a Next.js application for a military dictionary, managing terms, definitions, and abbreviations across different sections (e.g., DEP 12, DEP 13).

## Prerequisites

- Node.js (v18+ recommended)
- MySQL Database

## Setup

1.  **Clone the repository** and navigate to the `web` directory:
    ```bash
    git clone http://10.27.170.81:3000/talelchaanbi/military_dict.git
    cd military_dict/web
    ```

2.  **Environment Variables**:
    Make sure you have a `.env` file at the root of `web` folder.
    You can use the example file as a template:
    ```bash
    cp .env.example .env
    ```
    Then edit `.env` to match your MySQL user/password (if any).

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Database Seeding**:
    This single command will:
    - Reset the database (force drop if exists as per your request).
    - Create the schema.
    - Seed all data (Departments 1-13 + Subtitles).
    
    ```bash
    npx prisma db push --force-reset && npx prisma db seed
    ```
    
    > **Note for Windows (PowerShell) Users:**
    > If `&&` does not work, run the commands separately:
    > ```powershell
    > npx prisma db push --force-reset
    > npx prisma db seed
    > ```
    >
    > **Note for WAMP Server Users:**
    > If you are using WAMP, the `mysql` command is located in a path similar to:
    > `C:\wamp64\bin\mysql\mysql8.0.x\bin`
    > You must add this path to your Windows Environment Variables (Path) for the restore command to work.
    >
    > Alternatively, you can temporarily add it to your current PowerShell session before running the seed:
    > ```powershell
    > $env:Path += ";C:\wamp64\bin\mysql\mysql8.0.31\bin"
    > npx prisma db push --force-reset
    > npx prisma db seed
    > ```
    > (Check your specific WAMP MySQL version folder name).

## Running the Application

### Development Mode
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

### Production Mode (Build once, run forever)
    ```bash
    npm run build
    npm start
    ```

### Production with PM2 (Recommended for Servers)
    ```bash
    # Install PM2 globally if needed
    npm install -g pm2
    
    # Build the app
    npm run build
    
    # Start and save process
    pm2 start npm --name "military-dict" -- start
    pm2 save
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
