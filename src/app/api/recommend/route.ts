import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Increase Vercel timeout to 60 seconds


const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { category, timeframe } = await req.json();

    if (!category || !timeframe) {
      return NextResponse.json(
        { error: "Category and timeframe are required" },
        { status: 400 }
      );
    }

    let promptGuidance = `
[애드센스 황금 키워드 발굴 공식 - 반드시 지킬 것]
1. 검색자의 행동 의지: '신청', '예매', '다운로드', '조회', '방법', '후기' 등 검색자가 당장 액션을 취하려는 의도가 담긴 롱테일 키워드여야 합니다.
2. 타겟 및 고단가(CPC) 성향: 광고 클릭률이 높은 40대 이상 중장년층이 타겟이 되거나, '보험, 금융, 대출, 법률, 정부 지원금' 등 돈과 관련된 고단가 이슈와 연결될수록 매우 좋습니다.
3. 롱테일 자동완성 형태: 단일 단어가 아니라 사람들이 검색창에 직접 타이핑할법한 '구체적인 롱테일(Long-tail) 형태'로 작성하되, 포털 자동완성의 띄어쓰기를 그대로 살리세요. (예: "2026년 청년도약계좌 일시납입 조건 만기수령액")
4. 경쟁 강도: 과거 데이터나 뻔한 단어(예: "부동산 전망")는 절대 금지합니다. 현재 시간(${timeframe}) 기준 시의성에 맞춰 조회수는 폭발하지만 문서 수는 적은 틈새 이슈를 발굴하세요.
5. 오직 추천 키워드만 한 줄에 하나씩 출력하세요. (번호 표기, 하이픈 등 기호, 부가 설명, 따옴표 절대 금지. 정확히 10줄만 출력)
`;

    if (['친절한 디지털 가이드', '숨은 투어 탐험가', '인생 2막 홈가드닝', '살림 9단 깐깐 리뷰어', '시니어 댕냥이 집사'].some(p => category.includes(p))) {
        promptGuidance = `
[폭발적 조회수 및 공감형 라이프스타일 키워드 발굴 공식 - 반드시 지킬 것]
1. 검색자의 리뷰/정보 탐색 의지: '내돈내산', '비교', '가볼만한곳', '효과', '추천템', '키우기' 등 생활 밀착형 정보나 현실 리뷰를 찾는 롱테일 키워드여야 합니다.
2. 타겟 및 트래픽(조회수) 폭발 성향: 은퇴 후 시니어, 4050 주부 등이 타카오톡으로 서로 공유(바이럴)하기 좋은 '건강 보조제', '예쁜 걷기 길', '반려동물 사료', '생활 꿀팁' 등 철저히 일상적 공감이 넘치는 이슈를 타겟팅하세요.
3. 롱테일 자동완성 형태: 뻔한 단어말고 검색창에 직접 칠만한 '구체적인 롱테일 형태'로 작성하세요. (예: "다이소 주방템 가성비 추천", "관절 편한 무장애 둘레길 당일치기")
4. 최신 트렌드 반영: 구글 트렌드, 네이버 쇼핑 트렌드 등을 종합해 현재(${timeframe}) 기준 문서 수는 적으나 수요가 급증하는 블루오션 키워드를 발굴하세요.
5. 오직 추천 키워드만 한 줄에 하나씩 출력하세요. (번호 표기, 하이픈 등 기호, 부가 설명, 따옴표 절대 금지. 정확히 10줄만 출력)
`;
    }

    const prompt = `
당신은 네이버 블로그 상위 노출 및 애드센스 고수익(CPC/CTR 최적화) 창출의 최고 권위자입니다.
반드시 [Google Search(구글 검색)] 도구를 사용하여 현재 한국의 실시간 트렌드, 뉴스 상위 이슈, 포털 검색어 순위 등을 직접 검색하고 분석하세요.
검색 결과를 바탕으로, 지금 현재(${timeframe}) 한국에서 가장 핫하고 검색량이 폭증하면서도 **트래픽/수익화에 직결되는** '${category}' 관련 황금 키워드를 찾아 정확히 10개만 도출해주세요.

${promptGuidance}

분석 대상 카테고리 (블로그 페르소나): ${category}
트렌드 기준 기간: ${timeframe}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        temperature: 0.8, // Slightly higher for variation
        tools: [{ googleSearch: {} }],
      },
    });

    const textResponse = response.text || "";
    
    // Split by newlines, clean up empty lines, numbers, and trim spaces
    const keywords = textResponse
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^-+\s*/, '').replace(/^[*]+\s*/, '').replace(/['"]/g, '').trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 10);

    return NextResponse.json({ keywords });
  } catch (error: unknown) {
    console.error("Gemini API Error in /api/recommend:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
