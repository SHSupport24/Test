const API_KEY = 'xlogsga5-8jha-ch20-l4re-nqd4k9fphxxh';
const API_BASE = 'https://api.trackingmore.com/v4';

// Extrahiert Trackingnummer aus der Kartenbeschreibung
function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/); // einfache Zahlenerkennung
  return match ? match[0] : null;
}

// Holt Trackingstatus von TrackingMore
function fetchTrackingStatus(trackingNumber) {
  return fetch(`${API_BASE}/trackings/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Tracking-Api-Key': API_KEY,
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

// Power-Up Registrierung
window.TrelloPowerUp.initialize({
  'card-buttons': function (t, options) {
    return [{
      icon: 'https://paketverfolgung-wo88.vercel.app/icon.png',
      text: 'Paketstatus',
      callback: async function(t) {
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
    }];
  },
  'card-badges': function (t, options) {
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