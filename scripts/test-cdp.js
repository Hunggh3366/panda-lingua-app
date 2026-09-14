import http from 'http';

const req = http.get('http://127.0.0.1:52955/json/version', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('CDP Browser Version:', data);
  });
});

req.on('error', (err) => {
  console.log('CDP Error:', err.message);
});
