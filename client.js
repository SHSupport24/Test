const PROXY_BASE = 'https://tracking-proxy-server.onrender.com';

function extractTrackingNumber(description) {
  const match = description.match(/\b\d{8,}\b/);
  return match ? match[0] : null;
}

async function fetchTrackingStatus(trackingNumber, maxRetries = 3, delay = 4000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${PROXY_BASE}/track?tnr=${trackingNumber}`);
      const data = await res.json();
      if (data.status && data.status !== 'Unbekannt') {
        return data.status;
      }
    } catch (err) {
      console.error(`Versuch ${i + 1} fehlgeschlagen:`, err);
    }
    await new Promise(res => setTimeout(res, delay));
  }
  return 'Unbekannt';
}

async function showTrackingStatus(t) {
  const desc = await t.card('desc').get('desc');
  const trackingNumber = extractTrackingNumber(desc);
  if (!trackingNumber) {
    return t.alert({ message: '❌ Keine Trackingnummer gefunden.' });
  }

  // Zeige sofort Feedback und hole Daten im Hintergrund
  t.popup({
    title: 'Status wird geladen...',
    url: `https://test-iota-self-48.vercel.app/debug.html?tnr=${trackingNumber}`
  });

  fetchTrackingStatus(trackingNumber).then(async status => {
    await t.set('shared', 'status', status);
  });

  return;
}

async function openDebugModal(t) {
  const desc = await t.card('desc').get('desc');
  const trackingNumber = extractTrackingNumber(desc);
  if (!trackingNumber) {
    return t.alert({ message: 'Keine Trackingnummer gefunden.' });
  }

  return t.modal({
    url: `https://test-iota-self-48.vercel.app/debug.html?tnr=${trackingNumber}`,
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
    return t.get('shared', 'status').then(status => {
      if (!status) {
        return [{ text: '⏳ lädt...', color: 'grey' }];
      }
      return [{
        text: `📦 ${status}`,
        color: status === 'Delivered' ? 'green' : 'yellow'
      }];
    });
  }
});