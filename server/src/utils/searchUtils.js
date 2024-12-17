/**
 * Validates search filters
 * @param {Object} filters - The filters to validate
 * @returns {boolean} - Whether the filters are valid
 */
const validateFilters = (filters) => {
  if (!filters || typeof filters !== 'object') return false;

  const validTypes = ['article', 'video', 'tutorial'];
  const validLevels = ['beginner', 'intermediate', 'advanced'];

  if (filters.type && (!Array.isArray(filters.type) || 
      !filters.type.every(type => validTypes.includes(type)))) {
    return false;
  }

  if (filters.level && !validLevels.includes(filters.level)) {
    return false;
  }

  return true;
};

/**
 * Sanitizes a search query
 * @param {string} query - The search query to sanitize
 * @returns {string} - The sanitized query
 */
const sanitizeQuery = (query) => {
  return query
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

module.exports = {
  validateFilters,
  sanitizeQuery
}; 