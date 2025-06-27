const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to your service account key JSON
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load your brands data
const brands = JSON.parse(fs.readFileSync(path.join(__dirname, 'brands.json'), 'utf8'));

async function uploadBrands() {
  for (const brand of brands) {
    const docId = brand.name.toLowerCase().replace(/\s+/g, '-');
    await db.collection('brands').doc(docId).set(brand, { merge: true });
    console.log(`Uploaded: ${brand.name}`);
  }
  console.log('All brands uploaded!');
  process.exit(0);
}

uploadBrands().catch(console.error); 