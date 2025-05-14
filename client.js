const PROXY_BASE = 'https://tracking-proxy-server.onrender.com';
const CARRIER_CODE = 'dhl';

function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

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

async function showTrackingStatus(t) {
  const desc = await t.card('desc').get('desc');
  const trackingNumber = extractTrackingNumber(desc);
  if (!trackingNumber) {
    return t.alert({ message: 'Keine Trackingnummer gefunden.' });
  }

  const status = await fetchTrackingStatus(trackingNumber);
  return t.alert({ message: `📦 DHL-Status für ${trackingNumber}: ${status}` });
}

async function openDebugModal(t) {
  const desc = await t.card('desc').get('desc');
  const trackingNumber = extractTrackingNumber(desc);
  if (!trackingNumber) {
    return t.alert({ message: 'Keine Trackingnummer gefunden.' });
  }

  return t.modal({
    url: `https://test-iota-self-48.vercel.app/debug.html?tnr=${trackingNumber}&carrier=${CARRIER_CODE}`,
    fullscreen: false,
    title: '📄 Debugdaten anzeigen',
  });
}

window.TrelloPowerUp.initialize({
  'card-buttons': function(t) {
    return [
      {
        icon: 'https://cdn-icons-png.flaticon.com/512/3523/3523885.png',
        text: 'DHL-Status',
        callback: showTrackingStatus
      },
      {
        icon: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png',
        text: '📄 Debug',
        callback: openDebugModal
      }
    ];
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
          color: status === 'Delivered' ? 'green' : 'yellow'
        }];
      });
  }
});