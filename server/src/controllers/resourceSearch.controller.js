const { searchResources } = require('../services/ollama.service');
const { validateFilters, sanitizeQuery } = require('../utils/searchUtils');

const search = async (req, res) => {
  try {
    const { query, filters, limit = 6 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid search query'
      });
    }

    // Validate filters
    if (filters && !validateFilters(filters)) {
      return res.status(400).json({
        error: 'Invalid filters'
      });
    }

    // Sanitize query
    const sanitizedQuery = sanitizeQuery(query);
    if (!sanitizedQuery) {
      return res.status(400).json({
        error: 'Invalid search query after sanitization'
      });
    }

    const results = await searchResources(sanitizedQuery, filters, limit);
    
    return res.json({
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Search controller error:', error);
    return res.status(500).json({
      error: 'Failed to search resources'
    });
  }
};

module.exports = {
  search
}; 