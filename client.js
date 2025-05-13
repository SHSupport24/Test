const PROXY_BASE = 'https://tracking-proxy-server.onrender.com'; // DEINE URL hier einsetzen

// Trackingnummer aus Beschreibung holen
function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

// Trackingstatus über Proxy-Server abfragen
function fetchTrackingStatus(trackingNumber) {
  const url = `${PROXY_BASE}/track?tnr=${trackingNumber}&carrier=dhl`;

  return fetch(url)
    .then(res => res.json())
    .then(data => data.status || 'Unbekannt')
    .catch(err => {
      console.error('Proxy Fehler:', err);
      return 'Fehler';
    });
}

// Buttonfunktion: Status anzeigen
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

// Trello Power-Up Initialisierung
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