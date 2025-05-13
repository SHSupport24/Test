const API_KEY = 'xlogsga5-8jha-ch20-l4re-nqd4k9fphxxh';
const API_BASE = 'https://api.trackingmore.com/v4';

// Trackingnummer aus Beschreibung holen
function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

// Trackingdaten abrufen
function fetchTrackingStatus(trackingNumber) {
  return fetch(`${API_BASE}/trackings/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Tracking-Api-Key': API_KEY
    },
    body: JSON.stringify({
      tracking_numbers: [trackingNumber]
    })
  })
  .then(res => res.json())
  .then(data => {
    const info = data.data?.items?.[0];
    return info ? info.tag : 'Unbekannt';
  })
  .catch(err => {
    console.error('API Fehler:', err);
    return 'Fehler';
  });
}

// Hauptfunktion für Button-Aktion
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

// Trello Power-Up initialisieren
window.TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [{
      icon: 'https://test-iota-self-48.vercel.app/icon.png',
      text: 'Paketstatus',
      callback: function(t) {
        return showTrackingStatus(t); // direkte Funktionsreferenz
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