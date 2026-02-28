const mapRecord = (record) => {
  if (!record || typeof record !== "object") return record;

  const mapped = { ...record };

  if (mapped.id && !mapped._id) mapped._id = mapped.id;
  if (mapped.created_at && !mapped.createdAt) mapped.createdAt = mapped.created_at;
  if (mapped.updated_at && !mapped.updatedAt) mapped.updatedAt = mapped.updated_at;

  return mapped;
};

const mapRecords = (records = []) => records.map(mapRecord);

module.exports = { mapRecord, mapRecords };
