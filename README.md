PS C:\Users\mdn\Desktop\TALEL\military_dict\web> npx prisma migrate reset
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "military_dict" at "localhost:3306"

√ Are you sure you want to reset your database? All data will be lost. ... yes

Applying migration `20260204093755_init`
Applying migration `20260204095543_term_longtext`
Applying migration `20260216133719_sync_schema`
Applying migration `20260216180129_add_subtitle_table`

Database reset successful

The following migration(s) have been applied:

migrations/
  └─ 20260204093755_init/
    └─ migration.sql
  └─ 20260204095543_term_longtext/
    └─ migration.sql
  └─ 20260216133719_sync_schema/
    └─ migration.sql
  └─ 20260216180129_add_subtitle_table/
    └─ migration.sql

✔ Generated Prisma Client (v6.19.2) to .\node_modules\@prisma\client in 101ms

Running seed command `tsx prisma/seed.ts` ...
⚠️ Database appears incomplete. Attempting full restoration...
Restoring base data from seed_data.sql...
✅ Base data restored successfully.
⚠️ Re-applying Prisma Schema to ensure compatibility...
❌ Failed to restore SQL data: Error: Command failed: npx prisma db push --accept-data-loss
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Error: Failed to open the referenced table 'subtitle'
   0: sql_schema_connector::apply_migration::migration_step
           with step=AddForeignKey { foreign_key_id: ForeignKeyId(2) }
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:28
   1: sql_schema_connector::apply_migration::apply_migration
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:11
   2: schema_core::state::SchemaPush
             at schema-engine\core\src\state.rs:545


    at genericNodeError (node:internal/errors:985:15)
    at wrappedFn (node:internal/errors:539:14)
    at ChildProcess.exithandler (node:child_process:417:12)
    at ChildProcess.emit (node:events:508:28)
    at maybeClose (node:internal/child_process:1101:16)
    at ChildProcess._handle.onexit (node:internal/child_process:305:5) {
  code: 1,
  killed: false,
  signal: null,
  cmd: 'npx prisma db push --accept-data-loss',
  stdout: 'Prisma schema loaded from prisma\\schema.prisma\n' +
    'Datasource "db": MySQL database "military_dict" at "localhost:3306"\n',
  stderr: 'warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).\n' +
    'For more information, see: https://pris.ly/prisma-config\n' +
    '\n' +
    'Environment variables loaded from .env\n' +
    "Error: Failed to open the referenced table 'subtitle'\n" +
    '   0: sql_schema_connector::apply_migration::migration_step\n' +
    '           with step=AddForeignKey { foreign_key_id: ForeignKeyId(2) }\n' +
    '             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:28\n' +
    '   1: sql_schema_connector::apply_migration::apply_migration\n' +
    '             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:11\n' +
    '   2: schema_core::state::SchemaPush\n' +
    '             at schema-engine\\core\\src\\state.rs:545\n' +
    '\n'
}
You may need to run: mysql -u USER -p DATABASE < prisma/seed_data.sql
Seeding DEP 13 data...
✅ DEP 13 seeded successfully.
Seeding Subtitles/Structure using HTML files...
Checking Section 1...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 1: Found
Seeding Subtitles for Section 1 from JSON data...
Checking Section 2...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 2: Found
Checking Section 3...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 3: Found
Checking Section 4...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 4: Found
Seeding Subtitles for Section 4 from JSON data...
Checking Section 5...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 5: Found
Seeding Subtitles for Section 5 from JSON data...
Checking Section 6...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 6: Found
Seeding Subtitles for Section 6 from JSON data...
Checking Section 7...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 7: Found
Seeding Subtitles for Section 7 from JSON data...
Checking Section 8...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 8: Found
Seeding Subtitles for Section 8 from JSON data...
Checking Section 9...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 9: Found
Seeding Subtitles for Section 9 from JSON data...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 10: Found
Seeding Subtitles for Section 10 from JSON data...
Checking Section 11...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 11: Found
Seeding Subtitles for Section 11 from JSON data...
Migration complete.

