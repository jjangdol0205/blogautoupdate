const https = require('https');

https.get('https://blog.naver.com/PostView.naver?blogId=anytingint&logNo=224225015150', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('naver_post.html', data);
    console.log('Saved to naver_post.html');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
