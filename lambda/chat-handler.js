const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    if (!userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Create PNW hiking-specific prompt
    const prompt = `You are a knowledgeable Pacific Northwest hiking assistant. You specialize in trails, gear, weather, and safety for hiking in Washington and Oregon. 

Key areas of expertise:
- Popular trails: Mount Rainier, Olympic Peninsula, North Cascades, Columbia River Gorge
- Seasonal considerations: Rain, snow, mud seasons
- Essential gear: Rain protection, layers, sturdy boots, navigation
- Safety: Wildlife (bears, cougars), weather changes, creek crossings
- Trail conditions and permits

Provide helpful, accurate, and practical advice. Keep responses conversational and under 200 words.

User question: ${userMessage}

Response:`;

    // Call Bedrock Claude 3.5 Sonnet model
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: responseBody.content[0].text,
        timestamp: new Date().toISOString(),
        messageId: Date.now().toString()
      })
    };

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    });
    
    // Provide helpful error messages
    let errorMessage = 'Sorry, I encountered an issue. Please try again.';
    let statusCode = 500;
    
    if (error.name === 'ValidationException') {
      errorMessage = 'Invalid request format. Please check your message.';
      statusCode = 400;
    } else if (error.name === 'ThrottlingException') {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.name === 'AccessDeniedException') {
      errorMessage = 'Bedrock access denied. Please check model permissions.';
      statusCode = 403;
    } else if (error.name === 'ResourceNotFoundException') {
      errorMessage = 'Claude 3.5 Sonnet model not found. Please check model availability.';
      statusCode = 404;
    } else if (error.code === 'UnknownEndpoint') {
      errorMessage = 'Bedrock service not available in this region.';
      statusCode = 503;
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'UnknownError'
      })
    };
  }
};