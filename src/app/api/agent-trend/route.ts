import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ai = new GoogleGenAI({});

export const maxDuration = 300; // Vercel Pro 서버리스 함수 타임아웃 300초로 연장

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
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)이자, **'60대 및 비즈니스/경제 특화 메가 블로그'**를 운영하는 총괄 편집장입니다.
현재 이 블로그(두 번째 블로그)의 궁극적인 목표는 **'일 방문자 3만 명 이상 달성 (네이버 메인/홈판 장악)'**입니다.
이를 위해 철저히 **[크리에이터 어드바이저 데이터]**와 **[60대/경제 타겟]**에 기반하되, 자잘한 조회수가 아닌 한방에 **수십만 명이 검색할 초대형 메가 트렌드 롱테일 키워드 5개**를 발굴해야 합니다.
${bannedSection}
${feedbackLearningGuidance}

[사용자 지정 핵심 주제]
- 오늘 집중 탐색할 주제: ${coreKeyword ? `"${coreKeyword}"` : "'60대 관심사 및 비즈니스/경제'"}

[크리에이터 어드바이저 기반 타겟 분석 (학습 데이터: 4월 9일 최신 급상승 패턴)]
- 경제/증시/부동산: '오티에르 반포 (새로운 거물급 청약)', '이촌 르엘 청약', '강동헤리티지자이', '임장 뜻', '코스피·코스닥 상폐 경고 54곳', '삼성전자 주가/배당금', '광통신 관련주', '광전자', '2차전지 관련주', '대우건설', '시도그룹(NEW)', '삼천당제약'
- 정책/지원금/신상식: '2026 민생지원금', '청년미래적금', 'ISA 계좌', '대기 중 이산화탄소 농도(NEW)', '중동지도 / 이스라엘 레바논 지도(국제 정세 핫이슈)', '헤즈볼라 뜻', '영포티 뜻(초급상승)'
- 지역/핫플/축제: '비슬산 참꽃축제', '청주 빽다방'
- 앱테크/퀴즈 (매일 폭발적 연금술): '기후동행퀴즈4월9일 / 기후동행퀴즈', '옆커폰 퀴즈'
- 60대 라이프스타일/이슈:
  1. 화제/가십/방송: '무명전설 대이변, 서열 무너짐', '고현정 공항패션 논란 집중분석', '이진호, 뇌출혈 중환자실 치료중', '박서진 여동생, 교통사고 휠체어 신세', '미스트롯4 순위', '주지훈 하지원, 화장실 키스신'
  2. 핫이슈 인물: '김창민감독', '박상용 검사 프로필', '김지미 특검보'
  3. 시즈널/레시피 (극강의 스테디셀러): '파김치 / 쪽파김치 담그는법', '머위나물무침', '오이소박이 레시피', '방풍나물 무침'

[🚨 두 번째 블로그(Blog2) 핵심 미션: 일방문 3만 달성을 위한 60대/경제 분야 메가 트래픽 능동 추론 🚨]
- 방향성: 좁고 깊은 매니아 타겟뿐만 아니라, **네이버 홈판(메인)에 걸릴 수 있는 폭발력을 가진 대국민적(혹은 수백만 60대가 동시 접속할) 메가 트렌드**를 타겟팅합니다.
- 능동적 추론: 제공된 크리에이터 어드바이저 흐름을 읽고, **오늘(현재 날짜) 혹은 내일 당장 메인 포털을 장식할 만한 '예측 메가 키워드'**를 추론하세요.
[🔥 두 번째 블로그 - 조회수 폭발 성공 패턴 (2026.4.9 최신 급상승 검증) 🔥]
다음은 오늘(4/9) 기준 두 번째 블로그에서 엄청난 트래픽(합산 3,000방 이상)을 증명한 성적표 기반 패턴입니다.
1. **(압도적 1순위) 피부에 와닿는 다급한 구매/할인 혜택 (마감/예산 소진 턱밑):**
   - 대박 사례: "온누리상품권 10% 할인 4월 종료 임박? 예산 소진 전 60대 부모님 지류(종이) 구매가 정답인 이유" (단일 글 1,120회, 시리즈 합산 3,300회 이상 폭주)
   - 타겟팅: "소상공인 정책" 같은 막연한 뉴스보다, 당장 내 지갑에서 돈이 나가는 걸 막아주는 실생활 혜택(10% 할인권, 지류 상품권 등)에 '마감 임박/예산 소진'이라는 치명적인 긴급성을 강력히 부여하세요.
