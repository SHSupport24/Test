const PROXY_BASE = 'http://localhost:3000/track';
const CARRIER_CODE = 'dpd';

function extractTrackingNumber(card) {
  const regex = /\b\d{10,20}\b/;
  const match = card.name.match(regex);
  return match ? match[0] : null;
}

async function fetchTrackingStatus(tnr) {
  const url = `${PROXY_BASE}?tnr=${tnr}&carrier=${CARRIER_CODE}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unbekannter Fehler beim Abrufen des Trackingstatus.');
    }
    const data = await response.json();
    return data.status;
  } catch (err) {
    console.error('Fetch-Fehler:', err);
    throw err;
  }
}

function showTrackingStatus(tnr, status, t) {
  t.popup({
    title: `Tracking-Status für ${tnr}`,
    url: 'tracking-status.html',
    height: 150,
    args: { status }
  });
}

function openDebugModal(t) {
  t.popup({
    title: 'Debug-Informationen',
    url: 'debug.html',
    height: 200,
    args: {}
  });
}

TrelloPowerUp.initialize({
  'card-badges': function (t, options) {
    return t.card('name')
      .then(function (card) {
        const tnr = extractTrackingNumber(card);
        if (!tnr) {
          return [];
        }
        return fetchTrackingStatus(tnr)
          .then(function (status) {
            return [{
              text: status,
              color: status === 'Delivered' ? 'green' : 'yellow',
              refresh: 10
            }];
          })
          .catch(function () {
            return [{
              text: 'Fehler',
              color: 'red',
              refresh: 10
            }];
          });
      });
  },
  'card-buttons': function (t, options) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/1250/1250683.png',
      text: 'Tracking-Status anzeigen',
      callback: function (t) {
        return t.card('name')
          .then(function (card) {
            const tnr = extractTrackingNumber(card);
            if (!tnr) {
              return t.alert({ message: 'Keine gültige Trackingnummer gefunden.' });
            }
            return fetchTrackingStatus(tnr)
              .then(function (status) {
                showTrackingStatus(tnr, status, t);
              })
              .catch(function (err) {
                t.alert({ message: 'Fehler beim Abrufen des Trackingstatus.' });
              });
          });
      }
    }, {
      icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png',
      text: 'Debug',
      callback: function (t) {
        openDebugModal(t);
      }
    }];
  }
});
