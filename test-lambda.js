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
    console.log('Response body:');
    console.log(data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', jsonData);
    } catch (e) {
      console.log('Not valid JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end(); 