import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ai = new GoogleGenAI({});

export const maxDuration = 60; // Vercel 서버리스 함수 타임아웃 최대 연장

export async function POST(req: Request) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch(e) {}
    const { goodUrl, badUrl, bannedKeywords = [], style, coreKeyword } = body;

    let feedbackLearningGuidance = "";
    if (goodUrl || badUrl) {
      feedbackLearningGuidance += `
[개인화된 맞춤형 타겟팅 지침]
사용자가 과거 작성한 블로그 피드백 주소입니다. 이 블로그의 톤앤매너와 주요 주제(니치)를 분석하고, 사용자의 전문 분야에 맞는 트렌드 키워드를 발굴하세요.
`;
      if (goodUrl) feedbackLearningGuidance += `- 성공 사례(이 분야 위주로 발굴): ${goodUrl}\n`;
      if (badUrl) feedbackLearningGuidance += `- 실패 사례(이 분야와 유사한 포괄적 키워드는 배제): ${badUrl}\n`;
    }
    const bannedSection = bannedKeywords.length > 0 
      ? `\n[절대 금지 키워드 (이미 과거에 3번 이상 추출됨)]\n아래 키워드들은 절대로 다시 제안하지 마세요: ${bannedKeywords.join(', ')}\n` 
      : "";

    let prompt = "";
    
    if (style === 'blog2') {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터이자, **'IT/테크 기기 및 생활/가전/상품 꿀템'**을 전문으로 다루는 "자동봇 2호기(두 번째 블로그)" 편집장입니다.
현재 목표는 20~40대 남녀 직장인 및 주부들이 무조건 클릭하게 만드는 생활 밀착형 대박 롱테일 키워드 5개를 발굴하는 것입니다.
${bannedSection}
${feedbackLearningGuidance}

[크리에이터 어드바이저 기반 타겟 분석 (학습 데이터: 최신 4월 13일자 패턴 적용)]
- IT/컴퓨터(단기 꿀팁/플랫폼): 'adsp 시험일정(new)', '카카오톡 업데이트/멀티프로필/차단 확인방법(new)', '컴퓨터 화면 캡쳐(new)', '클로드 가격', '아이폰 잠금화면 캘린더', '아이폰 통화녹음/18출시일'
- 상품리뷰(대형마트 핫딜/셀럽템): '코스트코 4월 할인상품/추천상품(new)', '이즈니 버터와플(new)', '비쎌 스팀청소기(new)', '요시 팝콘통', '김신영 연관템(도마/고구마칩)', '스모크 비프립 와퍼/매직풍 싸이버거', '스타벅스 신상(토이스토리/메뉴)'

[🚨 두 번째 블로그(Blog2) 핵심 미션: 필수 자격증 일정 + 카톡/PC 꿀팁 + 코스트코 대란템 사냥 🚨]
- IT 유틸/일정/숨은 기능(50%): 직장인 대상 정보가 매우 핫합니다. **'ADSP(데이터분석) 시험일정 및 꿀팁'**, **'카카오톡 업데이트 핵심/멀티프로필/차단확인'**, '초보자용 컴퓨터 화면 캡쳐 모음' 등 직장인 필수 단축키나 자격증 일정을 즉각 발굴하세요.
- 매트/신상 F&B 핫딜 리뷰(50%): **'코스트코 4월 할인상품 총정리'**, 대란 중인 **'이즈니 버터와플'**, 홈쇼핑 대박템 **'비쎌 스팀청소기'** 등 주부와 직장인 모두가 열광하는 커머스 핫딜 정보를 신속하게 리뷰 형식으로 소개하세요.
- 제목 후킹 요소: 스펙 나열이 아닌, **"결국 품절", "합격율 20% 올리는", "이거 모르면 직장생활 버거움", "4월 첫째주 무조건 쟁여둘", "코스트코 대란템"** 등의 후킹 요소를 결합하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "IT/가전/상품리뷰 카테고리의 조회수 폭발 강력한 롱테일 키워드",
      "reason": "왜 이 키워드가 일상적인 검색 니즈와 결핍을 완벽히 자극하는지(1~2문장)"
    }
  ]
}
`;
    } else if (style === 'blog3') {
      prompt = `
당신은 대한민국 4060 세대의 폭발적인 공감을 이끌어내는 **'건강/의학 및 웰니스 전문 꿀팁'** 에디터입니다.
현재 구글 검색(Google Search)을 능동적으로 활용하여 일상 통증, 성인병, 최신 다이어트/신약 트렌드 등을 결합한 한방에 엄청난 트래픽을 끌어올 메가 트렌드 롱테일 키워드 5개를 추론해내세요.
${bannedSection}

