import fs from 'fs';

export const readJsonFile = async (filePath) => {
  const raw = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
};

export const extractItemsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  throw new Error('Invalid JSON format. Expected an array or { items: [...] }');
};


