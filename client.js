var PROXY_BASE = 'https://your-proxy-server.com'; // Ersetze durch deine Proxy-URL
var CARRIER_CODE = 'your-carrier-code'; // Ersetze durch den tatsächlichen Carrier-Code

var Promise = TrelloPowerUp.Promise;

TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [
      {
        icon: 'https://cdn-icons-png.flaticon.com/512/2917/2917993.png',
        text: 'Tracking-Status anzeigen',
        callback: function(t) {
          return showTrackingStatus(t);
        }
      },
      {
        icon: 'https://cdn-icons-png.flaticon.com/512/565/565547.png',
        text: 'Debug',
        callback: function(t) {
          return openDebugModal(t);
        }
      }
    ];
  },

  'card-badges': function(t, options) {
    return fetchTrackingStatus(t)
      .then(function(status) {
        return [{
          text: status,
          color: status === 'delivered' ? 'green' : 'yellow',
          refresh: 10 // in seconds
        }];
      })
      .catch(function() {
        return [];
      });
  }
});

function extractTrackingNumber(t) {
  return t.card('name')
    .get('name')
    .then(function(name) {
      var match = name.match(/\b[A-Z0-9]{10,}\b/);
      return match ? match[0] : null;
    });
}

function fetchTrackingStatus(t) {
  return extractTrackingNumber(t)
    .then(function(tnr) {
      if (!tnr) {
        return Promise.reject('Keine Trackingnummer gefunden.');
      }
      var url = PROXY_BASE + '/track?tnr=' + encodeURIComponent(tnr) + '&carrier=' + encodeURIComponent(CARRIER_CODE);
      return fetch(url)
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Fehler beim Abrufen des Status');
          }
          return response.json();
        })
        .then(function(data) {
          return data.status || 'unbekannt';
        });
    });
}

function showTrackingStatus(t) {
  return fetchTrackingStatus(t)
    .then(function(status) {
      return t.popup({
        title: 'Tracking-Status',
        url: './status-popup.html',
        args: { status: status },
        height: 150
      });
    })
    .catch(function(err) {
      return t.popup({
        title: 'Fehler',
        url: './error-popup.html',
        args: { message: err.toString() },
        height: 150
      });
    });
}

function openDebugModal(t) {
  return t.modal({
    url: './debug.html',
    title: 'Debug Informationen',
    height: 300,
    fullscreen: false
  });
}
 