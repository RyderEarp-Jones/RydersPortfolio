const form   = document.getElementById('pitchForm');
const output = document.getElementById('output');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  output.textContent = '⏳ Working…';

  try {
    const r = await fetch('/.netlify/functions/generatePitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    form.name.value.trim(),
        company: form.company.value.trim()
      })
    });
    const { pitch, error } = await r.json();
    output.textContent = error ?? pitch;
  } catch {
    output.textContent = 'Something went wrong 😞';
  }
});
