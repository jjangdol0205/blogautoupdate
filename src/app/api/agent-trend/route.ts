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

[크리에이터 어드바이저 기반 타겟 분석 (학습 데이터: 최신 4월 14일자 패턴 적용)]
- IT/컴퓨터(단기 꿀팁/플랫폼): '차량 5부제 요일(new)', '카카오톡 멀티프로필/차단 확인방법', '아이폰 잠금화면 캘린더/통화녹음', '클로드 AI'
- 상품리뷰(쿠팡 핫딜/카페 신상): '컴포즈 바닐라크림라떼/너티크림라떼(new)', '쿠팡체험단/쿠팡 럭스 추천템(new)', '두근두근 1등/두근두근1등찍기(new)', '스모크 비프립 와퍼', '발렌타인 30년산 가격', '코스트코 추천상품'

[🚨 두 번째 블로그(Blog2) 핵심 미션: 쿠팡/컴포즈 핫딜 리뷰 + 앱테크/꿀팁 사냥 🚨]
- 생활 밀착 커머스/F&B 리뷰(50%): 마트에서 **'쿠팡(로켓 럭스/체험단)'** 중심의 온라인 꿀팁과 **'컴포즈 바닐라크림라떼'** 등 가성비 프랜차이즈 신메뉴 리뷰로 트렌드가 이동했습니다. 2030 여성이 열광하는 가성비 디저트/쇼핑 팁을 집중 발굴하세요.
- 생활 밀착 앱테크/유틸(50%): **'두근두근 1등(토스/케이뱅크 등 앱테크 이벤트)'**, **'차량 5부제 요일 계산기'** 등 일상에서 바로 돈이 되거나 시간을 아껴주는 소소한 유틸리티 정보를 빠르게 선점하세요.
- 제목 후킹 요소: 스펙 나열이 아닌, **"결국 품절", "당첨 확률 20배 올리는법", "쿠팡 체험단 꿀팁", "이거 모르면 나만 손해", "월 O만원 아끼는법"** 등의 후킹 요소를 결합하세요.

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

[크리에이터 어드바이저 건강/의학 타겟 분석 (학습 데이터: 최신 4월 14일자 패턴 적용)]
- 국소 부위 통증/질환/계절병: '중국발 눈병', '갑상선암 증상', '당뇨 초기증상', '혈압정상수치/낮추는법', '왼쪽 아랫배/옆구리 통증', '꽃가루지수'
- 천연 식품 및 제철 영양소: '두릅효능', '마그네슘/알부민 효능', '올리브오일/아보카도/머위 효능', '대장내시경 전 음식'
- 의약품/기타: '아젤리아크림', '사랑니 발치후 식사', '마운자로 가격'

[🚨 세 번째 블로그(Blog3) 핵심 미션: 4060 기초 건강 수치 집착 + 봄철 식품 효능 🚨]
- 타겟팅 포인트: **'혈압 정상수치', '혈압 낮추는법', '당뇨 초기증상'** 등 중장년층이 매일같이 걱정하고 측정하는 가장 원초적인 대사증후군/수치 관련 정보를 심도 깊게 타겟팅하세요.
- 건강기능식품 & 식단 융합: '당뇨가 있다면 절대 먹으면 안되는 봄나물(두릅)', '혈압을 10이나 낮춰주는 올리브오일 먹는법' 등 기저질환자와 천연 식품/영양제를 조합한 강력한 제목을 만드세요.
- 제목 후킹 규칙: 반드시 **"방치하면 큰일", "의사들이 절대 안먹는", "초기증상 무시했다가", "이 수치 넘으면 당장 병원가야", "혈관을 병들게 하는"** 식의 직관적이고 강력한 건강 썸네일용 텍스트를 기획하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "4060 세대의 강렬한 클릭을 유도할 건강/웰니스/통증/수치 관련 메가 롱테일 키워드",
      "reason": "왜 이 건강 키워드가 4060 사람들의 절박한 검색 니즈(결핍)를 건드리는지 분석 (1~2문장)"
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

[크리에이터 어드바이저 타겟 분석 (학습 데이터: 최신 4월 14일자 패턴 적용)]
- 비즈니스/경제(일자리/증시/지원금): 'SK하이닉스 킹산직 공채 조건(new)', '하이스닉스/양자 관련주(new)', 'ISA 계좌 단점', '2026 민생지원금', '출국납부금 환급/고유가 피해지원금'
- 사회/정치/사건사고(핫이슈): '과즙세연, BJ 케이 열애 발표(new)', '아다치 유키 실종(new)', '홍익대 박성범(new)', '최충연(new)', '노동절 법정공휴일(new)', '실업급여조건(new)'

[🚨 첫 번째 블로그(Blog1) 핵심 미션: 일자리/실업급여 + 인플루언서 가십 어그로 극대화 🚨]
- 80% 집중: 부동산 청약에서 다시 **'양질의 일자리(SK하이닉스 공채)'** 및 노동 이슈('노동절 휴무', '실업급여조건')로 흐름이 넘어왔습니다. 이런 대중의 실질적 근로복지 혜택과 **'과즙세연 열애', '아다치 유키 실종', '홍대 박성범'** 같은 인터넷 방송인/유명인의 실검 1위급 핫이슈를 집중 공략하세요.
- 20% 신규 시도: 'SK하이닉스 주가', '양자 관련주' 같은 증시 핫트렌드나 'ISA 계좌 단점(부정적 프레임)'을 분석해보세요.
- 제목 후킹과 팩트: 5개 키워드 모두 **"99%가 모르는 단점", "월 O만원 혜택", "충격적인 목격담", "연봉 1억 조건", "합격 스펙"** 등 취업에 대한 갈망이나 열애설에 대한 관음증을 최대한 자극하는 워딩을 필수 포함하세요.

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
