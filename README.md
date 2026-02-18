PS C:\Users\mdn\Desktop\TALEL\military_dict> git pull
remote: Enumerating objects: 8, done.
PS C:\Users\mdn\Desktop\TALEL\military_dict> cd web
PS C:\Users\mdn\Desktop\TALEL\military_dict\web> npx prisma db push --force-reset && npx prisma db seed
Au caractère Ligne:1 : 34
+ npx prisma db push --force-reset && npx prisma db seed
+                                  ~~
Le jeton « && » n’est pas un séparateur d’instruction valide.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : InvalidEndOfLine
 
PS C:\Users\mdn\Desktop\TALEL\military_dict\web> npx prisma db push --force-reset                      
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "military_dict" at "localhost:3306"

The MySQL database "military_dict" at "localhost:3306" was successfully reset.

Your database is now in sync with your Prisma schema. Done in 223ms

✔ Generated Prisma Client (v6.19.2) to .\node_modules\@prisma\client in 119ms

PS C:\Users\mdn\Desktop\TALEL\military_dict\web> npx prisma db seed
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Running seed command `tsx prisma/seed.ts` ...
⚠️ Database appears incomplete. Attempting full restoration...
Restoring base data from seed_data.sql...
❌ Failed to restore SQL data: Error: Command failed: mysql -u "root" -p"" -h "localhost" -P "3306" "military_dict" < "
C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\seed_data.sql"
'mysql' n'est pas reconnu en tant que commande interne
ou externe, un programme ex�cutable ou un fichier de commandes.

    at genericNodeError (node:internal/errors:985:15)
    at wrappedFn (node:internal/errors:539:14)
    at ChildProcess.exithandler (node:child_process:417:12)
    at ChildProcess.emit (node:events:508:28)
    at maybeClose (node:internal/child_process:1101:16)
    at ChildProcess._handle.onexit (node:internal/child_process:305:5) {
  code: 1,
  killed: false,
  signal: null,
  cmd: 'mysql -u "root" -p"" -h "localhost" -P "3306" "military_dict" < "C:\\Users\\mdn\\Desktop\\TALEL\\military_dict\\web\\prisma\\seed_data.sql"',
  stdout: '',
  stderr: "'mysql' n'est pas reconnu en tant que commande interne\r\n" +
    'ou externe, un programme ex�cutable ou un fichier de commandes.\r\n'
}
You may need to run: mysql -u USER -p DATABASE < prisma/seed_data.sql
Seeding DEP 13 data...
✅ DEP 13 seeded successfully.
Seeding Subtitles/Structure using HTML files...
Checking Section 1...
Section 1 not found in DB. Skipping.
Checking Section 2...
Section 2 not found in DB. Skipping.
Checking Section 3...
Section 3 not found in DB. Skipping.
Checking Section 4...
Section 4 not found in DB. Skipping.
Checking Section 5...
Section 5 not found in DB. Skipping.
Checking Section 6...
Section 6 not found in DB. Skipping.
Checking Section 7...
Section 7 not found in DB. Skipping.
Checking Section 8...
Section 8 not found in DB. Skipping.
Checking Section 9...
Section 9 not found in DB. Skipping.
Checking Section 10...
Section 10 not found in DB. Skipping.
Checking Section 11...
Section 11 not found in DB. Skipping.
Migration complete.

✅ Subtitles seeded successfully.
✅ Admin user 'admin' created.
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.2 -> 7.4.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

The seed command has been executed.
PS C:\Users\mdn\Desktop\TALEL\military_dict\web> 
