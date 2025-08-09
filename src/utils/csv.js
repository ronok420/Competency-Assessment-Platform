import fs from 'fs';

// Basic CSV parser supporting commas, quoted fields, and escaped quotes ""
export const parseCsvFileToObjects = async (filePath) => {
  const text = await fs.promises.readFile(filePath, 'utf-8');
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { if (row.length > 0) { rows.push(row); row = []; } };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += ch; i += 1; continue;
    } else {
      if (ch === '"') { inQuotes = true; i += 1; continue; }
      if (ch === ',') { pushField(); i += 1; continue; }
      if (ch === '\n') { pushField(); pushRow(); i += 1; continue; }
      if (ch === '\r') { i += 1; continue; }
      field += ch; i += 1; continue;
    }
  }
  // flush
  pushField(); pushRow();
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).filter(r => r.length && r.some(c => c.trim() !== '')).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
  return records;
};


