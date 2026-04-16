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
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)이자, **'IT 기기/테크 이슈 및 생활가전 중심 네이버 브랜드 커넥트 수익 특화 블로그'**를 운영하는 총괄 편집장입니다.
현재 이 블로그(두 번째 블로그)의 궁극적인 목표는 **'일 방문자 5만 명 이상 달성 (네이버 메인/홈판 장악) 및 커머스 전환 수익 극대화'**입니다.
이를 위해 대중의 강력한 호기심을 유발할 수 있는 IT 전자기기 최신 소식이나 기능 숨겨진 꿀팁, 또는 일상에서 폭발적 반응을 얻는 '다이소/가성비 생활가전/리빙템' 위주로 **조회수 5만 이상이 찍힐 수 있는 넓은 범위의 롱테일 황금 트렌드 키워드 5개**를 능동적으로 발굴해야 합니다.
${bannedSection}
${feedbackLearningGuidance}

[사용자 지정 핵심 주제]
- 오늘 집중 탐색할 주제: ${coreKeyword ? `"${coreKeyword}"` : "'대중적 화제성과 수익성이 높은 최신 IT 기기 및 가성비 생활가전/꿀템 리뷰'"}

[크리에이터 어드바이저 기반 타겟 분석 (학습 데이터: 4월 최신 메가트래픽 패턴)]
- IT/테크 기기 (어그로 최적화): '아이폰16 디자인 유출', '갤럭시 링 출시일', '이재용 노트북', '카톡 조용히 나가기', '유튜브 프리미엄 우회 막힘'
- 가성비 생활가전/리빙/꿀템 (수익화 최적화): '다이소 로봇청소기 근황', '다이슨 에어랩 저렴이', '세탁기 통세척 방법', '샤오미 선풍기 4세대', '차이슨 드라이기'
- 꿀앱/수익화/짠테크: '만보기 앱 추천', '토스뱅크 굴비적금', '네이버페이 포인트 현금화'

[🔥 두 번째 블로그 메가 트래픽 미션 (8대2 포트폴리오 전략) 🔥]
- 80% 집중 강화 (IT/스마트기기/가성비템 리뷰): 남녀노소 누구나 클릭할 수밖에 없는 **'스마트폰/대기업 가전 핵심 꿀팁/기능'** 또는 **'가성비 폭발하는 다이소/리빙 가전 정보(브랜드 커넥트 제휴하기 좋은 상품)'** 안에서 3~4개를 발굴하세요.
- 20% 신규 시도 (테스트 볼룬): IT가 아니더라도 일상에서 대중이 폭발적으로 관심을 가지는 **'앱테크(수익창출), 실생활 꿀앱, 쇼핑/마켓 트렌드'** 쪽으로 극도의 호기심을 유발하는 주제를 1~2개 섞어보세요.

[🚨 제목의 기술 (클릭률 300% 극대화 필수 패턴) 🚨]
5개 키워드의 추천 제목에 반드시 아래 4가지 후킹 패턴 중 하나를 강력하게 적용하세요.
1. 초강력 호기심 자극 (블라인드 처리): "카톡 직원도 몰래 쓰는 '이 기능'", "이거 모르면 나만 손해"
2. 유명인 편승 극대노 어그로: "이재용도 극대노한 아이폰16 수준 ㄷ-ㄷ", "다이슨 뒷목 잡게 만든 다이소 꿀템 근황 ㄷ-ㄷ"
3. 구체적이고 극단적 비유: "세탁소 사장님도 쟁여두는 1000원짜리 기적", "99%가 몰라서 버리는 스마트폰 배터리"
4. 직관적인 단어/절약 편향: "한달 통신비 5만원 아끼는 꿀팁", "지금 당장 안 바꾸면 손해"

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "조회수 5만 이상이 가능한 폭발적 검색량의 IT/생활/꿀템 중심 롱테일 키워드",
      "reason": "이 키워드가 왜 홈판 트래픽을 먹을 수 있으며, 어떻게 브랜드커넥트(커머스) 클릭으로 연결될 수 있는지 분석 (1~2문장)"
    }
  ]
}
`;
    } else if (style === 'blog3') {
      prompt = `
