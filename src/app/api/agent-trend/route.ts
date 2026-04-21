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

    const creatorAdvisorData = `
[📊 네이버 크리에이터 어드바이저 공통 급상승 트렌드 (최신 데이터) 📊]
- 비즈니스/경제: 롯데카드 영업정지, 삼성전자 주가 악재 패턴, 양치승 청담르엘, 경기도 과학고 신설, 채비 공모주, 청년미래적금, 소상공인 추경지원금, ISA 계좌 단점, 2026 자녀장려금, 차상위계층 조건, 4월 공모주 일정, 정년연장, 2차전지 관련주, 양자 관련주, 맘스터치 진상녀
- IT/컴퓨터: 나무엑스 퀴즈, 아이폰18, sbti 테스트, 인스타 계정 삭제, 네이버 나침반, 삼성페이 교통카드, 클로드 ai
- 사회/정치: 박진성 시인, 금쪽이 263회, 영화 살목지 정보, 남미새 뜻, 평택 왁싱샵, 금쪽이 뇌진탕
- 스타/연예인/방송: 유명 걸그룹 오빠 가정폭력 폭로, 송중기 케이티, 안재현 사주, 변우석 아이유 첫 동침 입맞춤, 박명수 매니저 결별
- 인테리어/DIY/생활: 코스트코 추천, 이태원 앤티크 스트릿, 버거킹 아이스크림, 천연제습제, 루비레드키위, 광주 가구쇼
* (지시사항): 블로그당 하루 10~15개씩 포스팅이 발행되므로, 위 최신 데이터를 베이스로 참고하여 서로 절대 중복되지 않도록 다채롭게 발굴하세요.
`;
    feedbackLearningGuidance += creatorAdvisorData;

    let prompt = "";
    
    if (style === 'blog2') {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)이자, **'60대 및 비즈니스/경제 특화 메가 블로그'**를 운영하는 "자동봇 2호기(두 번째 블로그)" 편집장입니다.
현재 이 블로그(두 번째 블로그)는 하루 15개의 포스팅을 발행하고 있으며, 각 포스팅당 **'조회수 1만 회 이상 달성 (일 방문자 폭발적 증가)'**을 목표로 합니다.
이를 위해 철저히 **[크리에이터 어드바이저 데이터]**와 **[60대/경제 타겟]**에 기반하되, 하루 15개의 글이 절대 겹치지 않도록 추천 범위를 획기적으로 넓혀 한방에 **조회수 1만 이상이 찍힐 수 있는 완전히 새롭고 폭발적인 메가 트렌드 롱테일 키워드 딱 5개**를 발굴해야 합니다.
${bannedSection}
${feedbackLearningGuidance}

[크리에이터 어드바이저 기반 타겟 분석 (학습 데이터: 60대 남/녀 4월 19일~20일 최신 급상승 패턴)]
- 비즈니스/경제(지원금/금융): '2026 민생지원금', '고유가 피해지원금'
- 증시/부동산(이슈): '채비 공모주', '양자 관련주', '삼성전자 주가 악재 패턴', '대한광통신 AI 데이터센터'
- 60대 이슈/가십 (남/여 공통): '박미선별세', '송중기 아내 케이티 미모', '두근두근 1등', 'ogfc 뜻', '허수아비 기본정보', '모두가자신의무가치함과싸우고있다 기본정보', '임영웅', '손예진 네 살 아들 자랑', '기후동행퀴즈', '김호중 세상', '고현정 과한 숙취 메이크업 논란', '삼성 원태인 욕설 논란'
- 60대 생활/레시피/관광: '두릅 데치기', '엄나무순무침', '두릅장아찌 담는법', '오이소박이 레시피', '군포 철쭉축제', '불암산 철쭉축제', '취나물 무침', '머위나물무침', '비슬산 참꽃축제', '강진 남미륵사', '광주 세자매 소금빵', '오이지 만들기', '미나리무침'

