const https = require('https');

const lambdaUrl = 'https://n3yf6j9xdj.execute-api.ap-southeast-1.amazonaws.com/default/processPronunciationAudio';

const postData = JSON.stringify({
  audioData: 'test',
  contentType: 'audio/webm'
});

const options = {
  hostname: 'n3yf6j9xdj.execute-api.ap-southeast-1.amazonaws.com',
  path: '/default/processPronunciationAudio',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== Response Body ===');
    console.log(data);
    console.log('\n=== End Response Body ===');
    
    if (data.trim()) {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n=== Parsed JSON ===');
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('\n❌ Not valid JSON');
        console.log('Parse error:', e.message);
      }
    } else {
      console.log('\n❌ Empty response body');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end(); 