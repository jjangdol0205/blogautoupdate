import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ai = new GoogleGenAI({});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch(e) {}
    const { bannedKeywords = [] } = body;
    const bannedSection = bannedKeywords.length > 0 
      ? `\n[절대 금지 키워드 (이미 과거에 3번 이상 추출됨)]\n아래 키워드들은 절대로 다시 제안하지 마세요: ${bannedKeywords.join(', ')}\n` 
      : "";

    const prompt = `
당신은 대한민국 최고의 스포츠 전문 블로거(야구/농구 특화)입니다.
현재 구글 검색(Google Search)을 실시간으로 적극 활용하여, 오늘 날짜 기준으로 가장 뜨거운 글로벌 스포츠 핫이슈 **딱 3개**를 발굴해내세요.

[키워드 발굴 절대 원칙]
1. 타겟 스포츠: KBO(한국 프로야구), MLB(메이저리그), NBA(미국 프로농구) 등 다양한 분야를 아우르세요.
2. 초집중 타겟: **한국인 선수(손흥민, 이정후, 김하성 등), 일본인 선수(오타니, 야마모토 등)가 소속된 팀**의 극적인 명승부/기록 달성 이슈, 혹은 **KBO 출신 외국인 선수(역수출 외인 예: 에릭 페디, 크리스 플렉센, 메릴 켈리 등)**들의 최신 MLB/해외 리그 활약상이나 소식을 최우선으로 다루세요.
3. 출력 형식 제한: 뻔한 팀의 이름보다는 상황이 구체적으로 묘사된 롱테일 키워드로 지어주세요. (예: "오타니 50홈런 달성", "이정후 멀티히트 하이라이트", "메릴 켈리 호투 분석", "에릭 페디 화이트삭스 데뷔전")
4. 가장 최신(오늘 또는 어제) 벌어진 실제 스포츠 뉴스를 기반으로 하세요.
${bannedSection}

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "발굴한 롱테일 스포츠 키워드",
      "reason": "왜 이 경기가 오늘 스포츠 팬들에게 가장 흥미로운지 전문가 시선의 짧은 코멘트 (1~2문장)"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        tools: [{ googleSearch: {} }]
      },
    });

    let trends = [];
    try {
      const jsonStr = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '{"trends":[]}';
      const parsed = JSON.parse(jsonStr);
      trends = parsed.trends || [];
      
      trends = trends.slice(0, 3);
      
    } catch (e: any) {
      console.error("Gemini JSON parse failed, text was:", response.text);
      return NextResponse.json({ error: `AI가 스포츠 트렌드를 분석하는 중 오류가 발생했습니다: JSON 형태가 아닙니다. (${e.message})` }, { status: 500 });
    }

    // 네이버 검색광고 API 연동 (트래픽 조회)
    const customerId = process.env.NAVER_AD_CUSTOMER_ID;
    const accessLicense = process.env.NAVER_AD_ACCESS_LICENSE;
    const secretKey = process.env.NAVER_AD_SECRET_KEY;

    if (customerId && accessLicense && secretKey && trends.length > 0) {
      const timestamp = Date.now().toString();
      const method = "GET";
      const path = "/keywordstool";
      const signature = crypto.createHmac("sha256", secretKey).update(`${timestamp}.${method}.${path}`).digest("base64");

      const hintKeywords = trends.map((t: any) => t.keyword.replace(/\s+/g, '')).slice(0, 5).join(',');
      const apiUrl = `https://api.naver.com${path}?hintKeywords=${encodeURIComponent(hintKeywords)}&showDetail=1`;

      const naverRes = await fetch(apiUrl, {
        method: "GET",
        headers: { 'X-Timestamp': timestamp, 'X-API-KEY': accessLicense, 'X-Customer': customerId, 'X-Signature': signature }
      });

      if (naverRes.ok) {
        const naverData = await naverRes.json();
        const keywordList = naverData.keywordList || [];
        
        trends = trends.map((t: any) => {
          const rawKw = t.keyword.replace(/\s+/g, '');
          const match = keywordList.find((k: any) => k.relKeyword === rawKw);
          if (match) {
             const pc = typeof match.monthlyPcQcCnt === 'string' && match.monthlyPcQcCnt.includes('<') ? 5 : (parseInt(match.monthlyPcQcCnt) || 0);
             const mob = typeof match.monthlyMobileQcCnt === 'string' && match.monthlyMobileQcCnt.includes('<') ? 5 : (parseInt(match.monthlyMobileQcCnt) || 0);
             t.monthlyTotalCnt = pc + mob;
          } else {
             t.monthlyTotalCnt = 0; 
          }
          return t;
        });
      }
    }

    return NextResponse.json({ trends });

  } catch (error: any) {
    console.error("Agent Sports Error:", error);
    return NextResponse.json({ error: `스포츠 트렌드 마이닝 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}` }, { status: 500 });
  }
}