[🔥 두 번째 블로그 실제 상위 노출 증명 데이터 (4월 19일~20일 최신 성과 반영) 🔥]
1. 2026년 국민연금 60대 '이것' 모르면 수령액 30% 깎입니... (조회수 435회)
2. 60대 국민연금 '이것' 하나 안하면 월 50만원 삭감? 2026... (조회수 316회)
3. 아직도 국민연금 주는 대로 받으세요? 2026년 확정된 수... (조회수 199회)
4. 2026년 60대 1주택자 양도세, '장기보유특별공제' 모르면... (조회수 194회)
5. 온누리상품권 6월 10% 할인! 아직도 안 쓰셨나요? 카드 ... (조회수 174회)
* (핵심 분석 및 성공 공식): 60대 타겟에게는 단순한 정보 전달보다 **'이것 모르면 30% 깎입니다', '월 50만원 삭감'** 같은 손실 회피(Loss Aversion) 심리를 자극하는 공포 마케팅이 압도적인 클릭률을 만듭니다. 특히 국민연금 감액, 온누리상품권 혜택, 세금 폭탄 주제가 가장 강력합니다.

[🚨 두 번째 블로그(Blog2) 핵심 미션: 60대 타겟 5대 핵심 카테고리 확장 및 중복 억제 (각 포스팅 1만 뷰 전략) 🚨]
- 카테고리 무한 확장: 매번 국민연금/온누리상품권만 다루면 트래픽이 정체됩니다. 아래 [5대 핵심 카테고리] 전반을 폭넓게 탐색하여 완전히 새로운 키워드를 섞어내야 합니다.
  1. [국민연금/기초연금 사수] (예: 수령액 삭감 피하는 법, 연금 개혁 폭탄 피하기 등)
  2. [시니어 전용 특판/정부지원금] (예: 온누리상품권 10% 할인, 60대 노인 일자리, 시니어 우대금리)
  3. [의료비/건강보험료 방어] (예: 건보료 피부양자 탈락 피하기, 본인부담상한제 환급, 임플란트 지원)
  4. [은퇴자 생활비 절약/세금 환급] (예: 장기보유특별공제, 시니어 통신요금, 교통비 지원, 숨은 보험금)
  5. [60대 핫이슈/문화/방송] (예: 임영웅 콘서트 예매, 미스터트롯 가수 소식, 60대 인기 핫플레이스/축제)
