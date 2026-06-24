import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const VALID_STATUS = new Set(['Vacant', 'Occupied']);

// Normalise an incoming slot payload into safe fields.
function clean(body) {
  const status = VALID_STATUS.has(body?.status) ? body.status : 'Vacant';
  return {
    zone: String(body?.zone ?? '').trim(),
    slot_code: String(body?.slot_code ?? '').trim(),
    name: String(body?.name ?? '').trim(),
    plate: String(body?.plate ?? '').trim(),
    room: String(body?.room ?? '').trim(),
    note: String(body?.note ?? '').trim(),
    status,
    sort_order: Number.isFinite(+body?.sort_order) ? +body.sort_order : 0,
  };
}

export default async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    switch (req.method) {
      case 'GET': {
        const rows = await sql`
          SELECT id, zone, slot_code, name, plate, room, status, note, sort_order, updated_at
          FROM slots
          ORDER BY sort_order, id`;
        return json(rows);
      }

      case 'POST': {
        const s = clean(await req.json());
        if (!s.slot_code) return json({ error: 'slot_code is required' }, 400);
        const [row] = await sql`
          INSERT INTO slots (zone, slot_code, name, plate, room, status, note, sort_order)
          VALUES (${s.zone}, ${s.slot_code}, ${s.name}, ${s.plate}, ${s.room}, ${s.status}, ${s.note}, ${s.sort_order})
          RETURNING *`;
        return json(row, 201);
      }

      case 'PUT': {
        if (!id) return json({ error: 'id query param is required' }, 400);
        const s = clean(await req.json());
        if (!s.slot_code) return json({ error: 'slot_code is required' }, 400);
        const [row] = await sql`
          UPDATE slots SET
            zone = ${s.zone}, slot_code = ${s.slot_code}, name = ${s.name},
            plate = ${s.plate}, room = ${s.room}, status = ${s.status}, note = ${s.note},
            sort_order = ${s.sort_order}
          WHERE id = ${id}
          RETURNING *`;
        if (!row) return json({ error: 'not found' }, 404);
        return json(row);
      }

      case 'DELETE': {
        if (!id) return json({ error: 'id query param is required' }, 400);
        const [row] = await sql`DELETE FROM slots WHERE id = ${id} RETURNING id`;
        if (!row) return json({ error: 'not found' }, 404);
        return json({ deleted: row.id });
      }

      default:
        return json({ error: 'method not allowed' }, 405);
    }
  } catch (err) {
    return json({ error: err.message ?? 'server error' }, 500);
  }
};

export const config = { path: '/api/slots' };
