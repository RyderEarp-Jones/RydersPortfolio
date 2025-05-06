/*  netlify/functions/generatePitch.js
    Uses Hugging Face free-tier (≈5 000 pitches / month).
*/

const HF_TOKEN = process.env.HF_API_TOKEN;            // 1️⃣  ← set in Netlify

// Model: 7-B-parameter Mistral Instruct — fast & free
const HF_ENDPOINT =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

exports.handler = async function (event) {
  // ─── 2️⃣  Get form values ────────────────────────────────────────────────────
  const { name, company } = JSON.parse(event.body || "{}");
  if (!name || !company) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing recruiter name or company" })
    };
  }

  // ─── 3️⃣  Build prompt ───────────────────────────────────────────────────────
  const prompt = `
<s>[INST]You write short, friendly cover-letter blurbs.[/INST]
Write one paragraph (80-120 words) explaining why Jon would be an excellent hire for ${company}, addressed to ${name}. 
Be warm but professional.[/s]`;

  // ─── 4️⃣  Call Hugging Face API ──────────────────────────────────────────────
  const hfRes = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 120, temperature: 0.7 }
    })
  });

  if (!hfRes.ok) {
    const txt = await hfRes.text();
    console.error(txt);
    return { statusCode: hfRes.status, body: JSON.stringify({ error: txt }) };
  }

  const json = await hfRes.json();               // returns [{ generated_text: … }]
  const pitch = (json[0]?.generated_text || "").trim();

  // ─── 5️⃣  Send back to browser ───────────────────────────────────────────────
  return { statusCode: 200, body: JSON.stringify({ pitch }) };
};
