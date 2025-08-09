export const buildBulkResult = () => ({ inserted: 0, errors: [] });

export const pushBulkError = (result, index, message) => {
  result.errors.push({ index, message });
};

export const applyBulkWriteErrors = (result, error) => {
  if (error?.writeErrors && Array.isArray(error.writeErrors)) {
    for (const we of error.writeErrors) {
      result.errors.push({ index: we.index, message: we.errmsg || we.message || 'Bulk write error' });
    }
    if (typeof error.result?.nInserted === 'number') {
      result.inserted += error.result.nInserted;
    }
  } else {
    result.errors.push({ index: -1, message: error.message || 'Bulk insert failed' });
  }
};