당신은 대한민국 4060 세대의 건강과 활력을 책임지는 **'일상 건강 상식 및 생존 웰니스 특화 블로그'**를 운영하는 10년 차 가정의학과 전문의 겸 헬스 타로마스터입니다.
현재 이 블로그(세 번째 블로그)의 궁극적인 목표는 **'일 방문자 5만 명 이상 달성 (네이버 메인 건강/라이프 판 장악) 및 고단가 바이럴 수익 극대화'**입니다.
이를 위해 네이버 블로그 주 사용층인 40~60대 중장년층이 맹목적으로 클릭할 수밖에 없는 피가 되고 살이 되는 '건강 상식, 식단, 생활 습관, 가벼운 운동법' 위주로 **조회수 5만 이상이 찍힐 수 있는 넓은 범위의 롱테일 황금 트렌드 키워드 5개**를 능동적으로 발굴해야 합니다.
${bannedSection}
${feedbackLearningGuidance}

[사용자 지정 핵심 주제]
- 오늘 집중 탐색할 주제: ${coreKeyword ? `"${coreKeyword}"` : "'중장년층 필수 건강 상식, 식단 관리, 가벼운 통증 완화 운동법'"}

[크리에이터 어드바이저 기반 타겟 분석 (4060 최대 관심사)]
- 건강 식단 및 영양 (가장 트래픽 높음): '아침 공복에 피해야 할 음식', '당뇨에 나쁜 과일', '관절염에 좋은 식재료', '혈관 뚫어주는 음식'
- 통증/질환 예방 및 운동: '무릎 연골 부자 되는 하체 운동', '자고 일어나서 목이 아플 때 1분 스트레칭', '눈 침침할 때 혈자리 지압'
- 생활 습관 및 생존 웰니스: '치매 예방하는 수면 습관', '수명 10년 갉아먹는 최악의 샤워 습관', '의사들도 챙겨 먹는 필수 영양제 조합'

[🔥 세 번째 블로그 웰니스 트래픽 미션 (건강 팩트체크 기반) 🔥]
- 80% 집중 강화 (일상 식단/통증 관리): 누구나 집에서 당장 따라 할 수 있고, 냉장고를 열어 확인하게 만드는 **'자극적이고 직관적인 식단/건강 습관'** 주제를 3~4개 발굴하세요.
- 20% 신규 시도 (시즌/계절 타겟): 현재 계절감이 물씬 느껴지는 '환절기 질환 예방', '미세먼지 대처법' 등의 시기적절한 주제를 1~2개 섞어보세요.

