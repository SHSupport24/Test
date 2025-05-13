const PROXY_BASE = 'https://tracking-proxy.onrender.com'; // Deine echte Proxy-URL

// 📦 Trackingnummer aus Beschreibung extrahieren
function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

// 🔍 Carrier automatisch über Proxy erkennen
async function detectCarrier(trackingNumber) {
  try {
    const res = await fetch(`${PROXY_BASE}/detect?tnr=${trackingNumber}`);
    const data = await res.json();
    return data.carrier || null;
  } catch (err) {
    console.error('Carrier-Erkennung fehlgeschlagen:', err);
    return null;
  }
}

// 🚚 Status über Proxy-Server abfragen
async function fetchTrackingStatus(trackingNumber) {
  const carrier = await detectCarrier(trackingNumber);
  if (!carrier) return 'Unbekannter Carrier';

  try {
    const res = await fetch(`${PROXY_BASE}/track?tnr=${trackingNumber}&carrier=${carrier}`);
    const data = await res.json();
    return data.status || 'Unbekannt';
  } catch (err) {
    console.error('Proxy Fehler:', err);
    return 'Fehler';
  }
}

// ⚡ Buttonfunktion: Alert anzeigen
async function showTrackingStatus(t) {
  const desc = await t.card('desc').get('desc');
  const trackingNumber = extractTrackingNumber(desc);

  if (!trackingNumber) {
    return t.alert({ message: 'Keine Trackingnummer gefunden.' });
  }

  const status = await fetchTrackingStatus(trackingNumber);
  return t.alert({
    message: `Status für ${trackingNumber}: ${status}`
  });
}

// 🛠️ Trello Power-Up Initialisierung
window.TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [{
      icon: 'https://test-iota-self-48.vercel.app/icon.png',
      text: 'Paketstatus',
      callback: function(t) {
        return showTrackingStatus(t);
      }
    }];
  },

  'card-badges': function(t, options) {
    return t.card('desc')
      .get('desc')
      .then(async desc => {
        const trackingNumber = extractTrackingNumber(desc);
        if (!trackingNumber) return [];

        const status = await fetchTrackingStatus(trackingNumber);
        return [{
          text: `📦 ${status}`,
          color: 'blue'
        }];
      });
  }
});