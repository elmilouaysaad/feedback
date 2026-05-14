import { getDb } from './db';
import type { Event, Feedback, EventStats, TabletAssignment } from './db';

// ===== Event Operations =====
export async function getActiveEvent(): Promise<Event | null> {
  const sql = getDb();
  const result = await sql<Event[]>`
    SELECT * FROM events 
    WHERE is_active = true AND is_hidden = false
    LIMIT 1
  `;
  
  return result.length > 0 ? result[0] : null;
}

export async function getTabletEvent(tabletCode: string): Promise<Event | null> {
  const code = tabletCode.trim().toLowerCase();

  if (!code) {
    return getActiveEvent();
  }

  const sql = getDb();
  const result = await sql<Event[]>`
    SELECT e.*
    FROM tablet_assignments t
    JOIN events e ON e.id = t.event_id
    WHERE LOWER(t.code) = ${code}
      AND e.is_hidden = false
    LIMIT 1
  `;

  if (result.length > 0) {
    return result[0];
  }

  return getActiveEvent();
}

export async function getAllEvents(includeHidden = false): Promise<Event[]> {
  const sql = getDb();
  const result = includeHidden
    ? await sql<Event[]>`
        SELECT * FROM events
        ORDER BY created_at DESC
      `
    : await sql<Event[]>`
        SELECT * FROM events
        WHERE is_hidden = false
        ORDER BY created_at DESC
      `;
  
  return result;
}

export async function getAllTabletAssignments(): Promise<TabletAssignment[]> {
  const sql = getDb();
  const result = await sql<TabletAssignment[]>`
    SELECT
      t.id,
      t.code,
      t.event_id,
      t.created_at,
      t.updated_at,
      e.name as event_name
    FROM tablet_assignments t
    LEFT JOIN events e ON e.id = t.event_id
    ORDER BY t.updated_at DESC, t.created_at DESC
  `;

  return result;
}

export async function upsertTabletAssignment(
  code: string,
  eventId: number | null
): Promise<TabletAssignment | null> {
  const sql = getDb();
  const normalizedCode = code.trim().toLowerCase();

  if (!normalizedCode) {
    throw new Error('Tablet code is required');
  }

  const result = await sql<TabletAssignment[]>`
    INSERT INTO tablet_assignments (code, event_id)
    VALUES (${normalizedCode}, ${eventId})
    ON CONFLICT (code)
    DO UPDATE SET
      event_id = EXCLUDED.event_id,
      updated_at = NOW()
    RETURNING *
  `;

  return result.length > 0 ? result[0] : null;
}

export async function deleteTabletAssignment(code: string): Promise<boolean> {
  const sql = getDb();
  const normalizedCode = code.trim().toLowerCase();

  const result = await sql`
    DELETE FROM tablet_assignments
    WHERE LOWER(code) = ${normalizedCode}
  `;

  return result.count > 0;
}

export async function setActiveEvent(eventId: number): Promise<Event | null> {
  const sql = getDb();
  
  // Deactivate all events
  await sql`UPDATE events SET is_active = false`;
  
  // Activate the selected event
  const result = await sql<Event[]>`
    UPDATE events 
    SET is_active = true, is_hidden = false, updated_at = NOW()
    WHERE id = ${eventId}
    RETURNING *
  `;
  
  return result.length > 0 ? result[0] : null;
}

export async function createEvent(name: string): Promise<Event | null> {
  const sql = getDb();
  const result = await sql<Event[]>`
    INSERT INTO events (name, is_active) 
    VALUES (${name}, false) 
    RETURNING *
  `;
  
  return result.length > 0 ? result[0] : null;
}

export async function setEventHidden(eventId: number, isHidden: boolean): Promise<Event | null> {
  const sql = getDb();
  const result = await sql<Event[]>`
    UPDATE events
    SET is_active = CASE WHEN ${isHidden} THEN false ELSE is_active END,
        is_hidden = ${isHidden},
        updated_at = NOW()
    WHERE id = ${eventId}
    RETURNING *
  `;

  return result.length > 0 ? result[0] : null;
}