[크리에이터 어드바이저 건강/의학 타겟 분석 (학습 데이터: 최신 4월 13일자 패턴 적용)]
- 국소 부위 통증/질환/계절병: '꽃가루지수(new)', '중국발 눈병', '대상포진증상', '당뇨 초기증상', '혈압정상수치', '왼쪽 아랫배/옆구리 통증'
- 천연 식품 및 제철 영양소: '두릅효능(new)', '마그네슘/알부민 효능', '올리브오일/아보카도/머위 효능', '대장내시경 전 음식'
- 의약품 트렌드: '아젤리아크림', '사랑니 발치후 식사'

[🚨 세 번째 블로그(Blog3) 핵심 미션: 봄철 4060 건강 고민 즉각 해결 + 제철 음식 효능 🚨]
- 타겟팅 포인트: 따뜻해진 날씨로 인한 **'꽃가루 알레르기 수치/대처법', '봄나물(두릅) 효능'** 등 계절성 맞춤 건강 정보가 폭발적입니다. 봄철 유행하는 면역 질환인 '대상포진 초기증상'과 엮어도 좋습니다.
- 건강기능식품 & 식단 융합: '간에 좋은 제철 봄나물', '대장내시경 전 절대 먹으면 안 되는 음식', '꽃가루/황사 이겨내는 기적의 식단' 등 식품과 건강을 조합한 강력한 제목을 만드세요.
- 제목 후킹 규칙: 반드시 **"방치하면 큰일", "봄철 생명 위협", "초기증상 무시했다가", "검사 전 필수 확인", "의사도 극찬한"** 식의 직관적이고 강력한 건강 썸네일용 텍스트를 기획하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "4060 세대의 강렬한 클릭을 유도할 건강/웰니스/통증/계절병 관련 메가 롱테일 키워드",
      "reason": "왜 이 건강 키워드가 4060 사람들의 절박한 검색 니즈(봄철 결핍)를 건드리는지 분석 (1~2문장)"
    }
  ]
}
`;
    } else {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)입니다.
현재 구글 검색(Google 경유)을 실시간으로 활용하여, **네이버 홈판 경제/사회/이슈 탭에 올라갈 수 있을 만큼 전국민적인 폭발력을 가진 '메가 황금 트렌드/롱테일 키워드' 딱 5개**를 능동적으로 추론하고 발굴해내세요.
${bannedSection}
${feedbackLearningGuidance}

[사용자 지정 핵심 주제]
- 오늘 집중 탐색할 주제: ${coreKeyword ? `"${coreKeyword}"` : "'대중의 지갑 사정과 연결된 폭발적인 재테크/사회/정치 뉴스'"}

[크리에이터 어드바이저 타겟 분석 (학습 데이터: 최신 4월 13일자 패턴 적용)]
- 비즈니스/경제(청약/지원금/부동산): '오티에르 반포 청약 단지/분양가', '강동헤리티지자이', '라클라체자이드파인(new)', '어반클라쎄목동(new)', '2026 민생지원금/청년미래적금', '출국납부금 환급'
- 사회/정치/사건사고(핫이슈): '청주 봉명동 가스폭발(new)', '이천 한식뷔페 곰팡이(new)', '경주 교통사고', '탄소배출권 거래제(new)', '이상렬 중장(new)', '과즙세연(new)', '지예은 바타 열애(new)', '김진 사망/유서'

[🚨 첫 번째 블로그(Blog1) 핵심 미션: 무순위 청약 + 강력 사건/사고/가십 🚨]
- 80% 집중: 무순위 청약(줍줍)에 대한 광기가 엄청납니다. **'오티에르 반포', '라클라체자이드파인', '어반클라쎄목동' 등 수억 차익이 보장되는 실제 아파트 청약/분양 정보**와 **위생 논란(이천 곰팡이 뷔페), 가스폭발(청주), 유명인 열애/가십** 등 가장 자극적이고 휘발성이 강한 핫이슈를 집중 배치하세요.
- 20% 신규 시도: '탄소배출권 거래제' 같은 신규 정책 이슈나 생활 정보 기사를 하나 섞으세요.
- 제목 후킹과 팩트: 5개 키워드 모두 **"99%가 손해보는", "오늘 마감", "현장 CCTV", "충격적인 위생상태", "수억 시세차익"** 등 분노/호기심/돈에 대한 욕망을 최대한 자극하는 워딩을 필수 포함하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "조회수 5만뷰 이상 폭발이 예상되는 정치/사회/경제/사건사고 강력한 롱테일 키워드",
      "reason": "왜 이 키워드가 네이버 메인에 선정될 확률이 높으며 대중이 무조건 클릭할 수밖에 없는지(1~2문장)"
    }
  ]
}
`;
    }

    let response;
    // 2.5 버전이 터졌을 경우, 가장 우수하고 안정적인 gemini-pro-latest를 최우선 투입합니다
    const fallbackModels = ["gemini-2.5-flash", "gemini-pro-latest", "gemini-flash-latest"];
    let attempt = 0;

    while (attempt < fallbackModels.length) {
      try {
        const currentModel = fallbackModels[attempt];
        
        // 마지막 최후의 보루 시도 시, 구글 검색 도구가 503 원인일 수 있으므로 검색 툴을 제거합니다.
        const currentConfig: any = {
           systemInstruction: "당신은 트렌드를 분석하는 AI입니다. 구글 검색 과정이나 원본 검색 데이터({'title': ...} 형태)를 절대 출력하지 마세요. 오직 사용자가 요청한 JSON 형식 문서만 출력해야 합니다.",
           temperature: 0.95, // 온도를 높여 더욱 다양하고 창의적인 키워드 도출 유도
        };
        if (attempt < fallbackModels.length - 1) {
           currentConfig.tools = [{ googleSearch: {} }];
        }

        response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: currentConfig,
        });
        break; // 성공 시 탈출
      } catch (err: any) {
        attempt++;
        const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE');
        const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
        
        if ((is503 || is429) && attempt < fallbackModels.length) {
           console.warn(`[Agent-Trend] 503/429 Error on ${fallbackModels[attempt-1]}. Waiting 2.5s before fallback to ${fallbackModels[attempt]}...`);
           await new Promise(resolve => setTimeout(resolve, 2500));
           continue; 
        } else {
           if (attempt >= fallbackModels.length) {
             throw new Error('현재 구글 AI 서버에 전 세계적인 과부하가 발생하여 모든 모델이 지연되고 있습니다. 1~2분 뒤에 다시 시도해주세요.');
           }
           throw new Error(err?.message || '알 수 없는 오류');
        }
      }
    }

    if (!response) {
      throw new Error('AI 응답을 받지 못했습니다.');
    }

    let trends = [];
    try {
      const jsonStr = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '{"trends":[]}';
      const parsed = JSON.parse(jsonStr);
      trends = parsed.trends || [];
      
      // 개수 제한 (만약 5개 이상이면 자름)
      trends = trends.slice(0, 5);
      
    } catch (e: any) {
      console.error("Gemini JSON parse failed, text was:", response.text);
      return NextResponse.json({ error: `AI가 트렌드를 분석하는 중 오류가 발생했습니다: JSON 형태가 아닙니다. (${e.message})` }, { status: 500 });
    }

    // 네이버 검색광고 API로 정확한 트래픽(월간 검색량) 조회
    const customerId = process.env.NAVER_AD_CUSTOMER_ID;
    const accessLicense = process.env.NAVER_AD_ACCESS_LICENSE;
    const secretKey = process.env.NAVER_AD_SECRET_KEY;

    if (customerId && accessLicense && secretKey && trends.length > 0) {
      const timestamp = Date.now().toString();
      const method = "GET";
      const path = "/keywordstool";
      const signature = crypto.createHmac("sha256", secretKey).update(`${timestamp}.${method}.${path}`).digest("base64");

      // Naver keyword hint accepts comma separated, max 5
      const hintKeywords = trends.map((t: any) => t.keyword.replace(/\s+/g, '')).slice(0, 5).join(',');
      const apiUrl = `https://api.naver.com${path}?hintKeywords=${encodeURIComponent(hintKeywords)}&showDetail=1`;

      const naverRes = await fetch(apiUrl, {
        method: "GET",
        headers: { 'X-Timestamp': timestamp, 'X-API-KEY': accessLicense, 'X-Customer': customerId, 'X-Signature': signature }
      });

      if (naverRes.ok) {
        const naverData = await naverRes.json();
        const keywordList = naverData.keywordList || [];
        
        // 맵핑: AI가 생성한 키워드의 띄어쓰기를 없앤 버전으로 네이버 결과 매칭
        trends = trends.map((t: any) => {
          const rawKw = t.keyword.replace(/\s+/g, '');
          const match = keywordList.find((k: any) => k.relKeyword === rawKw);
          if (match) {
             const pc = typeof match.monthlyPcQcCnt === 'string' && match.monthlyPcQcCnt.includes('<') ? 5 : (parseInt(match.monthlyPcQcCnt) || 0);
             const mob = typeof match.monthlyMobileQcCnt === 'string' && match.monthlyMobileQcCnt.includes('<') ? 5 : (parseInt(match.monthlyMobileQcCnt) || 0);
             t.monthlyTotalCnt = pc + mob;
          } else {
             t.monthlyTotalCnt = 0; // 네이버 데이터베이스에 아직 없거나 너무 적음
          }
          return t;
        });
      }
    }

    return NextResponse.json({ trends });

  } catch (error: any) {
    console.error("Agent Trend Error:", error);
    return NextResponse.json({ error: `트렌드 마이닝 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}` }, { status: 500 });
  }
}
