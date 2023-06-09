const express = require('express');
const app = express();
require('dotenv').config();
const firebase = require('firebase-admin');
require('ejs');
app.set('view engine', 'ejs');

SENSORS_INFO = {
  light: {
    name: 'Luminosité',
    unit: 'Lux',
    seriesType: 'line'
  },
  temp: {
    name: 'Température',
    unit: '°C',
    seriesType: 'line'
  },
  noise: {
    name: 'Bruit',
    unit: 'dB',
    seriesType: 'line'
  },
  hum: {
    name: 'Humidité',
    unit: '%',
    seriesType: 'line'
  },
  co: {
    name: 'CO',
    unit: 'ppm',
    seriesType: 'line'
  },
  no2: {
    name: 'NO2',
    unit: 'ppm',
    seriesType: 'line'
  },
  weight: {
    name: 'Poids',
    unit: 'kg',
    seriesType: 'column'
  }
};

// We rebuild the service account configuration from the environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
};

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL
});

const db = firebase.database();

app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
  db.ref(`beehives/`)
    .get()
    .then((snapshot) => {
      beehivesData = snapshot.val();
      response.render(__dirname + '/views/index.ejs', beehivesData);
    });
});

app.get('/beehives/:id', (request, response) => {
  const beehiveId = request.params.id;
  const beehiveIndex = beehiveId.replace('bee', '');
  request.app.locals.SENSORS_INFO = SENSORS_INFO;
  db.ref(`beehives/${beehiveId}/data`)
    .get()
    .then((snapshot) => {
      const beehiveData = snapshot.val();
      // Object.values(beehiveData).forEach((element) => {
      //   element.dateTime = new Date(element.dateTime).toLocaleString('fr-FR').split(' à ').join(' ');
      // });
      response.render(__dirname + '/views/beehive.ejs', { beehiveData, beehiveId, beehiveIndex });
    });
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log(`✨ App running on http://127.0.0.1:${listener.address().port}`);
});
