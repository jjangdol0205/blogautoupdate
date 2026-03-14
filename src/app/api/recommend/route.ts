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

    const prompt = `
당신은 네이버 블로그 상위 노출 및 국내 실시간 검색어 트렌드 분석의 최고 권위자입니다.
반드시 [Google Search(구글 검색)] 도구를 사용하여 현재 한국의 실시간 트렌드, 뉴스 상위 이슈, 포털 검색어 순위 등을 직접 검색하고 분석하세요.
검색 결과를 바탕으로, 지금 현재(${timeframe}) 한국에서 가장 핫하고 검색량이 폭증하고 있는 '${category}' 관련 키워드를 찾아 정확히 10개만 도출해주세요.

[핵심 요구사항 - 반드시 지킬 것]
1. 반드시 최신 검색 결과를 반영해야 합니다. 과거 데이터가 아닌 "오늘/이번 주" 기준으로 폭증하는 이슈여야 합니다.
2. 뻔하고 평범한 단어는 절대 금지합니다. (예: "부동산 전망", "청년 지원금", "은퇴 준비" 등 포괄적인 단어 금지)
3. 사람들이 네이버 검색창에 직접 타이핑할법한 '구체적인 롱테일(Long-tail) 검색어 형태'로 작성해야 합니다. 
   - 좋은 예(지원금): "2024년 청년도약계좌 일시납입 조건 만기수령액", "소상공인 대환대출 신청방법 후기"
   - 좋은 예(인생 지혜와 인간관계): "인간관계 스트레스 대처 명언", "4050 멘탈 관리 심리학 좋은글"
   - 좋은 예(은퇴경제): "50대 은퇴 후 유망 자격증 현실 수익", "국민연금 조기수령 만 60세 장단점 손해액"
4. 현재 시간(${timeframe}) 기준 시의성에 딱 맞는, 조회수는 높지만 문서수는 적은 '황금 키워드' 성격이 나야 합니다.
5. 오직 추천 키워드만 한 줄에 하나씩 출력하세요. (번호 표기, 하이픈 등 기호, 부가 설명, 따옴표 절대 금지. 정확히 10줄만 출력)

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
