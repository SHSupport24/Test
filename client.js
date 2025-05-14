const PROXY_BASE = 'https://tracking-proxy-server.onrender.com'; // Deine Proxy-URL
const CARRIER_CODE = 'dhl'; // AfterShip verwendet 'dhl' für DHL Germany

// 📦 Trackingnummer extrahieren
function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

// 🚚 Trackingstatus von DHL holen
async function fetchTrackingStatus(trackingNumber) {
  try {
    const res = await fetch(`${PROXY_BASE}/track?tnr=${trackingNumber}&carrier=${CARRIER_CODE}`);
    const data = await res.json();
    return data.status || 'Unbekannt';
  } catch (err) {
    console.error('AfterShip-Statusabruf fehlgeschlagen:', err);
    return 'Fehler';
  }
}

// ⚡ Zeige Status beim Buttonklick
async function showTrackingStatus(t) {
  const desc = await t.card('desc').get('desc');
  const trackingNumber = extractTrackingNumber(desc);

  if (!trackingNumber) {
    return t.alert({ message: 'Keine Trackingnummer gefunden.' });
  }

  const status = await fetchTrackingStatus(trackingNumber);
  return t.alert({
    message: `📦 DHL-Status für ${trackingNumber}: ${status}`
  });
}

// 🛠️ Trello Power-Up Setup
window.TrelloPowerUp.initialize({
  'card-buttons': function(t) {
    return [{
      icon: 'https://test-iota-self-48.vercel.app/icon.png',
      text: 'DHL-Status',
      callback: function(t) {
        return showTrackingStatus(t);
      }
    }];
  },

  'card-badges': function(t) {
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