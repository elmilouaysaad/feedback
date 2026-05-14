const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Try to read from project .env.local (one level up from database/)
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
      if (match) {
        connectionString = match[1].trim();
        // remove surrounding quotes if present
        connectionString = connectionString.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      }
    }
  } catch (err) {
    // ignore and let the missing var be handled below
  }
}

if (!connectionString) {
  console.error('DATABASE_URL not set in environment or .env.local');
  process.exit(1);
}

async function migrate() {
  const sql = postgres(connectionString);

  try {
    console.log('Running database migrations...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql.unsafe(statement);
    }

    console.log('✓ Database migrations completed successfully');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
