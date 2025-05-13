const t = TrelloPowerUp.iframe();

const API_KEY = 'xlogsga5-8jha-ch20-l4re-nqd4k9fphxxh';
const API_BASE = 'https://api.trackingmore.com/v4';

function extractTrackingNumber(description) {
  const match = description.match(/(?:\b\d{8,}\b)/);
  return match ? match[0] : null;
}

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
  .catch(() => 'Fehler');
}

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
        return t.modal({
          title: 'Paketstatus',
          url: './status.html',
          args: { status, trackingNumber },
          fullscreen: false
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