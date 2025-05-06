/*  netlify/functions/generatePitch.js  – Hugging Face version that
    returns ONLY the blurb
*/
const HF_TOKEN = process.env.HF_API_TOKEN;
const HF_ENDPOINT =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

exports.handler = async function (event) {
  const { name, company } = JSON.parse(event.body || "{}");
  if (!name || !company) {
    return { statusCode: 400, body: '{"error":"Missing recruiter name or company"}' };
  }

  const prompt = `
<s>[INST]You write short, friendly cover-letter blurbs.[/INST]
Write one paragraph (80-120 words) explaining why Jon would be an excellent hire for ${company}, addressed to ${name}. 
Be warm but professional.[/s]`;

  const hfRes = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 120,
        temperature: 0.7,
        return_full_text: false      // ←  suppresses prompt echo
      }
    })
  });

  if (!hfRes.ok) {
    const txt = await hfRes.text();
    return { statusCode: hfRes.status, body: JSON.stringify({ error: txt }) };
  }

  const [{ generated_text }] = await hfRes.json();
  const pitch = generated_text.trim();        // prompt is already gone
  return { statusCode: 200, body: JSON.stringify({ pitch }) };
};
