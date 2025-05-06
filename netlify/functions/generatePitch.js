// netlify/functions/generatePitch.js  (CommonJS)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async function (event) {
  const { name, company } = JSON.parse(event.body || '{}');

  if (!name || !company) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing recruiter name or company' })
    };
  }

  // Call OpenAI directly with fetch (Node 18+ has it built-in)
  const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-0125',         // safe model everyone has
      messages: [
        { role: 'system', content: 'You write short, friendly cover-letter blurbs.' },
        { role: 'user',   content:
          `Write one paragraph (80-120 words) explaining why Jon would be an excellent hire for ${company}, addressed to ${name}.` }
      ]
    })
  });

  if (!aiRes.ok) {
    const txt = await aiRes.text();
    console.error(txt);
    return { statusCode: aiRes.status, body: JSON.stringify({ error: txt }) };
  }

  const data = await aiRes.json();
  return { statusCode: 200, body: JSON.stringify({ pitch: data.choices[0].message.content }) };
};
