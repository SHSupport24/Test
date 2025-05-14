const params = new URLSearchParams(window.location.search);
const tnr = params.get('tnr');
const carrier = params.get('carrier');

const debugURL = `https://tracking-proxy-server.onrender.com/raw?tnr=${tnr}&carrier=${carrier}`;

fetch(debugURL)
  .then(res => res.json())
  .then(data => {
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  })
  .catch(err => {
    document.getElementById('output').textContent = '❌ Fehler beim Laden: ' + err.message;
  });