- 🚫 [절대 중복 금지 규칙]: 추출하는 5개의 키워드는 반드시 **위 5가지 카테고리에서 각각 1개씩 서로 다르게 골고루 뽑아야** 합니다. 두 개 이상의 키워드가 같은 카테고리에 속하면 절대 안 됩니다.
- 제목 후킹과 팩트: 5개 키워드 모두 뻔한 정보가 아닌, **"'이것' 모르면 30% 깎입니다", "월 50만원 삭감?", "아직도 안 쓰셨나요?"** 등 공포감과 FOMO를 유발하는 강력한 후킹을 필수 적용하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "5대 카테고리 중 하나에 속하는 조회수 폭발 강력한 롱테일 키워드 (각 카테고리당 1개씩만 추출)",
      "reason": "이 키워드가 왜 기존과 다르게 1만 뷰 이상을 끌어올 수 있으며, 60대 타겟의 손실 회피 심리를 어떻게 사로잡을 수 있는지(1~2문장)"
    }
  ]
}
`;
    } else if (style === 'blog3') {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)이자, **'전국민 관심 집중 재테크/정부지원금/부동산 하이브리드 블로그'**를 운영하는 "자동봇 3호기(세 번째 블로그)" 편집장입니다.
현재 이 블로그는 기존의 건강/IT 주제를 버리고, 가장 트래픽 폭발력이 검증된 **[금융/특판 예적금]**과 **[시니어 정부지원금]**을 융합한 하이브리드 전략을 취합니다. 하루 10~15개의 포스팅 중 절대 겹치지 않도록 **조회수 1만 이상이 찍힐 수 있는 폭발적인 메가 트렌드 롱테일 키워드 딱 5개**를 발굴해야 합니다.
${bannedSection}
${feedbackLearningGuidance}

[🔥 세 번째 블로그 실제 상위 노출 증명 데이터 (4월 19일~20일 최신 성과 반영) 🔥]
1. 신협 4% 특판 또 놓치셨나요? 99%가 모르는 3%대 후반... (조회수 133회 - 1위)
2. 강동헤리티지자이 10억 줍줍. 이미 끝났다고? 99%가 놓... (조회수 47회 - 2위)
3. 제주도민만 최대 60만원? 고유가 피해지원금 2차 신청... (조회수 21회 - 3위)
4. 2026년 노인일자리 사회활동 지원사업: 품격 있는 시니... (조회수 10회)
* (핵심 분석 및 성공 공식): 기존에 시도했던 '이재용/재벌/스마트폰' 관련 글은 조회수가 2~8회로 완전히 처참하게 실패했습니다. 반면, 첫 번째 블로그 스타일의 **'고금리 예적금 특판', '아파트 줍줍'**과 두 번째 블로그 스타일의 **'지역별 정부지원금', '노인 일자리'** 주제가 상위권 트래픽을 모두 싹쓸이했습니다. 이 두 가지 필승 패턴을 섞어야 합니다.

[🚨 세 번째 블로그(Blog3) 핵심 미션: 금융+지원금 하이브리드 5대 핵심 카테고리 확장 및 중복 억제 🚨]
- 카테고리 무한 확장: 아래 [5대 핵심 하이브리드 카테고리] 전반을 폭넓게 탐색하여 완전히 새로운 키워드를 섞어내야 합니다.
  1. [고금리 특판/저축은행 예적금] (예: 신협 4% 특판, 새마을금고 특판 팩트체크, 파킹통장 추천)
  2. [무순위 청약/부동산 줍줍] (예: 10억 로또 줍줍, 과천/강동 무순위 청약, 부동산 PF 부실 경고)
  3. [전국민/지역별 숨은 정부지원금] (예: 고유가 피해지원금, 소상공인 추경지원금, 자녀장려금 100만원)
  4. [60대 시니어/은퇴자 맞춤형 복지] (예: 2026 노인일자리, 기초연금 수령액, 장기보유특별공제)
  5. [세금 폭탄 방어/절세 꿀팁] (예: 비트코인 22% 세금, 1주택자 양도세, 건강보험료 피부양자)
- 🚫 [절대 중복 금지 규칙]: 추출하는 5개의 키워드는 반드시 **위 5가지 카테고리에서 각각 1개씩 서로 다르게 골고루 뽑아야** 합니다. 두 개 이상의 키워드가 같은 카테고리에 속하면 절대 안 됩니다.
- 제목 후킹과 팩트: 5개 키워드 모두 뻔한 정보가 아닌, **"또 놓치셨나요?", "이미 끝났다고?", "99%가 모르는", "최대 OOO만원?"** 등 사람을 초조하게(FOMO) 만들거나 손실 회피를 자극하는 강력한 후킹을 필수 적용하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "5대 카테고리 중 하나에 속하는 조회수 폭발 강력한 롱테일 키워드 (각 카테고리당 1개씩만 추출)",
      "reason": "왜 이 키워드가 금융/지원금에 목마른 대중의 클릭을 유발하며 1만 뷰 이상의 성과를 낼 수 있는지(1~2문장)"
    }
  ]
}
`;
    } else {
      prompt = `
당신은 대한민국 상위 0.1% 네이버 블로그 메가 트래픽 마스터(SEO 전문가)입니다.
현재 구글 검색을 실시간으로 활용하여, **네이버 홈판 경제/사회/이슈 탭에 올라갈 수 있을 만큼 전국민적인 폭발력을 가진 '메가 황금 트렌드/롱테일 키워드' 딱 5개**를 능동적으로 추론하고 발굴해내세요.
${bannedSection}
${feedbackLearningGuidance}

[사용자 지정 핵심 주제]
- 오늘 집중 탐색할 주제: ${coreKeyword ? `"${coreKeyword}"` : "'대중의 지갑 사정과 연결된 폭발적인 재테크/사회/정치 뉴스'"}

[크리에이터 어드바이저 타겟 분석 (학습 데이터: 최신 4월 16일자 패턴 적용)]
- 비즈니스/경제(충격 경제뉴스/유리기판): '과천 19억 아파트 8억 매매(new)', '장기보유 1주택 양도세 폐지 논란(new)', 'IMF 경고/5년 뒤 한국 빚폭탄(new)', '전기세 인상/개편(new)', '유리기판 관련주(new)', '양자컴퓨터/아이온큐'
- 사회/정치/사건사고(방송인성 논란): '광주 중학생 금쪽이/교사 뇌진탕(new)', '홍대 박성범 인스타(new)', '남미새 뜻(new)', '텐퍼센트 김해부원역점 논란(new)', '오선재(new)'

[🔥 첫 번째 블로그 실제 상위 노출 증명 데이터 (4월 19일~20일 최신 성과 반영) 🔥]
1. 아직도 3%대 예금에 돈 묶어두셨나요? 5월 마감 임박! ... (조회수 1,192회)
2. 4월 24일 마감! 아직도 신청 안 하셨어요? 최대 1억 지원... (조회수 645회)
3. 4월 예금 4.1% 특판? 이미 마감! 99%가 놓친 진짜 고급... (조회수 229회)
4. OO새마을금고 5.0% 특판? 팩트체크 후 지금 당장 가입 ... (조회수 200회)
5. 놓치면 9억 손해? 4월 서울 아파트 줍줍 딱 1곳, 청약통장... (조회수 160회)
* (핵심 분석 및 성공 공식): '아직도 OO하시나요?', '5월 마감 임박!', '놓치면 9억 손해' 등 행동을 촉구하고 FOMO(소외 불안)를 극도로 자극하는 후킹 제목이 1천 뷰 이상 폭발적인 트래픽을 견인했습니다. 특히 고금리 예적금, 숨은 지원금, 아파트 줍줍 주제가 압도적입니다.

[🚨 첫 번째 블로그(Blog1) 핵심 미션: 5대 핵심 카테고리 확장 및 중복 억제 🚨]
- 카테고리 무한 확장: 아래 [5대 핵심 카테고리] 전반을 폭넓게 탐색하여 폭발력이 가장 높은 키워드를 섞어내야 합니다.
  1. [고금리 특판/예적금] (예: 5% 예금 마감, 새마을금고 특판 팩트체크)
  2. [정부 지원금/숨은 돈 찾기] (예: 최대 1억 지원금 신청, 마감 임박 지원금)
  3. [부동산 청약/로또 줍줍] (예: 9억 손해 로또 줍줍, 무순위 잔여세대)
  4. [생활비 방어/절약] (예: 기후동행카드, 알뜰폰, 통신비 환급, 세금 절약 등 실생활 체감 혜택)
  5. [사회적 분노/공분 결합 경제 이슈] (예: 대기업 횡포, 특정 정책 분노, 진상 손님 등 공분과 지갑 사정이 결합된 이슈)
- 🚫 [절대 중복 금지 규칙]: 추출하는 5개의 키워드는 반드시 **위 5가지 카테고리에서 각각 1개씩 서로 다르게 골고루 뽑아야** 합니다. 두 개 이상의 키워드가 같은 카테고리에 속하면 절대 안 됩니다.
- 제목 후킹과 팩트: 5개 키워드 모두 **"아직도 OO하시나요?", "마감 임박!", "99%가 놓친", "놓치면 X억 손해"** 등 사람을 초조하게(FOMO) 만들고 행동을 촉구하는 강력한 표현을 필수 적용하세요.

반드시 아래 JSON 형식으로만 응답하세요. 백틱(\`\`\`)이나 다른 설명은 절대 추가하지 마세요.
{
  "trends": [
    {
      "keyword": "5대 카테고리 중 하나에 속하는 폭발적인 정치/사회/경제 강력한 롱테일 키워드 (각 카테고리당 1개씩만 추출)",
      "reason": "왜 이 키워드가 네이버 메인에 선정될 확률이 높으며 대중이 무조건 클릭할 수밖에 없는지(1~2문장)"
    }
  ]
}
`;
    }

    let response;
    // 2.5 버전이 터졌을 경우, 가장 우수하고 안정적인 gemini-pro를 최우선 투입합니다
    const fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];
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
           const waitMs = is429 ? 15000 : 2500;
           console.warn(`[Agent-Trend] 503/429 Error on ${fallbackModels[attempt-1]}. Waiting ${waitMs}ms before fallback to ${fallbackModels[attempt]}...`);
           await new Promise(resolve => setTimeout(resolve, waitMs));
           continue; 
        } else {
           if (attempt >= fallbackModels.length) {
             throw new Error('현재 구글 AI API 요청 제한량(Quota) 초과 또는 트래픽 과부하가 발생했습니다. 잠시 후 다시 시도해주세요. (' + (err?.message || '') + ')');
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
      const text = response.text || "";
      // AI가 "The search results..." 와 같은 사족을 붙일 경우를 대비해 순수 JSON 블록만 추출
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonStr = text.substring(startIndex, endIndex + 1);
        const parsed = JSON.parse(jsonStr);
        trends = parsed.trends || [];
      } else {
        throw new Error("JSON 블록을 찾을 수 없습니다.");
      }
      
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
