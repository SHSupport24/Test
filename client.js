const PROXY_BASE = 'https://tracking-proxy.onrender.com'; // Deine echte Proxy-URL eintragen
const API_KEY = 'xlogsga5-8jha-ch20-l4re-nqd4k9fphxxh';

// 📦 Trackingnummer aus Beschreibung extrahieren
function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

// 🔍 Automatisch den Carrier erkennen
async function detectCarrier(trackingNumber) {
  try {
    const res = await fetch('https://api.trackingmore.com/v4/carriers/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': API_KEY
      },
      body: JSON.stringify({ tracking_number: trackingNumber })
    });

    const data = await res.json();
    const carrier = data.data?.[0]?.code;
    return carrier || null;
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

// 🛠️ Power-Up Initialisierung
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