// ===== Feedback Operations =====
export async function submitFeedback(eventId: number, rating: number): Promise<Feedback | null> {
  const sql = getDb();
  
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const result = await sql<Feedback[]>`
    INSERT INTO feedback (event_id, rating) 
    VALUES (${eventId}, ${rating}) 
    RETURNING *
  `;
  
  return result.length > 0 ? result[0] : null;
}

// ===== Analytics Operations =====
export async function getEventStats(eventId: number): Promise<EventStats | null> {
  const sql = getDb();
  const result = await sql<EventStats[]>`
    SELECT 
      e.id as event_id,
      e.name as event_name,
      COUNT(f.id) as total_votes,
      COUNT(CASE WHEN f.rating = 1 THEN 1 END) as rating_1,
      COUNT(CASE WHEN f.rating = 2 THEN 1 END) as rating_2,
      COUNT(CASE WHEN f.rating = 3 THEN 1 END) as rating_3,
      COUNT(CASE WHEN f.rating = 4 THEN 1 END) as rating_4,
      COUNT(CASE WHEN f.rating = 5 THEN 1 END) as rating_5
    FROM events e
    LEFT JOIN feedback f ON e.id = f.event_id
    WHERE e.id = ${eventId}
    GROUP BY e.id, e.name
  `;
  
  return result.length > 0 ? result[0] : null;
}

export async function getAllEventStats(includeHidden = false): Promise<EventStats[]> {
  const sql = getDb();
  const result = includeHidden
    ? await sql<EventStats[]>`
        SELECT 
          e.id as event_id,
          e.name as event_name,
          COUNT(f.id) as total_votes,
          COUNT(CASE WHEN f.rating = 1 THEN 1 END) as rating_1,
          COUNT(CASE WHEN f.rating = 2 THEN 1 END) as rating_2,
          COUNT(CASE WHEN f.rating = 3 THEN 1 END) as rating_3,
          COUNT(CASE WHEN f.rating = 4 THEN 1 END) as rating_4,
          COUNT(CASE WHEN f.rating = 5 THEN 1 END) as rating_5
        FROM events e
        LEFT JOIN feedback f ON e.id = f.event_id
        GROUP BY e.id, e.name
        ORDER BY e.created_at DESC
      `
    : await sql<EventStats[]>`
        SELECT 
          e.id as event_id,
          e.name as event_name,
          COUNT(f.id) as total_votes,
          COUNT(CASE WHEN f.rating = 1 THEN 1 END) as rating_1,
          COUNT(CASE WHEN f.rating = 2 THEN 1 END) as rating_2,
          COUNT(CASE WHEN f.rating = 3 THEN 1 END) as rating_3,
          COUNT(CASE WHEN f.rating = 4 THEN 1 END) as rating_4,
          COUNT(CASE WHEN f.rating = 5 THEN 1 END) as rating_5
        FROM events e
        LEFT JOIN feedback f ON e.id = f.event_id
        WHERE e.is_hidden = false
        GROUP BY e.id, e.name
        ORDER BY e.created_at DESC
      `;
  
  return result;
}

export async function getEventFeedback(
  eventId: number, 
  limit: number = 100,
  offset: number = 0
): Promise<Feedback[]> {
  const sql = getDb();
  const result = await sql<Feedback[]>`
    SELECT * FROM feedback 
    WHERE event_id = ${eventId}
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return result;
}

// ===== Settings Operations =====
export async function getSetting(key: string): Promise<string | null> {
  const sql = getDb();
  const result = await sql<{ value: string }[]>`
    SELECT value FROM settings WHERE key = ${key}
  `;
  
  return result.length > 0 ? result[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

export async function getAnalyticsPassword(): Promise<string | null> {
  return getSetting('analytics_password');
}

export async function setAnalyticsPassword(hashedPassword: string): Promise<void> {
  return setSetting('analytics_password', hashedPassword);
}