2. **(압도적 2순위) 백원 단위 액수가 명시된 연금 수령액 & 한정판 새마을금고 특판:**
   - 대박 사례: "OO새마을금고 5% 특판 오늘 마감 전에" (896회), "국민연금 수령액 2.1% 더 받습니다 (월 +14,314원)" (588회)
   - 타겟팅: 60대 최대 관심사인 '내 연금액'과 '고금리 저축'을 다룰 때 두루뭉술하게 쓰지 말고, **[월 +14,314원 증가], [780만원 손해], [저축은행 지점명과 5% 금리]** 등 정확한 돈 냄새가 나도록 숫자를 꽂아 넣으세요.
3. **(3순위) 개미 투자자의 심리를 자극하는 극단적 작전세력/배당금 주식 분석:**
   - 대박 사례: "삼성전자 특별배당금 또 터질까?" (542회), "세력의 장난질은 끝났다! 풀매수 바닥 징표", "엘앤케이바이오 주가 전망 '잡주 코스프레'" (217회)
   - 타겟팅: 평범한 기업 분석(예: "삼성전자 1분기 실적 분석")은 망합니다. **특별배당금, 작전 세력 농간, 거래정지, 떡상/폭락** 등 60대 주식 투자자들의 도파민과 공포를 자극하는 매우 공격적이고 자극적인 주식 이슈만 픽픽하세요.

[❌ 절대 금지: 실무에서 완벽히 실패한 폭망 패턴 (조회수 30 이하) ❌]
최근 성적표 분석 결과, 다음 블로그 패턴은 철저한 외면을 받았습니다. 절대 발굴 금지.
1. **막연한 2030 청년 정책 & 흔한 수도권 부동산:** "모르면 날리는 2026 청년미래적금", "수도권 잔여세대 GTX 줍줍" 등 60대 독자와 철저하게 동떨어진 청년 정보나 타겟 맞지 않는 부동산 정보는 30뷰 이하로 멸망했습니다. 어쭙잖은 부동산/청년 복지는 철저히 배제하세요.
2. **뻔하고 평범한 지원금 정책 정부 발표 내용:** "민생지원금 최대 60만원", "기초연금 35만원", "월세 5만원 고령자 임대주택" 등 남들이 다 쓰는 평이한 지원금 퍼나르기는 조회수가 바닥입니다. 발굴 금지.

