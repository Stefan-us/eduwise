const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

const generateSearchPrompt = (query, filters = {}, limit = 6) => {
  const filterText = filters.type || filters.level 
    ? `\nFilters:
       ${filters.type ? `- Type: ${filters.type}` : ''}
       ${filters.level ? `- Level: ${filters.level}` : ''}`
    : '';

  return `You are an educational resource finder for EduWise, a learning management system. Your task is to recommend ${limit} high-quality learning resources based on the user's query.

Guidelines:
- Focus on reputable educational sources (e.g., Khan Academy, Coursera, MIT OpenCourseWare)
- Ensure resources are accessible online and free when possible
- Provide diverse resource types (unless filtered)
- Include clear, concise descriptions
- Match difficulty level to user requirements
- Verify resource relevance to query

Format your response as a JSON array with schema:
[{
  "title": string,       // Clear, descriptive title
  "description": string, // 2-3 sentence summary
  "url": string,        // Direct link to resource
  "type": "article" | "video" | "tutorial",
  "difficulty": "beginner" | "intermediate" | "advanced"
}]

Search query: "${query}"${filterText}

Important: Your response must be a valid JSON array. Each object must have exactly these fields with the specified types.`;
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
        stream: false
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
      results = JSON.parse(data.response);
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