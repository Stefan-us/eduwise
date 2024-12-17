import React, { useState } from 'react';
import { searchService } from '../../../../services/search.service';

const SearchBar = ({ onSearch, value, onChange }) => (
  <div className="mb-6">
    <input
      type="text"
      className="w-full p-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
      placeholder="Search for learning resources..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onSearch(value)}
    />
  </div>
);

const FilterBar = ({ filters, onFilterChange }) => {
  const types = ['article', 'video', 'tutorial'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-gray-700">Type:</span>
        <select
          className="p-2 border rounded-lg"
          value={filters.type || ''}
          onChange={(e) => onFilterChange('type', e.target.value)}
        >
          <option value="">All</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-700">Level:</span>
        <select
          className="p-2 border rounded-lg"
          value={filters.level || ''}
          onChange={(e) => onFilterChange('level', e.target.value)}
        >
          <option value="">All</option>
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const ResultCard = ({ result }) => (
  <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
    <h3 className="text-lg font-medium">{result.title}</h3>
    <p className="text-gray-600 mt-2 line-clamp-3">{result.description}</p>
    <div className="flex mt-4 justify-between items-center">
      <span className="px-2 py-1 bg-gray-100 rounded capitalize">
        {result.type}
      </span>
      <span className="text-sm text-gray-500 capitalize">
        {result.difficulty}
      </span>
    </div>
    {result.url && (
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-blue-600 hover:text-blue-800"
      >
        Learn More →
      </a>
    )}
  </div>
);

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    ))}
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="p-6 bg-red-50 text-red-700 rounded-lg">
    <p className="mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

const ResourceRecommendationsContent = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching for:', searchQuery, 'with filters:', filters);
      const searchResults = await searchService.search(searchQuery, filters);
      console.log('Search results:', searchResults);
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      let errorMessage = 'Failed to fetch resources. ';
      
      if (err.response) {
        // Server responded with error
        errorMessage += err.response.data?.error || err.response.statusText;
      } else if (err.request) {
        // No response received
        errorMessage += 'Could not connect to the server. Please check your connection.';
      } else {
        // Error in request setup
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (query) {
      handleSearch(query);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar 
        onSearch={handleSearch}
        value={query}
        onChange={setQuery}
      />
      
      <FilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
        />
      )}
      
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
          {!loading && !error && results.length === 0 && query && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No results found. Try a different search term or filters.
            </div>
          )}
          {!query && (
            <div className="col-span-full text-center text-gray-500 py-8">
              Enter a search term to find learning resources.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceRecommendationsContent;