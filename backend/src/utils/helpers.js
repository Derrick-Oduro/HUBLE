const safeJsonParse = (value, fallback = null) => {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const pick = (source, keys) => {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});
};

const omit = (source, keysToOmit) => {
  return Object.keys(source).reduce((acc, key) => {
    if (!keysToOmit.includes(key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});
};

const chunkArray = (items, size) => {
  if (!Array.isArray(items) || size <= 0) return [];
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

module.exports = {
  safeJsonParse,
  pick,
  omit,
  chunkArray,
};