✅ Subtitles seeded successfully.
✅ Admin user 'admin' created.

The seed command has been executed.

warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "military_dict" at "localhost:3306"

The MySQL database "military_dict" at "localhost:3306" was successfully reset.

Your database is now in sync with your Prisma schema. Done in 222ms

✔ Generated Prisma Client (v6.19.2) to .\node_modules\@prisma\client in 109ms

PS C:\Users\mdn\Desktop\TALEL\military_dict\web> npx prisma db seed
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Running seed command `tsx prisma/seed.ts` ...
⚠️ Database appears incomplete. Attempting full restoration...
Restoring base data from seed_data.sql...
✅ Base data restored successfully.
⚠️ Re-applying Prisma Schema to ensure compatibility...
❌ Failed to restore SQL data: Error: Command failed: npx prisma db push --accept-data-loss
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Error: Failed to open the referenced table 'subtitle'
   0: sql_schema_connector::apply_migration::migration_step
           with step=AddForeignKey { foreign_key_id: ForeignKeyId(2) }
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:28
   1: sql_schema_connector::apply_migration::apply_migration
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:11
   2: schema_core::state::SchemaPush
             at schema-engine\core\src\state.rs:545


    at genericNodeError (node:internal/errors:985:15)
    at wrappedFn (node:internal/errors:539:14)
    at ChildProcess.exithandler (node:child_process:417:12)
    at ChildProcess.emit (node:events:508:28)
    at maybeClose (node:internal/child_process:1101:16)
    at ChildProcess._handle.onexit (node:internal/child_process:305:5) {
  code: 1,
  killed: false,
  signal: null,
  cmd: 'npx prisma db push --accept-data-loss',
  stdout: 'Prisma schema loaded from prisma\\schema.prisma\n' +
    'Datasource "db": MySQL database "military_dict" at "localhost:3306"\n',
  stderr: 'warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).\n' +
    'For more information, see: https://pris.ly/prisma-config\n' +
    '\n' +
    'Environment variables loaded from .env\n' +
    "Error: Failed to open the referenced table 'subtitle'\n" +
    '   0: sql_schema_connector::apply_migration::migration_step\n' +
    '           with step=AddForeignKey { foreign_key_id: ForeignKeyId(2) }\n' +
    '             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:28\n' +
    '   1: sql_schema_connector::apply_migration::apply_migration\n' +
    '             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:11\n' +
    '   2: schema_core::state::SchemaPush\n' +
    '             at schema-engine\\core\\src\\state.rs:545\n' +
    '\n'
}
You may need to run: mysql -u USER -p DATABASE < prisma/seed_data.sql
Seeding DEP 13 data...
✅ DEP 13 seeded successfully.
Seeding Subtitles/Structure using HTML files...
Checking Section 1...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 1: Found
Seeding Subtitles for Section 1 from JSON data...
Checking Section 2...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 2: Found
Checking Section 3...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 3: Found
Checking Section 4...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 4: Found
Seeding Subtitles for Section 4 from JSON data...
Checking Section 5...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 5: Found
Seeding Subtitles for Section 5 from JSON data...
Checking Section 6...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 6: Found
Seeding Subtitles for Section 6 from JSON data...
Checking Section 7...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 7: Found
Seeding Subtitles for Section 7 from JSON data...
Checking Section 8...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 8: Found
Seeding Subtitles for Section 8 from JSON data...
Checking Section 9...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 9: Found
Seeding Subtitles for Section 9 from JSON data...
Checking Section 10...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 10: Found
Seeding Subtitles for Section 10 from JSON data...
Checking Section 11...
Looking for manual data in: C:\Users\mdn\Desktop\TALEL\military_dict\web\prisma\subtitles_data.json
Manual data for 11: Found
Seeding Subtitles for Section 11 from JSON data...
Migration complete.

✅ Subtitles seeded successfully.
✅ Admin user 'admin' created.

The seed command has been executed.
PS C:\Users\mdn\Desktop\TALEL\military_dict\web>





















