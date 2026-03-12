const keyword = "아이폰 15 프로 자급제 구매";

const translatePrompt = `당신은 검색어에서 가장 핵심적인 이미지를 추출하는 AI입니다. 
    사용자가 입력한 검색어에 가장 잘 어울리는 고품질 무료 사진을 Unsplash에서 찾기 위해, 영어 검색어 2개를 추출하세요.
    1. primary: 검색어를 가장 잘 표현하는 구체적이고 감각적인 영어 단어 1~2개
    2. fallback: primary 검색 실패 시 사용할, 검색어의 상위 카테고리에 해당하는 매우 포괄적이고 대중적인 영어 단어 1~2개 (예: animal, nature, technology, business, food, health, interior, city, lifestyle 등 무조건 검색 결과가 수만 장씩 나오는 넓은 의미의 단어)
    
    예시:
    "강아지 여름 산책" -> {"primary": "dog walking", "fallback": "happy dog"}
    "척추 임플란트" -> {"primary": "hospital room", "fallback": "health"}
    "엘앤케이바이오" -> {"primary": "laboratory", "fallback": "science"}
    "삼성전자" -> {"primary": "semiconductor", "fallback": "technology"}
    "다이어트 식단" -> {"primary": "healthy salad", "fallback": "diet food"}

    반드시 아래 JSON 형식으로만 응답하세요. 다른 문장 부호나 설명은 절대 붙이지 마세요.
    {"primary": "...", "fallback": "..."}
    
    사용자 검색어: ${keyword}`;

const { GoogleGenAI } = require("@google/genai");

// You will need to export GEMINI_API_KEY into the terminal
const ai = new GoogleGenAI({});

async function test() {
    const transRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: translatePrompt,
      config: { temperature: 0.1, responseMimeType: "application/json" },
    });
    
    // 영어 키워드 정제
    let searchParams = { primary: "office", fallback: "business" };
    try {
      const cleanText = (transRes.text || "{}").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      console.log("Gemini Raw:", cleanText);
      const parsed = JSON.parse(cleanText);
      if (parsed.primary && parsed.fallback) {
        searchParams = parsed;
      }
    } catch (e) {
      console.error("Failed to parse translatePrompt JSON:", e);
    }

    console.log("Parsed Search Params:", searchParams);

    async function fetchUnsplashImages(kw) {
        try {
          const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(kw)}&per_page=3&orientation=landscape`);
          if (res.ok) {
            const json = await res.json();
            if (json.results && json.results.length >= 3) {
              return json.results.slice(0, 3).map(r => r.urls.regular);
            }
          }
        } catch (e) {
          console.error("Unsplash fetch error:", e);
        }
        return [];
    }

    let imageUrls = await fetchUnsplashImages(searchParams.primary);
    console.log(`Primary (${searchParams.primary}) images:`, imageUrls.length);

    if (imageUrls.length < 3) {
       imageUrls = await fetchUnsplashImages(searchParams.fallback);
       console.log(`Fallback (${searchParams.fallback}) images:`, imageUrls.length);
    }
}
test();
