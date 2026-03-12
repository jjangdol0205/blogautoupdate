const fs = require('fs');

fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keyword: "강아지 여름 산책", tone: "전문적인 정보 나열 (~습니다/합니다)" })
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.error("Error:", data.error);
  } else {
    fs.writeFileSync('test_output.html', data.content);
    console.log("Wrote test_output.html");
  }
})
.catch(err => console.error("Fetch error:", err));
