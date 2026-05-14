import postgres from 'postgres';

let sql: postgres.Sql;

export function getDb() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    sql = postgres(connectionString);
  }

  return sql;
}

export async function closeDb() {
  if (sql) {
    await sql.end();
  }
}

// Types
export interface Event {
  id: number;
  name: string;
  is_active: boolean;
  is_hidden: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Feedback {
  id: number;
  event_id: number;
  rating: number;
  created_at: Date;
}

export interface EventStats {
  event_id: number;
  event_name: string;
  total_votes: number;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
}

export interface TabletAssignment {
  id: number;
  code: string;
  event_id: number | null;
  created_at: Date;
  updated_at: Date;
  event_name?: string | null;
}
