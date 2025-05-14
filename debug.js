const params = new URLSearchParams(window.location.search);
const tnr = params.get('tnr');
const carrier = params.get('carrier');

const debugURL = `https://tracking-proxy-server.onrender.com/raw?tnr=${tnr}&carrier=${carrier}`;

fetch(debugURL)
  .then(async res => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      document.getElementById('output').textContent = JSON.stringify(json, null, 2);
    } catch (e) {
      document.getElementById('output').textContent = '❌ Antwort war kein JSON:\n\n' + text;
    }
  })
  .catch(err => {
    document.getElementById('output').textContent = '❌ Fehler beim Laden: ' + err.message;
  });