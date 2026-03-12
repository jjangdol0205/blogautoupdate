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
    const imgMatches = data.content.match(/<img src="([^"]+)"/g) || [];
    console.log("Found Images:", imgMatches.length);
    console.log("Image tags:", imgMatches.join('\n'));
    if (new Set(imgMatches).size === imgMatches.length) {
      console.log("No duplicates found. Success!");
    } else {
      console.log("Duplicates found. Failure!");
    }
  }
})
.catch(err => console.error("Fetch error:", err));