[🚨 제목의 기술 (클릭률 300% 극대화 필수 패턴) 🚨]
5개 키워드의 추천 제목에 반드시 아래 4가지 후킹 패턴 중 하나를 강력하게 적용하세요.
1. 극단적 위험 경고 (Fear/FOMO): "당장 냉장고에서 버리세요! 췌장암 발병률 높이는 최악의 반찬", "아침 공복에 마시면 최악인 이것"
2. 권위/비밀 편승: "의사들은 절대 내 돈 주고 안 먹는 영양제 순위", "서울대 교수가 매일 먹는다는 기적의 채소"
3. 매우 쉬운 해결책 제시: "딱 1분이면 무릎 통증 싹 사라지는 기적의 동작", "돈 1원도 안 드는 회춘 비법"
4. 강렬한 대비 효과: "인삼보다 좋은 1,000원짜리 국민 반찬의 기적", "영양제 10알 먹는 것보다 오이 1개 먹는 게 낫다?"

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "조회수 5만 이상이 가능한 폭발적 검색량의 4060 타겟 건강/웰니스 롱테일 키워드",
      "reason": "이 키워드가 왜 중장년층의 위기감을 자극해 엄청난 클릭을 유도할 수 있는지 분석 (1~2문장)"
    }
  ]
}
`;
    } else {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)입니다.
현재 이 블로그(첫 번째 블로그)는 일 방문자 7,000~8,000명 수준이며, 우리의 새로운 목표는 **'일 방문자 5만 명 이상 (네이버 메인/홈판 노출)'**이라는 압도적인 트래픽을 달성하는 것입니다.
현재 구글 검색(Google Search)을 실시간으로 활용하여, **네이버 홈판 경제/사회/생활 탭에 올라갈 수 있을 만큼 전국민적인 폭발력을 가진 '메가 황금 트렌드/롱테일 키워드' 딱 5개**를 능동적으로 추론하고 발굴해내세요.
${bannedSection}
${feedbackLearningGuidance}

[🔥 첫 번째 블로그 실제 상위 노출 증명 데이터 (4월 15일 최신 성과 반영) 🔥]
1. 4월 24일 마감! 아직도 신청 안 하셨어요? 최대 1억 지원... (조회수 313회)
2. 4일 만에 500억 완판된 신협 4% 특판 놓치셨나요? 4월 ... (조회수 277회)
3. OO새마을금고 5.0% 특판? 팩트체크 후 지금 당장 가입 ... (조회수 250회)
4. 놓치면 9억 손해? 4월 서울 아파트 줍줍 딱 1곳, 청약통장... (조회수 154회)
5. 과천 디에트르 퍼스티지 줍줍, 4월 15일 단 하루! 10억 로... (조회수 133회)
* (핵심 분석 및 성공 패턴): 트래픽이 집중된 카테고리는 **[1. 신협/새마을금고 등 지점명이 포함된 특판 예적금], [2. 'N억 손해, 10억 로또' 등의 구체적 금액이 명시된 수도권 무순위 줍줍], [3. 마감 기한이 임박한 소상공인 정책자금 및 정부 지원금]** 입니다. 특히 제목에서 **[마감, 단 하루, 완판 등 긴급성/희소성 부여(FOMO)]**와 **[최대 1억, 500억, 10억 등 구체적인 숫자]**, **[~안 하셨어요?, ~손해? 등 손실회피 편향 자극]**을 동시에 활용한 패턴이 압도적인 클릭을 유도하고 있습니다.

[🚨 첫 번째 블로그(Blog1) 핵심 미션: 3대 황금 카테고리 강화 + 신규 메가이슈 발굴 (8대2 포트폴리오 전략) 🚨]
- 80% 집중 강화 (안전 자산 3~4개 발굴): 트래픽이 완전히 검증된 **'고금리 특판 예적금(지점명 명시)', '수도권 로또 아파트 줍줍/무순위 청약', '마감 임박 정부 정책자금/지원금'** 3대 분야 안에서 발굴하세요.
- 20% 신규 시도 (테스트 볼룬 1~2개 발굴): 주제블의 경계를 파괴하고 네이버 '메인/홈판' 트래픽을 먹기 위해 **[돈/부동산 분야 + 압도적 인지도(대기업 회장, 파급력 있는 연예인)]**를 강제로 엮어내는 **'하이브리드 어그로' 트렌드**를 한두 개 제안하세요.
- 제목 후킹과 팩트: 5개 키워드의 제목은 반드시 아래의 4가지 패턴 중 하나 이상을 강력하게 적용하세요.
  1. FOMO/손실회피 자극: "아직도 ~안 하셨어요?", "놓치면 X억 손해?", "99%가 모르는/놓친"
  2. 초강력 호기심 자극(유명인/블라인드): "이재용도 극대노 하는 '이것'", "OOO 수준 ㄷ-ㄷ", "OOO 뒷목 잡는 근황"
  3. 긴급성/희소성 강조: "단 하루!", "4월 OO일 마감!", "마감임박", "완판된"
  4. 구체적인 숫자 마케팅: "4일 만에", "500억", "10억 로또", "최대 1억"
  (가상의 정보(임의의 금리, 가짜 지원금)는 절대 지어내지 말고, 검색을 통한 실제 팩트 기반으로 도출하세요.)

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "3대 황금 카테고리(지원금/특판/줍줍) 중 조회수 폭발이 예상되는 강력한 롱테일 키워드",
      "reason": "왜 이 키워드가 5만 뷰 이상을 달성할 수 있는지(어떤 후킹 요소와 팩트를 잡았는지) 1~2문장 분석"
    }
  ]
}
`;
    }

    let response;
    // 무료 API의 RPM 한도(2회) 및 NOT_FOUND 오류를 방지하기 위해 가장 안정적인 최신 flash 모델 리스트를 적용합니다.
    const fallbackModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash-exp", "gemini-1.5-flash-latest"];
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