**지시:** 뻔한 청년 정책이나 밋밋한 주식 분석은 100% 배제하고, 독자가 "지금 당장 은행/주민센터로 달려가지 않으면 연금 수백만 원이나 할인 혜택이 날아간다"고 직각적으로 체감할 수 있는 롱테일만 능동 발굴하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "발굴한 롱테일 키워드",
      "reason": "이 키워드가 타겟(60대/경제)의 클릭을 유발하여 네이버 홈판 진입 등 일방문 3만을 터트릴 폭발력이 있는 이유 분석 (1~2문장)"
    }
  ]
}
`;
    } else {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)입니다.
현재 이 블로그(첫 번째 블로그)는 일 방문자 3,000명 수준이며, 우리의 새로운 목표는 **'일 방문자 3만 명 이상 (네이버 메인/홈판 노출)'**이라는 압도적인 트래픽을 달성하는 것입니다.
현재 구글 검색(Google Search)을 실시간으로 활용하여, **네이버 홈판 경제/사회/생활 탭에 올라갈 수 있을 만큼 전국민적인 폭발력을 가진 '메가 황금 트렌드/롱테일 키워드' 딱 5개**를 능동적으로 추론하고 발굴해내세요.
${bannedSection}
${feedbackLearningGuidance}

[🚨 첫 번째 블로그(Blog1) 핵심 미션: 일방문 3만 달성을 위한 초강대국급 네이버 메인 타겟팅 🚨]
- 방향성: 자잘한 100~300따리 정보는 쳐다보지도 않습니다. 하루 포스팅 20개로 3만 뷰를 뽑아야 합니다. 즉, **포스팅 1개당 평균 1,500회 ~ 3,000회 이상을 터트릴 수 있는 전 국민적 관심사(메가 어그로, 초대형 정책, 로또 청약, 미친 특판, 속보성 재난/지원금)**만 발굴합니다.
- 능동적 추론 (홈판 선점): 단순히 오늘 뻔한 이슈를 찾는 걸 넘어, 내일이나 모레 **네이버 홈판 메인에 무조건 걸릴 수밖에 없는 이슈(예: 전 국민 대상 대형 정책 발표 전날, 대기업 충격적 실적 발표 직전, 역대급 줍줍 청약 당일)**를 스스로 추론하고 검색으로 팩트체크하여 먼저 선점하세요.
- 절대 가상의 지점명, 존재하지 않는 금리(%), 종목명, 상상 속의 청약 일정을 지어내서는 안 됩니다. 100% 팩트이면서 '메가 트래픽'을 물어올 놈만 골라옵니다.

[🔥 첫 번째 블로그 - 일방문 3만 보장형 메시브(Massive) 트래픽 성공 패턴 (2026.4.9 최신 급상승 검증) 🔥]
다음은 오늘(4/9) 기준 첫 번째 블로그에서 실시간 급상승 1~10위를 싹쓸이한 '메가 트래픽' 패턴입니다.
1. **(압도적 1순위) 정확한 지점명이 명시된 초고금리 특판 예적금 (급상승 순위 완전 장악):**
   - 대박 사례 (급상승 1~4위 싹쓸이): "서울중앙새마을금고 방이지점 4.0%", "신목신협 4% 비대면", "강남제일신협 5.1% 예금 오늘 마감", "백암신협 3.6% 막차"
   - 집중 타겟: 막연하게 "저축은행 금리"라고 쓰면 망합니다. **반드시 실존하는 특정 2금융권 은행의 정확한 지점명(방이지점, 강남제일신협, 백암신협 등)과 구체적인 금리(x.x%)**가 포함된 마감 직전의 '특판'만 집중 발굴하세요.
2. **(압도적 2순위) "억 단위 강남/과천급 로또" 무순위 줍줍 & 큐리오시티 갭(궁금증 유발) 기법:**
   - 대박 사례: "놓치면 9억 손해? 4월 서울 아파트 줍줍 딱 1곳" (단일 글 815회 폭발!), "과천 디에트르 퍼스티지 줍줍 딱 6세대!" (누적조회 570회)
   - 집중 타겟: "GTX 단지" 같이 뭉뚱그리면 망합니다. 기본적으로 단지명을 명시하거나, 시세차익이 5~10억 이상으로 비정상적으로 클 경우 이름을 숨기고 **"9억 손해? 서울 줍줍 딱 1곳"**처럼 궁금증(Curiosity Gap)을 극대화하는 어그로 기법을 적극 활용하세요.
3. **(신규 3순위) 마감 기한이 임박한 '특정 직군(소상공인)' 정책자금 & 어그로성 지원금 후킹:**
   - 대박 사례: "'전국민 2차 지원금'만 기다리세요? 99%가 모르는 소득..." (457회), "4월 20일 마감! 신용취약 소상공인 정책자금" (325회)
   - 집중 타겟: 뻔한 복지는 망하지만, **정확한 마감일(4월 20일 마감)이 명시된 소상공인 자금**이나 도입부에 **'전국민 지원금'** 키워드로 시선을 끌고 숨겨진 혜택으로 유도하는 후킹 기법은 엄청난 트래픽을 만들었습니다.

[❌ 절대 금지: 실무에서 완벽히 실패한 폭망 키워드 (조회수 10 이하) ❌]
최근 성적표 분석 결과, 다음 키워드들은 트래픽이 완전히 죽어버렸습니다. 절대 발굴하지 마세요.
1. **특정 지역화폐/지역사랑상품권:** 성남사랑상품권 외에 '태백시 탄탄페이', '부산 동백전', '아산페이', '이천사랑카드' 등 **특정 소규모 지역 화폐/페이는 조회수가 평균 4회로 처참하게 망합니다.** 전 국민 대상이 아니므로 절대 추천하지 마세요.
2. **시급성이 없고 마감일도 없는 뻔한 정부지원금:** '에너지 효율 지원금', '신생아 현금 지원', '고유가 지원금' 등 당장 안 해도 상관없는 뻔한 복지 정책은 5~7뷰에서 멸망했습니다. 단, 마감 임박 소상공인 자금은 예외입니다.
3. **시세차익이 애매한 인지도 낮은 줍줍/일반분양:** '대방역 더로드캐슬', '고양창릉 S1', '시흥더클래스 분양' 등 **"억 단위 로또" 타이틀을 당당하게 붙일 수 없는 평범한 차익의 외곽 분양이나 애매한 줍줍은 조회수 0~1회로 철저하게 버림받았습니다.** 확실한 강남/과천급 초대어 로또가 아니면 발굴하지 마세요.

**지시사항:** 오로지 독자가 "당장 오늘 청약 접수하거나 특판 가입 안 하면 억/천 단위를 손해 본다"고 직관적으로 느끼는 **'초대형 억 단위 시세차익 로또 줍줍' / '특정 지점명이 적힌 특판'** 두 가지 카테고리만 100% 엄선하세요. 애매한 청약, 지역 페이, 보편적 지원금 정책은 절대 금지합니다.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "발굴한 롱테일 예측 키워드",
      "reason": "왜 이 키워드가 네이버 홈판에 실릴 만큼 1,500방 이상의 폭발적인 트래픽을 당길 수 있는지(어떤 추론을 거쳤는지) 1~2문장 분석"
    }
  ]
}
`;
    }

    let response;
    // 2.5 버전이 터졌을 경우, 가장 우수하고 안정적인 gemini-pro-latest를 최우선 투입합니다
    const fallbackModels = [
      "gemini-2.5-flash", 
      "gemini-flash-latest", 
      "gemini-1.5-flash", 
      "gemini-2.5-pro", 
      "gemini-pro-latest", 
      "gemini-1.5-pro"
    ];
    let attempt = 0;

    while (attempt < fallbackModels.length) {
      try {
        const currentModel = fallbackModels[attempt];
        
        // 마지막 최후의 보루 시도 시, 구글 검색 도구가 503 원인일 수 있으므로 검색 툴을 제거합니다.
        const currentConfig: any = {
           systemInstruction: "당신은 트렌드를 분석하는 AI입니다. 구글 검색 과정이나 원본 검색 데이터({'title': ...} 형태)를 절대 출력하지 마세요. 오직 사용자가 요청한 JSON 형식 문서만 출력해야 합니다.",
           temperature: 0.8,
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
           const waitMs = is429 ? 10000 : 3000;
           console.warn(`[Agent-Trend] 503/429 Error on ${fallbackModels[attempt-1]}. Waiting ${waitMs}ms before fallback to ${fallbackModels[attempt]}...`);
           await new Promise(resolve => setTimeout(resolve, waitMs));
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
