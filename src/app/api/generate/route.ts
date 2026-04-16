import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export const maxDuration = 300; // Vercel Pro 서버리스 함수 타임아웃 300초로 연장

export async function POST(req: Request) {
  try {
    const { keyword, deviceType = 'desktop', category = 'general', goodUrl = "", badUrl = "" } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    // 1. [SEO 전략] 네이버 검색광고 API를 사용해 메인 키워드에 대한 연관 서브 키워드 4개 추출
    let subKeywordsText = "";
    try {
      const customerId = process.env.NAVER_AD_CUSTOMER_ID;
      const accessLicense = process.env.NAVER_AD_ACCESS_LICENSE;
      const secretKey = process.env.NAVER_AD_SECRET_KEY;
      
      if (customerId && accessLicense && secretKey && keyword.trim().length > 0) {
        const crypto = require('crypto');
        const timestamp = Date.now().toString();
        const method = "GET";
        const path = "/keywordstool";
        const signature = crypto.createHmac("sha256", secretKey).update(`${timestamp}.${method}.${path}`).digest("base64");
        
        // 메인 키워드(최대 5단어 조합 가능) 중 첫 단어로 연관검색어 조회
        const seedKw = keyword.trim().split(' ')[0];
        const apiUrl = `https://api.naver.com${path}?hintKeywords=${encodeURIComponent(seedKw)}&showDetail=1`;
        
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { 'X-Timestamp': timestamp, 'X-API-KEY': accessLicense, 'X-Customer': customerId, 'X-Signature': signature }
        });
        
        if (res.ok) {
          const data = await res.json();
          const list = data.keywordList || [];
          // 입력한 키워드와 정확히 일치하는 것은 제외, 모바일 검색량 순 정렬
          const filtered = list.filter((k: any) => k.relKeyword !== seedKw);
          filtered.sort((a: any, b: any) => parseInt(b.monthlyMobileQcCnt || "0") - parseInt(a.monthlyMobileQcCnt || "0"));
          
          const topSubKw = filtered.slice(0, 4).map((k: any) => k.relKeyword);
          if (topSubKw.length > 0) {
            subKeywordsText = `
[네이버 스마트블록 & 상위노출 필수 조건]
블로그 텍스트 정보량을 풍부하게 만들기 위해, 다음 4개의 <연관(서브) 키워드>를 포스팅 본문에 아주 자연스럽게 1~2회씩 무조건 섞어서 작성하세요. 
서브 키워드: ${topSubKw.join(', ')}
독자가 어색함을 느끼지 못하도록 진짜 정보인 것처럼 녹여내야 최적화 블로그 점수를 받습니다.`;
          }
        }
      }
    } catch (e) {
      console.warn("Sub-keywords fetch failed, proceeding without them", e);
    }

    const keywordGuidance = "추상적인 개념일 경우 서양인 사무실 사진이 나오지 않도록 시각적으로 직관적이고 상징적인 사물/풍경 '한글 단어'를 명사형태로 선택하세요.";

    const translatePrompt = `당신은 검색어에서 가장 핵심적이고 시각적인 이미지를 추출하는 프롬프트 엔지니어입니다. 
    사용자가 입력한 검색어에 가장 찰떡같이 어울리는 고품질 사진을 찾기 위해, 명확한 단어를 추출하세요.
    ${keywordGuidance}

    1. primary: 검색어를 가장 잘 표현하는 구체적이고 감각적인 한글 단어 1~2개
    2. fallback: primary 검색 실패 시 사용할, 검색어의 상위 카테고리에 해당하는 매우 포괄적이고 중립적인 한글 단어 1~2개
    3. englishSubject: 이 주제를 그림으로 그릴 때 메인 피사체가 될 만한 구체적인 영단어 2~3개
    
    [🔥 홈판 노출용 극한 어그로/후킹 썸네일 문구 작성 지침 🔥]
    4, 5, 6번 썸네일 문구는 네이버 메인 홈판에서 대중이 무조건 클릭하게 만드는, 살짝 선을 넘나드는 수준의 극한 카피라이팅이어야 합니다. (특정 유명인/가십 비유 등 하이브리드 어그로 적극 권장)
    4. thumbnailTop: 상단 해시태그용 어그로 문구 (예: #안보면손해 #이재용도화들짝 #1퍼센트만아는비밀) - 띄어쓰기 없이 해시태그로 3개 작성 (15자 이내)
    5. thumbnailMid: 썸네일 중앙 핵심 주제 (예: 청년미래적금, OOO수준 ㄷㄷ, 블로그 비밀) - 8자 이내 명사형태 다소 자극적 설정 가능
    6. thumbnailBottom: 호기심과 손실 회피를 극도로 자극하는 하단 문구 (예: 클릭 안하면 9억 손해, 99%가 놓치는 꿀팁, 극대노 하는 이유) - 13자 이내
    
    예시:
    "블로그 썸네일 만들기" -> {"primary": "디자인", "fallback": "컴퓨터", "englishSubject": "designing on computer", "thumbnailTop": "#조회수폭발 #인플루언서비밀", "thumbnailMid": "썸네일 꿀팁", "thumbnailBottom": "안 보면 무조건 손해!"}
    "삼성전자 주가방향" -> {"primary": "주식 차트", "fallback": "금융", "englishSubject": "stock market chart rising", "thumbnailTop": "#개미투자자 #무조건필독", "thumbnailMid": "삼성전자 주가", "thumbnailBottom": "지금이 마지막 기회일까?"}

    반드시 아래 JSON 형식으로만 응답하세요. 다른 문장 부호나 설명은 절대 붙이지 마세요.
    {"primary": "...", "fallback": "...", "englishSubject": "...", "thumbnailTop": "...", "thumbnailMid": "...", "thumbnailBottom": "..."}
    
    사용자 검색어: ${keyword}`;

    let transRes;
    const transModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash-exp", "gemini-1.5-flash-latest"];
    let transAttempt = 0;

    while (transAttempt < transModels.length) {
      try {
        transRes = await ai.models.generateContent({
          model: transModels[transAttempt],
          contents: translatePrompt,
          config: { temperature: 0.1, responseMimeType: "application/json" },
        });
        break;
      } catch (err: any) {
        transAttempt++;
        const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE');
        if (is503 && transAttempt < transModels.length) {
          console.warn(`[Generate-Init] 503 error on ${transModels[transAttempt-1]}, falling back to ${transModels[transAttempt]}`);
          continue;
        } else {
          throw err;
        }
      }
    }
    
    let searchParams = { primary: "사무실", fallback: "비즈니스", englishSubject: "office desktop", thumbnailTop: "오늘의 핵심 정보", thumbnailMid: keyword || "핵심 요약", thumbnailBottom: "지금 바로 확인!" };
    try {
      const jsonStr = transRes?.text?.trim() || "{}";
      const cleanedJsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      searchParams = JSON.parse(cleanedJsonStr);
    } catch (e) {
      console.warn("Failed to parse translate response, using fallback", e);
    }

    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
    let imageUrls: string[] = [];
    
    if (PIXABAY_API_KEY) {
      try {
        const fetchImages = async (query: string, limit: number) => {
          const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=15`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            return data.hits.sort(() => 0.5 - Math.random()).slice(0, limit).map((hit: any) => hit.webformatURL);
          }
          return [];
        };

        // 1. primary 검색
        let foundImages = await fetchImages(searchParams.primary, 4);
        
        // 2. 만약 primary 결과가 부족하면 fallback으로 보충
        if (foundImages.length < 4) {
             const fallbackImages = await fetchImages(searchParams.fallback, 4 - foundImages.length);
             foundImages = [...foundImages, ...fallbackImages];
        }
        
        // 3. 그래도 부족하면 완전 기본 키워드로 보충
        if (foundImages.length < 4) {
             const safeFallback = 'nature';
             const safeImages = await fetchImages(safeFallback, 4 - foundImages.length);
             foundImages = [...foundImages, ...safeImages];
        }

        imageUrls = foundImages;
      } catch (e) {
        console.error("Pixabay fetch error:", e);
      }
    }

    let personaGuidance = "";
    if (category === 'blog3') {
      personaGuidance = `
당신은 대한민국 4060 세대에게 피가 되고 살이 되는 '무병장수 생존 건강 꿀팁'을 족집게처럼 알려주는 친근하고 명쾌한 10년 차 가정의학과 전문의 겸 스타 헬스 크리에이터입니다.
이 블로그의 모토는 "돈 안 들이고 내 몸 살리는 기적의 건강 및 생활 습관"입니다.
사용자가 입력한 검색어를 바탕으로 네이버에서 당장 클릭이 폭발할 수밖에 없는 자극적이면서도 유익한 건강/웰니스 정보를 구글 검색 도구(googleSearch)로 자유롭게 조사하여 작성해주세요.

[🚨 치명적 주의사항: 100% 팩트 체크 (항의/신고 방지) 🚨]
당신의 글은 독자의 현명한 생활 습관을 돕는 가이드이며 절대 '의학적 진단이나 처방'이 아닙니다.
잘못된 효능, 엉터리 민간요법, 검증되지 않은 위험한 약침/마사지 등을 지어내면 매우 위험합니다(Hallucination 절대 금지). 전문가의 소견이나 팩트체크된 정보만 전달하며, 문단 끝에는 "개인의 건강 상태에 따라 다를 수 있으니 반드시 전문의와 상담하세요" 등의 방어 멘트를 자연스럽게 녹여주세요.

[🔥 구매 전환보다 높은 '공유 및 체류율' 달성 필수 프롬프트 🔥]

1. 초강력 결핍 & 공포 자극 (도입부 훅):
   - 대놓고 본론부터 말하면 안 됩니다. 4060 독자들이 일상에서 느끼는 공포(건강 염려, 노화, 질병)를 먼저 콕 짚어 내며 깊은 공감대를 형성하세요.
   - 예시: "요즘 자고 일어나도 개운치 않고 뒷목이 뻐근하신가요? 나이 탓이려니 하고 방치했다간 큰일납니다."

2. 충격적인 진실 폭로 70%, 해결책 30% 황금비율 (스토리텔링):
   - 우리가 매일 속고 있었던 '최악의 습관'이나 '독이 되는 음식'을 전반부에 충격적으로 배치하세요. (예: "매일 아침 건강식이라 믿고 먹었던 OOO, 사실은 독사과였습니다.")
   - 중반부부터 "그래서 제가 돈 1원 한 푼 안 들이고 해결하는 방법을 딱 찾아왔습니다"라며 자연스럽게 기적의 습관이나 추천 식품을 등장시킵니다.
   - 나열식이 아닌 "이래서 10년은 더 젊어집니다"라는 확신에 찬 어조로 풀이하세요.
   - 각 문단마다 📌 기호를 사용해 넘버링 소제목을 달아주세요.

3. [필수 삽입 섹션] 의사들도 몰래 실천하는 1분 기적:
   - 본문 후반부에 💡 [병원 갈 일 없애주는 1분 기적 습관] 이라는 소제목을 만들고, 일반인은 모르는 일상 속 숨겨진 건강 팁을 ✔️ 꿀팁 1, ✔️ 꿀팁 2 로 직설적으로 적어주세요.

4. 요약 및 카카오톡 공유 유도 (CTA):
   - 맨 마지막에는 "✨ 오늘 내용 핵심 요약 정리! ✨"로 요약하고, 
   - "이 중요한 정보, 나만 알면 안 되겠죠? 지금 당장 사랑하는 가족들에게 카톡으로 공유해주세요!" 라며 강력한 공유 및 행동 유도를 만드세요.
`;
    } else {
      personaGuidance = `
당신은 한국 네이버 블로그 생태계를 완벽하게 파악하고 있는 최고의 '전문가 블로거'이자 친근한 이웃입니다.
최근 조회수가 폭발하는 상위노출 블로그들의 패턴을 완벽히 흡수하여 아래의 [블로그 톤앤매너 및 필수 작성 가이드]를 엄격하게 지켜 작성하세요.

[🚨 치명적 주의사항: 100% 팩트 체크 (항의/신고 방지) 🚨]
당신의 글은 '경제/정책/연금/부동산' 등 독자의 실제 자산과 직결된 치명적인 정보성 글입니다.
잘못된 금리, 없는 혜택, 폐지된 법안을 지어내면 독자들로부터 거센 항의와 신고가 빗발쳐 블로그가 즉시 폐쇄됩니다.
어떤 상황에서도 구글 검색(googleSearch) 결과를 최우선으로 신뢰하며, 결과에 없는 '가상의 금리', '존재하지 않는 아파트 줍줍', '조작된 지원금 액수'를 절대 지어내지 마세요(Hallucination 금지). 불확실성이 1%라도 있다면 확언하지 말고 "자세한 사항은 관할 기관 홈페이지 참조 권장" 식으로 우회하여 팩트를 방어하세요.

[🔥 벤치마킹 완료: 네이버 상위 1% 최상위 포스팅 필수 작성 가이드 🔥]
[★최우수 대박(Hit) 레퍼런스 4종 특성 완벽 복제★]
당신이 이전에 작성하여 폭발적인 조회수를 기록한 4개의 모범 사례(URL 참고용: https://blog.naver.com/interestingmoney/224237824570, https://blog.naver.com/interestingmoney/224237818047, https://blog.naver.com/interestingmoney/224236552131, https://blog.naver.com/interestingmoney/224236507382)의 텍스트 배치, 시각적 기호(📌, 💡, ✔️, ✨) 활용법, 그리고 독자와 밀당하는 구어체 말투(~셨나요?, ~마세요!, ~다 압니다)를 완벽하게 모방하세요!

1. 초강력 도입부 (FOMO 자극 + 공감 훅 + 문제 제기):
   - 글 시작 부분에서 독자의 조급함과 결핍을 강력하게 자극하세요.
   - [필수 예시]: "혹시 지금 'OOO' 검색해보고 불안한 마음에 클릭하셨나요? 나만 또 꿀정보를 놓칠까 봐 조급한 마음 제가 다 압니다."
   - 현재 상황의 답답함(예: "기껏해야 3% 코딱지만한 이자, 세금 떼면 남는 것도 없죠?")을 꼬집은 뒤, "그런데 무려 X% 대박 상품이 나왔습니다! 이 글 하나로 시간 낭비 없이 모두 챙겨가세요." 라며 안심시킵니다.

2. 본문 구조 (명확한 행동 지시 & 수익화 극대화 링크 배치):
   - 대중의 좁은 관심사를 벗어나 네이버 홈판 트래픽을 폭발시키기 위해, 연예인이나 대기업 회장 등 파급력 있는 유명인의 사례나 가십성 멘트를 비유로나마 살짝 섞으며 독자의 지루함을 없애주세요. (예: "요즘 OOO도 뒷목 잡는다는 그 방법!")
   - 복잡한 퍼센트나 용어 설명보다는 [구체적인 액수/수익 차이]를 직접 숫자로 비교해서 보여주세요. (예: "똑같이 3천만원을 맡겨도 A기관보다 B기관에서 무려 472,380원을 더 받습니다!")
   - 각 문단마다 📌 기호를 사용해 넘버링 소제목을 달아주세요. (예: "📌 1. 핵심 조건 분석")

3. 시각적 가독성 극대화 (스마트폰 앱 기준):
   - 긴 글은 반드시 2~3줄 단위로 짧게 쪼개어 가독성을 높이세요. 벽 같은 텍스트 뭉치는 절대 금지.
   
4. [필수 삽입 섹션] 상위 1% 딥(Deep) 인사이트 방출:
   - 본문 후반부에 💡 [상위 1%만 아는 가입/활용 꿀팁 (이거 모르면 손해)] 라는 소제목을 명확하게 만들고,
   - 그 아래에 일반인은 모르는 주의사항이나 리스크 관리법을 ✔️ 꿀팁 하나, ✔️ 꿀팁 둘 항목으로 나누어 직설적으로 적어주세요.

5. 결론 (핵심 문장 요약 및 CTA):
   - 맨 마지막에는 "✨ 오늘 내용 핵심 요약 정리! ✨"로 1~5번까지 번호를 매겨 가장 중요한 팩트만 깔끔하게 요약하세요.
   - "어떠셨나요, 이웃님들? 궁금한 점이 있다면 주저 말고 댓글 남겨주세요!" 라며 유대감을 형성하고 친근하게 마무리하세요.
`;
    }


    const currentYear = new Date().getFullYear();

    let visualGuidance = "";
    if (deviceType === 'mobile') {
        visualGuidance = `
3. 시각적 요소 및 썸네일 구조 (모바일 앱 전용 - 매우 중요!!):
   - 블로그 원본의 필수 레이아웃은 무조건 '대제목 -> 가벼운 인사말 -> [썸네일 이미지] -> 본격적인 본문 내용' 순서여야 합니다. 
   - 따라서 인사말이 끝나는 서론 직후에 반드시 [THUMBNAIL] 이라는 예약어를 단 1번 작성하세요.
   - 네이버 블로그 앱은 외부 사진 복사를 차단하므로 보조 사진 배치 명령어([IMAGE_1] 등)는 생략합니다.

4. 모바일 화면 최적화: 극강의 가독성 및 띄어쓰기 원칙 (가장 기본 HTML 태그와 인라인 컬러만 허용):
   - 네이버 블로그 앱은 복잡한 구조(표, 박스 등)를 부숴버리지만 **단순 글자색과 줄바꿈은 유지**합니다.
   - 따라서 전체 본문을 **오직 <p>, <br>, <b>, <span style="color:색상">** 태그만으로 작성하세요. 
   - <h2>, <h3>, <blockquote>, <table>, <ul>, <li> 등은 복사 시 박살나므로 일절 금지! **마크다운 기호(*, #, - 등)**도 앱에서 깨지므로 **절대 금지**합니다.
   
   - **소제목 구분 및 간격:** 
     소제목은 위/아래로 딱 한 칸 줄바꿈(<br>)만 허용합니다. 빈 줄이 뻥 뚫려 보이는 두 줄 띄어쓰기(<br><br> 또는 <p><br></p>)는 절대 금지합니다.
     올바른 형태 예시:
     <br>
     <p><b>📌 [1. 소제목 이름]</b></p>
     <br>
     <p>내용을 이어서 작성합니다...</p>
   
   - **자연스러운 여백 및 1줄 띄어쓰기 (두 줄 띄어쓰기 절대 금지):** 
     문단과 문단 사이, 또는 문장 사이에 빈 줄이 아예 없도록 **딱 한 번만 줄바꿈(<br>)** 하세요. 
     스마트폰 화면에서 텅 비어 보이지 않게, <br><br>나 <p><br></p> 같은 '두 줄 띄어쓰기'는 절대 피하고 촘촘하게 작성하세요.
   
   - **핵심 포인트 색상 강조:** 가독성을 끌어올리기 위해, 제품명이나 장점 등 중요 포인트에는 <span style="color: #00c73c;">...</span> 나 다른 눈에 띄는 색상을 무조건 적극적으로 사용해서 화사하게 꾸며주세요.`;
    } else {
        visualGuidance = `
3. 시각적 요소 및 썸네일 구조 (매우 중요!!):
   - 블로그 원본의 필수 레이아웃은 무조건 '대제목 -> 가벼운 인사말 -> [썸네일 이미지] -> 본격적인 본문 내용' 순서여야 합니다. 
   - 따라서 인사말이 끝나는 서론 직후에 반드시 [THUMBNAIL] 이라는 예약어를 단 1번 작성하세요.
   - 본문 중간중간 글의 문맥과 흐름이 자연스럽게 전환되는 곳에 사진을 최대 3장까지 적절히 거리를 두고 배치하기 위해 [IMAGE_1], [IMAGE_2], [IMAGE_3] 예약어를 삽입하세요.
   - 절대 <img> 태그 등을 임의로 사용하지 말고 오직 위 텍스트 예약어만 넣어야 합니다.

4. 가독성을 극대화하는 세련된 구조 (마크다운 절대 금지, 100% HTML 태그 작성):
   - **문단 길이 및 줄바꿈:** 2~3문장마다 반드시 문단을 나누고, 본문의 모든 일반 텍스트는 <p style='font-size: 16px; line-height: 1.8; margin-bottom: 26px; color: #333; letter-spacing: -0.5px;'>...</p> 태그로 감싸서 아주 읽기 편하게 만드세요.
   - **표(Table) 작성 규칙:** 마크다운 문법( |---| )은 화면이 깨지므로 절대 쓰지 마세요!! 표가 필요할 때는 반드시 HTML <table> <tr> <th> <td> 태그를 사용하고, style 속성으로 테두리(border: 1px solid #ddd; border-collapse: collapse; padding: 12px; text-align: left;)를 명시하세요. <th>에는 배경색(background-color: #f8f9fa;)도 넣으세요.
   - **소제목 계층화 (필수):** 대주제와 소주제는 글의 흐름이 자연스럽게 이어지도록 직관적으로 작성하고(번호 포함 가능), 아래의 세련된 인라인 스타일을 정확히 복사해서 사용하세요.
     ✅ 대주제 예시: <h2 style='font-size: 24px; font-weight: 800; color: #111; margin-top: 70px; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 2px solid #111;'>1. 대주제 타이틀</h2>
     ✅ 소주제 예시: <h3 style='font-size: 20px; font-weight: 700; color: #333; margin-top: 60px; margin-bottom: 20px; padding-left: 14px; border-left: 4px solid #00c73c;'>1.1. 소주제 타이틀</h3>
   - **리스트(List) 작성 규칙:** <ul> 태그에는 위아래 숨통을 트기 위해 반드시 <ul style='margin-top: 15px; margin-bottom: 35px; padding-left: 22px;'> 를 적용하세요. 그 안의 <li> 태그는 본문과 글씨 크기가 다르게 튀지 않도록 <li style='font-size: 16px; letter-spacing: -0.5px; margin-bottom: 15px; line-height: 1.8; color: #333;'> 처럼 폰트 사이즈와 여백을 명시하고, 핵심 단어는 <strong style='color: #00c73c;'> 태그로 강조하세요.
   - **중요**: HTML 태그에 속성을 넣을 때는 큰따옴표(") 대신 **반드시 홑따옴표(')**를 사용하세요.`;
    }

    const realTimeSeoGuidance = `
[네이버 상위노출 경쟁 분석 및 벤치마킹 (성공 패턴 지속 학습)]
- 구글 검색 도구(Tools)를 활용하여 목표 키워드('${keyword}')로 최근 트래픽이 폭발한 "잘 된 상위노출 블로그 글"을 실시간으로 검색하여 그들의 글쓰기 패턴을 계속 학습하세요.
- 상단 랭커들이 독자 체류 시간을 늘리기 위해 사용한 소제목 배치 구조, 도입부 후킹(Hooking) 방식, 필수 꿀팁(장단점, 혜택, 대기시간 등)을 정밀 벤치마킹하고 그 성공 공식을 체화하여 원고에 녹여내세요.
- 독자가 이 글 하나만 읽어도 블로그 5개를 찾아본 것과 같은 압도적인 가치를 얻도록 작성하되, 복사/붙여넣기는 철저히 배제합니다.
${subKeywordsText}

[🚨 필수 적용: 메가 키워드 타겟팅 금지 및 카피라이팅 지침 🚨]
1. 제목([TITLE]) 생성 시 절대로 포괄적이고 뻔한 "~~~ 총정리!", "~~~ 초보자 필독!" 혹은 아무 의미 없는 이모티콘 떡칠("🚨충격!🚨") 같은 인공지능이 쓴 티가 나는 제목은 피하세요. (경험상 조회수 폭망의 원흉입니다)
2. 만약 주어진 키워드가 광범위하다면(예: '전국 새마을금고 특판', '대한민국 반값여행'), **절대 지역/대상을 광범위하게 쓰지 마시고 핀셋으로 집어내듯 극도로 구체적인 좁은 단위(예: 특정 지점명, 정확한 퍼센트, 구체적인 날짜)로 세분화**해야 조회수가 폭발합니다.

[🔥 어그로 폭발: 실제 조회수 대박 패턴을 적용한 제목 카피라이팅 지침 🔥]
3. 제목([TITLE]) 생성 시 사람들의 '손실 회피 심리'와 '호기심'을 자극하되, **반드시 구체적인 수치(%, 만원, 시간)와 특정 대상**을 조합하세요!
   - 👎 [학습된 실패 사례 (조회수 10 이하, 쓰지마세요!)]: 
     "4월 금리 3.7% 실화? 나만 모르는 전국 새마을금고 신협 비대면 특판..." (너무 광범위함)
     "모르면 20만원 손해! 4월 시작 대한민국 반값여행..." (구체적인 매력 포인트 부족)
     "🚨충격!🚨 2026년 청년주택드림청약통장..." (진부한 클릭베이트 이모티콘)
   
   - 👍 [지향해야 하는 압도적 성공 사례 (방문자 폭발 패턴! - 4월 15일 최신 검증됨)]: 
     "4월 24일 마감! 아직도 신청 안 하셨어요? 최대 1억 지원..." (마감/긴급성 + 어그로 질문 + 구체적 지원금액)
     "이재용도 극대노하는 삼성전자 배당금 수준 ㄷㄷ, 개미들만 몰랐네?" (재벌/유명인 감정 이입 + 경제 하이브리드 어그로)
     "놓치면 9억 손해? 4월 서울 아파트 줍줍 딱 1곳, 청약통장..." (치명적인 손실 금액 제시 + 특정 조건 한정)
     "이재용 딸이 버리고 쓴다는 XX폰 근황, 99%가 놓친 혜택" (셀럽 호기심 자극 + FOMO)

4. 본문 도입부에서도 제목의 기대감을 받아주어, "이 글을 끝까지 안 읽으면 나만 바보가 될 것 같은 불안감"을 조성하며 몰입도를 300% 높이세요. 독자의 결핍(Pain Point)과 생생한 경험담(내돈내산 같은 톤)이 글에 강력하게 묻어나야 합니다.

[🚨 엄격한 자기검열 및 팩트체크 (거짓정보/할루시네이션 원천 차단) 🚨]
5. (가장 중요) 글을 쓰기 전에 **무조건 구글 검색 도구(Google Search Tool)**를 실행하여 해당 키워드나 예금/적금/특판 상품이 **"현재 실존하는지"**, **"이미 마감되지 않았는지"**부터 정확히 팩트체크 하세요.
   - 팩트가 확인되지 않은 가상의 금융상품, 가상의 금리(예: 8%), 지어낸 날짜나 혜택 금액은 단 1원도 혼자 상상해서 지어내지 마세요(Hallucination 절대 금지). 거짓 정보를 작성하면 블로그가 신고 당해 영구 정지됩니다.
   - 단, 조회수 폭발을 위해 '제목이나 서론'에 이재용 등 연예인/재벌 이름을 비유적으로 사용할 때는 **최대한 실제 관련 기사나 검색 사례가 존재하는 선 안에서** 찰지게 후킹하세요. (팩트 기반의 합법적 어그로)
   - 검색 결과, 해당 상품명을 찾을 수 없거나 이미 한도가 소진/마감된 상품이라면 가짜 정보를 꾸며내지 마시고 차라리 노선을 변경하세요. 다음과 같이 우회하십시오: "아쉽게도 해당 OOO 특판은 현재 마감되었거나 조건이 변경되었을 확률이 높습니다. 대신 지금 당장 가입 가능한 현실적인 대안 OOO를 알려드릴게요."
6. "OO신협", "○○은행"과 같이 가상의 블라인드 처리는 절대 금지합니다. 기사나 공식 홈페이지에서 교차 검증된 정확한 팩트(실존하는 지점명, 정확한 이율 소수점, 기간)만 기재하세요. 팩트 확인이 안 되면 쓰지 마세요.
7. 글의 맨 마지막(결론 및 해시태그 바로 위)에는 반드시 아래의 '면책 조항' 텍스트를 정확히 그대로 추가하여 법적/운영적 책임 소지를 방지하세요.
   <br><br><p style='font-size: 13px; color: #888; text-align: center; line-height: 1.5;'>🚨 <b>[팩트체크/면책조항]</b><br>본 포스팅은 정보 공유를 목적으로 작성되었으며, 시장 상황, 정책 변경, 조기 마감 등에 따라 실제 내용이 다를 수 있습니다. 청약, 계약, 상품 가입 전 반드시 해당 기관/금융사 공식 채널에서 최종 확인하시기 바랍니다.</p>
8. **(매우 중요)** 구글 검색을 통해 얻은 원본 검색 데이터(JSON, 파이썬 딕셔너리 텍스트, 예: {'title': ...})를 블로그 본문에 절대 그대로 노출하거나 출력하지 마세요. 검색 결과는 오직 속으로 참고하여 사실 관계를 파악하는 데에만 사용하고, 최종 [CONTENT] 안에는 반드시 자연스러운 인간의 언어로 다듬어진 결과물만 작성해야 합니다.
`;

    let feedbackLearningGuidance = "";
    if (goodUrl || badUrl) {
      feedbackLearningGuidance += `
[개인화된 AI 강화 학습 지침 (매우 중요)]
사용자가 자신의 과거 블로그 포스팅 결과를 바탕으로 다음의 피드백 링크를 제공했습니다. 구글 검색 툴을 이용해 반드시 다음 URL들의 본문 내용을 파악하고 아래 지시를 100% 따르세요.
`;
      if (goodUrl) {
        feedbackLearningGuidance += `- 👍 [성공 사례 벤치마킹 필수 대상]: ${goodUrl}\n  이 글은 트래픽이 터진 '대박' 포스팅입니다. 이 글의 장점(가독성 퀄리티, 정보 배치 순서, 도입부의 공감 요소, 말투 등)을 철저히 분석하고, 이번 포스팅을 작성할 때 이 성공 패턴의 분위기와 전개 방식을 완벽하게 흡수하여 작성하세요.\n`;
      }
      if (badUrl) {
        feedbackLearningGuidance += `- 👎 [실패 사례 회피 필수 대상]: ${badUrl}\n  이 글은 노출되지 않은 '폭망' 포스팅입니다. 이 글의 단점(지루한 서론, 뻔한 정보 나열, 부족한 가독성 등)을 철저히 분석하고, 이번 포스팅에서는 절대로 이 글과 같은 스타일이나 정보 전개 방식을 답습하지 마세요.\n`;
      }
    }

    const prompt = `
${personaGuidance}
${realTimeSeoGuidance}
${feedbackLearningGuidance}

사용자가 검색한 아래 키워드를 바탕으로 최상급 품질의 네이버 블로그 포스팅을 작성하세요.

현재 연도(참고용): ${currentYear}년
목표 검색어/키워드: ${keyword}

${visualGuidance}

[출력 형식 제한]
반드시 아래의 특수 구분자를 사용하여 제목과 본문을 나누어 작성하세요. JSON 형식은 절대 사용하지 마세요.
[TITLE]
(생성된 블로그 제목을 순수 텍스트로 1줄로 작성)
[/TITLE]
[CONTENT]
${deviceType === 'mobile' ? "(생성된 블로그 본문을 <p>, <br>, <b> 태그만을 엄격하게 사용한 형태로 작성)" : "(생성된 블로그 본문을 화려한 HTML 태그 및 CSS가 포함된 텍스트로 작성)"}
[/CONTENT]
`;

    const commonConfig = {
      systemInstruction: "당신은 블로그 포스팅 작가를 돕는 보조 AI입니다. 구글 검색 결과를 통해 팩트를 체크하되, 절대로 검색 결과의 원본 데이터(JSON이나 파이썬 딕셔너리 구조, {'title': ...})를 사용자에게 그대로 노출하거나 본문에 출력하지 마세요. 오직 깔끔하게 다듬어진 블로그 [CONTENT] 텍스트만 출력해야 합니다.",
      temperature: 0.7,
      maxOutputTokens: 8192,
      tools: [{ googleSearch: {} }],
      // @ts-ignore
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    };

    let streamRes: any;
    // 무료 API의 RPM 한도(2회)에 걸리는 Pro 모델 대신 Flash 모델들을 최우선 시도. NOT_FOUND 방지를 위해 정확한 최신 모델명 기입.
    const generateModels = [
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-latest"
    ];
    let genAttempt = 0;

    while (genAttempt < generateModels.length) {
      try {
        const currentModel = generateModels[genAttempt];
        
        // 마지막 최후의 보루 시도 시, 구글 검색 도구가 503 원인일 수 있으므로 검색 없이 순수 AI 지식으로만 생성합니다.
        const currentConfig = genAttempt === generateModels.length - 1 
          ? { ...commonConfig, tools: undefined } 
          : commonConfig;

        streamRes = await ai.models.generateContentStream({
          model: currentModel,
          contents: prompt,
          config: currentConfig,
        });
        break; // 성공 시 루프 탈출
      } catch (generateErr: any) {
        genAttempt++;
        const is503 = generateErr?.status === 503 || generateErr.message?.includes('503') || generateErr.message?.includes('high demand') || generateErr.message?.includes('UNAVAILABLE');
        const is429 = generateErr?.status === 429 || generateErr.message?.includes('429') || generateErr.message?.includes('quota');
        
        if ((is503 || is429) && genAttempt < generateModels.length) {
          const waitMs = is429 ? 10000 : 3000; // 429 쿼터 초과는 10초 대기, 503은 3초 대기
          console.warn(`[Generate] 503/429 on ${generateModels[genAttempt-1]}. Waiting ${waitMs}ms before falling back to ${generateModels[genAttempt]}...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue; 
        } else {
          throw generateErr;
        }
      }
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // 2. [비주얼 강화] 생성된 텍스트를 바탕으로 뚜렷한 타이포그래피 썸네일 생성 (next/og 활용) 또는 AI 아바타 썸네일
    let thumbnailHtml = "";
    
    try {
      const topParams = encodeURIComponent(searchParams.thumbnailTop || '주목할 만한 정보');
      const midParams = encodeURIComponent(searchParams.thumbnailMid || keyword || '핵심 요약');
      const bottomParams = encodeURIComponent(searchParams.thumbnailBottom || '5분만에 알아보기');
      
      const styleParam = category ? `&style=${category}` : "";
      const ogUrl = `${baseUrl}/api/og?top=${topParams}&mid=${midParams}&bottom=${bottomParams}${styleParam}&ext=.png`;

      thumbnailHtml = `<div style="text-align: center; margin-bottom: 24px;">
        <img src="${ogUrl}" alt="대표 썸네일" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);" />
      </div>`;
    } catch (imgError) {
      console.error("OG Thumbnail Generation Failed:", imgError);
    }

    let processedImages: string[] = [];
    if (deviceType === 'desktop') {
      processedImages = imageUrls.slice(1).map(url => `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`);
    }

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const metaMsg = JSON.stringify({ type: 'meta', thumbnailHtml, images: processedImages });
          controller.enqueue(encoder.encode(`data: ${metaMsg}\n\n`));

          for await (const chunk of streamRes) {
            if (chunk.text) {
              const textMsg = JSON.stringify({ type: 'text', text: chunk.text });
              controller.enqueue(encoder.encode(`data: ${textMsg}\n\n`));
            }
          }
          controller.close();
        } catch (e) {
          console.error("Stream Error:", e);
          controller.error(e);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate blog post" },
      { status: 500 }
    );
  }
}
