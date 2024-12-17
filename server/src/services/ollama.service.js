const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

const generateSearchPrompt = (query, filters = {}, limit = 6) => {
  const filterText = filters.type || filters.level 
    ? `\nFilters:
       ${filters.type ? `- Type: ${filters.type}` : ''}
       ${filters.level ? `- Level: ${filters.level}` : ''}`
    : '';

  return `You are an educational resource finder for EduWise. Return a JSON array containing exactly ${limit} learning resources about "${query}".

Each resource in the array must strictly follow this format:
{
  "title": "clear title",
  "description": "2-3 sentence description",
  "url": "direct link to resource",
  "type": "article" | "video" | "tutorial",
  "difficulty": "beginner" | "intermediate" | "advanced"
}

Example response:
[
  {
    "title": "Introduction to Basic Mathematics",
    "description": "A comprehensive guide covering fundamental math concepts. Perfect for beginners looking to build a strong foundation in mathematics.",
    "url": "https://www.khanacademy.org/math/arithmetic",
    "type": "tutorial",
    "difficulty": "beginner"
  }
]

Search query: "${query}"${filterText}

Important:
1. Return ONLY a valid JSON array
2. Do not include any explanatory text
3. Do not wrap the array in additional objects
4. Ensure all URLs are valid and accessible
5. Use only the specified values for type and difficulty fields`;
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
        format: 'json'
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
      let responseText = data.response.trim();
      
      // Remove any extra newlines or spaces
      responseText = responseText.replace(/\n+/g, '');
      
      // If the response is wrapped in extra quotes or braces, clean those up
      responseText = responseText.replace(/^["'{]+|[}"']+$/g, '');
      
      // If response contains "resources", extract just the array
      if (responseText.includes('"resources"')) {
        const parsed = JSON.parse(`{${responseText}}`);
        results = parsed.resources;
      } else {
        // Try parsing directly as array
        results = JSON.parse(responseText);
      }
      
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
        ['article', 'video', 'tutorial'].includes(result.type) &&
        ['beginner', 'intermediate', 'advanced'].includes(result.difficulty);

      if (!isValid) {
        console.error('Invalid result object:', result);
      }

      return isValid;
    });

    console.log(`Found ${validResults.length} valid results out of ${results.length} total`);

    if (validResults.length === 0) {
      throw new Error('No valid results found in response');
    }

    return validResults;
  } catch (error) {
    console.error('Resource search failed:', error);
    throw error;
  }
};

module.exports = {
  searchResources
}; 