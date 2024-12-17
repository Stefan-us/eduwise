const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

const generateSearchPrompt = (query, filters = {}, limit = 6) => {
  const filterText = filters.type || filters.level 
    ? `\nFilters:
       ${filters.type ? `- Type: ${filters.type}` : ''}
       ${filters.level ? `- Level: ${filters.level}` : ''}`
    : '';

  return `You are an educational resource finder for EduWise. You must return a valid JSON array containing EXACTLY ${limit} learning resources about "${query}". The response MUST be an ARRAY with square brackets, not a single object.

REQUIRED FORMAT - MUST BE AN ARRAY:
[
  {
    "title": "First Resource Title",
    "description": "First resource description",
    "url": "https://example.com/1",
    "type": "article",
    "difficulty": "beginner"
  },
  {
    "title": "Second Resource Title",
    "description": "Second resource description",
    "url": "https://example.com/2",
    "type": "video",
    "difficulty": "intermediate"
  }
]

STRICT RULES:
1. Response MUST be an ARRAY starting with [ and ending with ]
2. Array MUST contain EXACTLY ${limit} resources
3. No single objects - must be an array of objects
4. No numbering or prefixes in titles
5. No markdown or HTML formatting
6. No explanatory text outside the JSON array
7. No nested "resources" object - just a direct array
8. Only use these exact values for type: "article", "video", "tutorial", "course"
9. Only use these exact values for difficulty: "beginner", "intermediate", "advanced"
10. URLs must be complete, valid, and point to real resources
11. No line breaks within the JSON - it should be a single line
12. No example.com URLs - use real educational websites

Search query: "${query}"${filterText}`;
};

const searchResources = async (query, filters = {}, limit = 6) => {
  console.log('Starting resource search:', { query, filters, limit });
  
  try {
    // Check if Ollama is running
    try {
      console.log('Checking Ollama health...');
      const healthCheck = await fetch('http://localhost:11434/api/tags');
      if (!healthCheck.ok) {
        console.error('Ollama health check failed:', await healthCheck.text());
        throw new Error('Ollama service health check failed');
      }
      console.log('Ollama health check passed');
    } catch (error) {
      console.error('Ollama health check error:', error);
      throw new Error('Ollama service is not running. Please start it with: ollama serve');
    }

    const prompt = generateSearchPrompt(query, filters, limit);
    console.log('Generated prompt:', prompt);

    console.log('Sending request to Ollama...');
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.7,
          num_predict: 2048,
          stop: ["\n\n", "```", "}}", "]]"]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    console.log('Received response from Ollama');
    const data = await response.json();
    console.log('Raw Ollama response:', JSON.stringify(data, null, 2));
    
    if (!data.response) {
      console.error('Invalid Ollama response structure:', data);
      throw new Error('Invalid response from Ollama API: missing response field');
    }

    let results;
    try {
      // Clean up the response text
      let responseText = data.response
        .trim()
        // Remove all newlines and extra spaces
        .replace(/\s+/g, ' ')
        // Remove any markdown code blocks
        .replace(/```json\s+|\s+```/g, '')
        // Remove any explanatory text before or after the JSON array
        .replace(/^[^[]*(\[.*\])[^\]]*$/, '$1')
        // Clean up any escaped quotes
        .replace(/\\"/g, '"')
        // Remove any trailing commas before closing brackets
        .replace(/,\s*([\]}])/g, '$1')
        // Ensure response starts with [ and ends with ]
        .replace(/^[^[]+(\[.*)$/, '$1')
        .replace(/^(.*\])[^\]]+$/, '$1');

      // If we got a single object, wrap it in an array
      if (responseText.trim().startsWith('{')) {
        responseText = `[${responseText}]`;
      }

      // Attempt to parse the cleaned response
      results = JSON.parse(responseText);

      console.log('Parsed results:', JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Invalid response text:', data.response);
      throw new Error('Failed to parse Ollama response as JSON');
    }

    if (!Array.isArray(results)) {
      console.error('Results is not an array:', results);
      throw new Error('Invalid response format: expected array');
    }

    const validResults = results.filter(result => {
      const isValid = result &&
        typeof result.title === 'string' &&
        typeof result.description === 'string' &&
        typeof result.url === 'string' &&
        ['article', 'video', 'tutorial', 'course'].includes(result.type) &&
        ['beginner', 'intermediate', 'advanced'].includes(result.difficulty) &&
        !result.url.includes('example.com');

      if (!isValid) {
        console.error('Invalid result object:', result);
      }

      return isValid;
    });

    console.log(`Found ${validResults.length} valid results out of ${results.length} total`);

    if (validResults.length === 0) {
      throw new Error('No valid results found in response');
    }

    // Ensure we have exactly the requested number of results
    return validResults.slice(0, limit);
  } catch (error) {
    console.error('Resource search failed:', error);
    throw error;
  }
};

module.exports = {
  searchResources
}; 