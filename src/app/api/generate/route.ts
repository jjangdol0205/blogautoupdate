import { GoogleGenAI } from "@google/genai";


import { NextResponse } from "next/server";





export const maxDuration = 60; // Increase Vercel timeout to 60 seconds








// Initialize Gemini SDK


// Note: You must have GEMINI_API_KEY in your .env.local file


const ai = new GoogleGenAI({});





export async function POST(req: Request) {


  try {


    const { keyword, blogType = 'health', deviceType = 'desktop' } = await req.json();





    if (!keyword) {


      return NextResponse.json(


        { error: "Keyword is required" },


        { status: 400 }


      );


    }





    // Pixabay API뒗 븳湲 寃깋룄 留ㅼ슦 媛뺣젰븯誘濡, 쁺뼱 寃깋뼱 媛뺣컯쓣 踰꾨━怨 吏곴쟻씤 궎썙뱶瑜 異붿텧븯룄濡 봽濡ы봽듃 蹂寃


    let keywordGuidance = "";


    if (blogType === 'health') {


      keywordGuidance = "젙遺 吏썝湲 釉붾줈洹몄슜씠誘濡, '꽌瑜', '怨꾩궛湲', '룞쟾', '吏媛', '嫄닿컯蹂댄뿕' 벑 吏곴쟻씠怨 븘湲곗옄湲고븳 젙遺 삙깮 愿젴 궗臾 '븳湲 떒뼱'瑜 紐낆궗삎깭濡 꽑깮븯꽭슂. 꽌뼇씤 쉶쓽떎 궗吏꾩 젅 뵾븯꽭슂.";


    } else if (blogType === 'wisdom') {


      keywordGuidance = "씤깮 吏삙 씤媛꾧怨 釉붾줈洹몄슜씠誘濡, '옄뿰', '李살옍', '梨', '湲', '굹臾', '뻼궡' 벑 렪븞븯怨 궗깋쟻씤 궗臾쇱씠굹 뭾寃 '븳湲 떒뼱'瑜 紐낆궗삎깭濡 꽑깮븯꽭슂. 궗엺 뼹援댁씠 굹삤뒗 궗吏꾩 뵾븯꽭슂.";


    } else if (blogType === 'economy') {


      keywordGuidance = "눜/寃쎌젣 釉붾줈洹몄슜씠誘濡, '룞쟾', '湲덊넻', '怨꾩궛湲', '吏媛', '옄씪굹뒗 깉떦', '而ㅽ뵾옍' 벑 吏곴쟻씠怨 븘湲곗옄湲고븳 옄궛 愿由 궗臾 '븳湲 떒뼱'瑜 紐낆궗삎깭濡 꽑깮븯꽭슂. 꽌뼇씤 쉶쓽떎 궗吏꾩 젅 뵾븯꽭슂.";


    } else if (blogType === 'corporate') {


      keywordGuidance = "湲곗뾽 遺꾩꽍 諛 二쇱떇 닾옄 釉붾줈洹몄슜씠誘濡, '洹몃옒봽', '솕궡몴', '李⑦듃', '紐⑤땲꽣', '嫄대Ъ', '룞쟾' 벑 鍮꾩쫰땲뒪 닾옄瑜 긽吏뺥븯뒗 吏곴쟻씠怨 源붾걫븳 궗臾 '븳湲 떒뼱'瑜 紐낆궗삎깭濡 꽑깮븯꽭슂. 꽌뼇씤 쉶쓽떎 궗吏꾩 젅 뵾븯꽭슂.";


    } else if (blogType === 'corporate') {


      keywordGuidance = "湲곗뾽 遺꾩꽍 諛 二쇱떇 닾옄 釉붾줈洹몄슜씠誘濡, '洹몃옒봽', '솕궡몴', '李⑦듃', '紐⑤땲꽣', '嫄대Ъ', '룞쟾' 벑 鍮꾩쫰땲뒪 닾옄瑜 긽吏뺥븯뒗 吏곴쟻씠怨 源붾걫븳 궗臾 '븳湲 떒뼱'瑜 紐낆궗삎깭濡 꽑깮븯꽭슂. 꽌뼇씤 쉶쓽떎 궗吏꾩 젅 뵾븯꽭슂.";


    } else {


      keywordGuidance = "異붿긽쟻씤 媛쒕뀗씪 寃쎌슦 꽌뼇씤 궗臾댁떎 궗吏꾩씠 굹삤吏 븡룄濡 떆媛곸쟻쑝濡 吏곴쟻씠怨 긽吏뺤쟻씤 궗臾/뭾寃 '븳湲 떒뼱'瑜 紐낆궗삎깭濡 꽑깮븯꽭슂.";


    }





    const translatePrompt = `떦떊 寃깋뼱뿉꽌 媛옣 빑떖쟻씠怨 떆媛곸쟻씤 씠誘몄瑜 異붿텧븯뒗 봽濡ы봽듃 뿏吏땲뼱엯땲떎. 


    궗슜옄媛 엯젰븳 寃깋뼱뿉 媛옣 李곕뼞媛숈씠 뼱슱由щ뒗 怨좏뭹吏 궗吏꾩쓣 뵿궗踰좎씠(Pixabay)뿉꽌 李얘린 쐞빐, 紐낇솗븳 떒뼱 2媛쒕 異붿텧븯꽭슂.


    ${keywordGuidance}





    1. primary: 寃깋뼱瑜 媛옣 옒 몴쁽븯뒗 援ъ껜쟻씠怨 媛먭컖쟻씤 떒뼱 1~2媛


    2. fallback: primary 寃깋 떎뙣 떆 궗슜븷, 寃깋뼱쓽 긽쐞 移댄뀒怨좊━뿉 빐떦븯뒗 留ㅼ슦 룷愿꾩쟻씠怨 以묒쟻씤 떒뼱 1~2媛 (삁: 옄뿰, 湲곗닠, 鍮꾩쫰땲뒪, 쓬떇, 嫄닿컯, 씤뀒由ъ뼱, 룄떆 벑 臾댁“嫄 寃깋 寃곌낵媛 닔留 옣뵫 굹삤뒗 꼻 쓽誘몄쓽 떒뼱)


    


    삁떆:


    "諛몃쪟뾽 愿젴二 異붿쿇" -> {"primary": "二쇱떇 李⑦듃", "fallback": "湲덉쑖"}


    "궪꽦쟾옄 二쇨諛⑺뼢" -> {"primary": "룞쟾 吏媛", "fallback": "鍮꾩쫰땲뒪"}


    "븘씠룿 15 봽濡 옄湲됱젣 援щℓ" -> {"primary": "뒪留덊듃룿", "fallback": "湲곗닠"}


    "엫쁺썒 肄섏꽌듃 썑湲" -> {"primary": "留덉씠겕 議곕챸", "fallback": "쓬븙 臾대"}


    "넚媛씤 끂옒 紐⑥쓬" -> {"primary": "諛섏쭩씠뒗 쓬몴", "fallback": "怨듭뿰옣"}


    "媛뺤븘吏 뿬由 궛梨" -> {"primary": "媛뺤븘吏 궛梨", "fallback": "룞臾"}


    "떎씠뼱듃 떇떒" -> {"primary": "떎씠뼱듃 깘윭뱶", "fallback": "쓬떇"}





    諛섎뱶떆 븘옒 JSON 삎떇쑝濡쒕쭔 쓳떟븯꽭슂. 떎瑜 臾몄옣 遺샇굹 꽕紐낆 젅 遺숈씠吏 留덉꽭슂.


    {"primary": "...", "fallback": "..."}


    


    궗슜옄 寃깋뼱: ${keyword}`;





    const transRes = await ai.models.generateContent({


      model: "gemini-2.5-flash",


      contents: translatePrompt,


      config: { temperature: 0.1, responseMimeType: "application/json" },


    });


    


    // 궎썙뱶 젙젣


    let searchParams = { primary: "궗臾댁떎", fallback: "鍮꾩쫰땲뒪" };


    try {


      const cleanText = (transRes.text || "{}").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();


      const parsed = JSON.parse(cleanText);


      if (parsed.primary && parsed.fallback) {


        searchParams = parsed;


      }


    } catch (e) {


      console.error("Failed to parse translatePrompt JSON:", e);


    }





    // 2. Pixabay API瑜 넻빐 떎젣 옉룞븯뒗 怨좏솕吏 궗吏 URL 理쒕 4옣 媛졇삤湲 (諛곌꼍슜 1옣 + 蹂몃Ц슜 理쒕 3옣)


    let imageUrls: string[] = [];


    


    async function fetchPixabayImages(kw: string) {


      try {


        const apiKey = process.env.PIXABAY_API_KEY;


        


        if (!apiKey) {


          console.warn("Pixabay API 궎媛 꽕젙릺吏 븡븯뒿땲떎. (.env.local 솗씤 븘슂)");


          return [];


        }





        // 뵿궗踰좎씠 寃깋 API 샇異


        // &min_width=800&min_height=600&orientation=horizontal 異붽


        const res = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(kw)}&image_type=photo&orientation=horizontal&min_width=800&per_page=15`);


        if (res.ok) {


          const json = await res.json();


          if (json.hits && json.hits.length >= 4) {


            // 寃곌낵 諛곗뿴쓣 옖뜡븯寃 꽎뼱꽌 留ㅻ쾲 떎瑜 궗吏꾩씠 굹삤룄濡 븿


            const shuffled = json.hits.sort(() => 0.5 - Math.random());


            // 뵿궗踰좎씠뒗 largeImageURL쓽 吏곸젒 留곹겕(Hotlinking)瑜 403 뿉윭濡 李⑤떒빀땲떎. 뵲씪꽌 쇅遺 留곹겕媛 뿀슜맂 webformatURL쓣 궗슜빐빞 洹몃┝씠 源⑥吏 븡뒿땲떎.


            return shuffled.slice(0, 4).map((item: { webformatURL: string }) => item.webformatURL);


          }


        } else {


          console.error("Pixabay API Error:", res.status, await res.text());


        }


      } catch (e) {


        console.error("Pixabay fetch error:", e);


      }


      return [];


    }





    // 1李 떆룄: AI媛 異붿텧븳 二쇰젰 궎썙뱶濡 寃깋


    imageUrls = await fetchPixabayImages(searchParams.primary);


    


    // 2李 떆룄: 寃곌낵媛 4옣 誘몃쭔씠硫, AI媛 異붿텧븳 룷愿꾩쟻씤 fallback 궎썙뱶濡 옱寃깋 (二쇱젣 씪愿꽦 쑀吏)


    if (imageUrls.length < 4) {


       imageUrls = await fetchPixabayImages(searchParams.fallback);


    }





    // 3李 떆룄: 洹몃옒룄 떎뙣뻽떎硫 理쒗썑쓽 닔떒쑝濡 젅 源⑥吏 븡뒗 븯뱶肄붾뵫맂 怨좏솕吏 씠誘몄 4옣 젣怨 (Unsplash 臾댁젣븳 뿀슜 留곹겕)


    if (imageUrls.length < 4) {


       imageUrls = [


         "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1080&auto=format&fit=crop",


         "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop",


         "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1080&auto=format&fit=crop",


         "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1080&auto=format&fit=crop"


       ];


    }





    


    // [IMAGE_X] 뵆젅씠뒪뜑瑜 굹以묒뿉 떎젣 깭洹몃줈 移섑솚븷 삁젙씠誘濡 二쇱엯슜 뀓뒪듃 젣嫄


    // 3. 蹂몃Ц 깮꽦 硫붿씤 봽濡ы봽듃 (媛졇삩 궗吏 URL 吏곸젒 닾엯)


    let personaGuidance = "";


    if (blogType === 'health') {


        personaGuidance = `


떦떊 븳誘쇨뎅 꽕씠踰 釉붾줈洹 깮깭怨꾨 셿踰쏀븯寃 씠빐븯怨 엳쑝硫, 젙遺 蹂대룄옄猷뚮 5060 떆媛곸뿉꽌 '굹룄 諛쏆쓣 닔 엳굹?'씪뒗 愿젏쑝濡 뼱꽌 꽕紐낇븯뒗 蹂듭 쟾臾멸 씪紐 **'吏썝湲 留덉뒪꽣 (源뙟)'**엯땲떎.


씠 釉붾줈洹몄쓽 빑떖 肄섏뀎듃뒗 "蹂듭옟븳 젙遺 삙깮, 궡 吏媛 냽쑝濡 룞 뱾뼱삤寃!" 엯땲떎. 궗슜옄 궎썙뱶瑜 諛뷀깢쑝濡 젙蹂댁꽦 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 븘닔 옉꽦 媛씠뱶]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - 룆옄瑜 諛섎뱶떆 "슦由 룆옄떂뱾~", "꽑諛곕떂뱾", "떆땲뼱 뿬윭遺" 벑쑝濡 移쒓렐븯寃 吏移븯꽭슂.


   - 湲쓽 遺꾩쐞湲곤옙    } else if (blogType === 'economy') {


        personaGuidance = `


떦떊 눜 꽕怨 遺꾩빞쓽 씪 媛뺤궗씠옄, 떆땲뼱뱾쓽 깮솢鍮꾩 젅꽭瑜 吏耳쒕뱶由щ뒗 씪紐 **'눜 寃쎌젣 쟾臾멸 (源뙟)'**엯땲떎.


씠 釉붾줈洹몄쓽 紐⑦넗뒗 "눜뒗 걹씠 븘땶 깉濡쒖슫 떆옉엯땲떎." 엯땲떎. 궗슜옄쓽 궎썙뱶瑜 蹂닿퀬 蹂듭옟븳 뿰湲, 嫄대낫猷 벑 끂썑 룉 臾몄젣瑜 냽 떆썝븯寃 뙆뿤移섎뒗 젙蹂댁꽦 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 뜲씠꽣 솢슜 썝移 (媛옣 以묒슂!!!)]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - "눜瑜 븵몢떊 50, 60 뿬윭遺", "삤뒛룄 뭹寃 엳뒗 끂썑瑜 以鍮꾪븯떆뒗 떆땲뼱 꽑諛곕떂뱾" 벑쑝濡 吏移빀땲떎.


   - 媛먯꽦뙏씠蹂대떎뒗 셿쟾븳 **[뙥듃, 닽옄, 떎슜꽦]** 以묒떖쑝濡 씠꽦쟻씠怨 뒪留덊듃븯寃 꽌닠빀땲떎. ("~씪뒗 궗떎, 븣怨 怨꾩뀲뒿땲源?", "~媛 빑떖엯땲떎", "~瑗 湲곗뼲븯떗떆삤.")


   - 쟾臾몄쟻씤 꽭臾/嫄대낫猷 吏떇쓣 삁由ы븯寃 遺꾩꽍븯릺, 떎깮솢뿉 쟻슜븷 닔 엳寃 궗濡(삁: 嫄대낫猷 뵾遺뼇옄 옄寃 諛뺥깉 湲곗 벑)瑜 뱾뼱 돺寃 꽕紐낇빀땲떎. 媛뺤“ 몴떆湲고샇(쐟, 윋, 윊, 윊)瑜 쟻젅엳 궗슜빀땲떎.





2. 궡슜 쟾媛 諛⑹떇 諛 뜲씠꽣 솢슜 썝移:


   - [븘닔 젙蹂 異쒖쿂]: 諛섎뱶떆 떎쓬 怨듭떇 뜲씠꽣瑜 湲곕컲쑝濡 븳떎怨 媛젙븯怨 젙솗븯寃 옉꽦븯꽭슂.


     1) 援誘쇱뿰湲덇났떒 (nps.or.kr): 끂졊뿰湲 닔졊븸 궛젙, 議곌린닔졊 옣떒젏 벑 뿰湲 젣룄 洹쒖젙


     2) 援誘쇨굔媛뺣낫뿕怨듬떒 (nhis.or.kr): 嫄닿컯蹂댄뿕猷 遺怨 泥닿퀎 媛쒗렪븞, 뵾遺뼇옄 깉씫 슂嫄 벑


     3) 湲덉쑖媛먮룆썝 넻빀뿰湲덊룷꽭 (100lifeplan.fss.or.kr): 눜吏곸뿰湲/媛쒖씤뿰湲 꽭젣 삙깮 벑


     4) 援꽭泥 (nts.go.kr): 긽냽꽭/利앹뿬꽭 벑 떆땲뼱 젅꽭 媛씠뱶


   - [삤봽떇]: <blockquote> 깭洹몃 궗슜빐, "理쒓렐 嫄닿컯蹂댄뿕猷 媛쒗렪쑝濡 떆땲뼱뱾쓽 諛쒕벑뿉 遺덉씠 뼥뼱議뚯뒿땲떎." 泥섎읆 룆옄뱾쓽 媛옣 겙 遺덉븞 슂냼(룉 臾몄젣)瑜 뙥듃 븿猿 肄 吏싳뼱 뜕吏묐땲떎.


   - [蹂몃줎 넄猷⑥뀡 (몴 옉꽦씠 빑떖!!!)]: 異붿긽쟻 쐞濡쒓 븘땲씪 뙥듃瑜 寃利앺빐빞 빀땲떎. 젣룄瑜 鍮꾧탳븯嫄곕굹 怨꾩궛빐빞 븷 궡슜(삁: 嫄대낫猷 媛쒗렪 쟾/썑)씠 臾댁“嫄 굹샃땲떎. 쁾留덊겕떎슫(Markdown) 臾몃쾿 젅 벐吏 留먭퀬, 臾댁“嫄 HTML <table> 깭洹몃 궗슜빐 몴 1媛 씠긽쓣 吏곴쟻쑝濡 옉꽦븯꽭슂.


   - [留덈Т由]: 留됱뿰븳 쐞濡쒓 븘땶, "븘뒗 留뚰겮 븘겮怨 吏궗 닔 엳뒿땲떎. 눜 寃쎌젣 쟾臾멸 源뙟怨 븿猿 移섎븯寃 鍮꾪븯떗떆삤. 뿬윭遺꾩쓽 뭹寃 엳뒗 눜瑜 쓳썝빀땲떎."씪뒗 留븐쓬留먯쓣 궓寃 옒쓣 떎뼱以띾땲떎.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#떆땲뼱寃쎌젣 #눜以鍮 #끂썑꽕怨 #눜寃쎌젣쟾臾멸 #援誘쇱뿰湲 #嫄닿컯蹂댄뿕猷' 媛 룷븿릺뼱빞 빀땲떎.


`;


    } else if (blogType === 'corporate') {


        personaGuidance = `


떦떊 援궡쇅 二쇱떇 떆옣怨 湲곗뾽쓽 옱臾, 鍮꾩쫰땲뒪 紐⑤뜽쓣 궇移대∼寃 뙆뿤移섎뒗 씪紐 **'湲곗뾽遺꾩꽍 쟾臾멸 (源뙟)'**엯땲떎.


씠 釉붾줈洹몄쓽 紐⑦넗뒗 "닽옄뒗 嫄곗쭞留먯쓣 븯吏 븡뒗떎, 뙥듃濡 듅遺븯뒗 닾옄 닾떆寃" 엯땲떎. 궗슜옄쓽 궎썙뱶瑜 蹂닿퀬 뙥듃 떆옣 룞뼢쓣 湲곕컲쑝濡 湲곗뾽쓽 媛移섏 닾옄 룷씤듃瑜 紐낆풄븯寃 吏싳뼱二쇰뒗 젙蹂댁꽦 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 뜲씠꽣 솢슜 썝移 (媛옣 以묒슂!!!)]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - "媛쒖씤 닾옄옄 뿬윭遺", "뒪留덊듃븳 二쇱＜떂뱾" 벑쑝濡 吏移빀땲떎.


   - 媛먯젙쟻씤 뇤뵾뀥蹂대떎뒗 **[뙥듃, 옱臾댁젣몴, 떆옣 뜲씠꽣]** 以묒떖쑝濡 끉由ъ쟻씠怨 媛앷쟻쑝濡 꽌닠빀땲떎. ("~씪뒗 뜲씠꽣媛 利앸챸빀땲떎", "~二쇰ぉ빐빞 븷 룷씤듃엯땲떎", "~由ъ뒪겕瑜 젏寃븯떗떆삤.")


   - 쟾臾몄쟻씤 湲덉쑖/닾옄 슜뼱(PER, PBR, 쁺뾽씠씡瑜 벑)瑜 궗슜븯릺, 珥덈낫옄룄 씠빐븷 닔 엳寃 鍮꾩쑀瑜 뱾뼱 돺寃 꽕紐낇빀땲떎. 媛뺤“ 몴떆湲고샇(윋, 윋, 윊, 윍)瑜 쟻젅엳 궗슜빀땲떎.





2. 궡슜 쟾媛 諛⑹떇 諛 뜲씠꽣 솢슜 썝移:


   - [븘닔 젙蹂 異쒖쿂]: 諛섎뱶떆 쟾옄怨듭떆떆뒪뀥(DART), 湲濡쒕쾶 寃쎌젣 湲곗궗, 궛뾽 由ы룷듃 벑쓽 媛앷쟻씠怨 怨듭떇쟻씤 뜲씠꽣瑜 湲곕컲쑝濡 븳떎怨 媛젙븯怨 옉꽦븯꽭슂.


   - [삤봽떇]: <blockquote> 깭洹몃 궗슜빐, "理쒓렐 빐떦 湲곗뾽쓣 몮윭떬 떆옣쓽 吏媛 蹂룞씠 떖긽移 븡뒿땲떎." 泥섎읆 룆옄뱾쓽 닾옄 샇湲곗떖怨 떆옣쓽 솕몢瑜 뙥듃 븿猿 뜕吏묐땲떎.


   - [蹂몃줎 넄猷⑥뀡 (몴 옉꽦씠 빑떖!!!)]: 떒닚븳 二쇨 굹뿴씠 븘땲씪 鍮꾩쫰땲뒪 紐⑤뜽씠굹 떎쟻, 寃쎌웳궗 鍮꾧탳瑜 遺꾩꽍빐빞 빀땲떎. 쁾留덊겕떎슫(Markdown) 臾몃쾿 젅 벐吏 留먭퀬, 臾댁“嫄 HTML <table> 깭洹몃 궗슜빐 빑떖 옱臾 룷씤듃굹 닾옄 吏몴瑜 몴 1媛 씠긽쑝濡 吏곴쟻쑝濡 옉꽦븯꽭슂.


   - [留덈Т由]: "닾옄쓽 梨낆엫 蹂몄씤뿉寃 엳吏留, 遺꾩꽍 源뙟씠 룙寃좎뒿땲떎. 湲고쉶瑜 꽑젏븯뒗 쁽紐낇븳 닾옄瑜 湲곗썝빀땲떎."씪뒗 留븐쓬留먯쓣 궓寃 옒쓣 떎뼱以띾땲떎.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#湲곗뾽遺꾩꽍 #二쇱떇닾옄 #二쇨쟾留 #湲곗뾽遺꾩꽍쟾臾멸 #媛移섑닾옄 #源뙟쓽닾옄끂듃' 媛 룷븿릺뼱빞 빀땲떎.


`;


    } else if (blogType === 'corporate') {


        personaGuidance = `


떦떊 援궡쇅 二쇱떇 떆옣怨 湲곗뾽쓽 옱臾, 鍮꾩쫰땲뒪 紐⑤뜽쓣 궇移대∼寃 뙆뿤移섎뒗 씪紐 **'湲곗뾽遺꾩꽍 쟾臾멸 (源뙟)'**엯땲떎.


씠 釉붾줈洹몄쓽 紐⑦넗뒗 "닽옄뒗 嫄곗쭞留먯쓣 븯吏 븡뒗떎, 뙥듃濡 듅遺븯뒗 닾옄 닾떆寃" 엯땲떎. 궗슜옄쓽 궎썙뱶瑜 蹂닿퀬 뙥듃 떆옣 룞뼢쓣 湲곕컲쑝濡 湲곗뾽쓽 媛移섏 닾옄 룷씤듃瑜 紐낆풄븯寃 吏싳뼱二쇰뒗 젙蹂댁꽦 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 뜲씠꽣 솢슜 썝移 (媛옣 以묒슂!!!)]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - "媛쒖씤 닾옄옄 뿬윭遺", "뒪留덊듃븳 二쇱＜떂뱾" 벑쑝濡 吏移빀땲떎.


   - 媛먯젙쟻씤 뇤뵾뀥蹂대떎뒗 **[뙥듃, 옱臾댁젣몴, 떆옣 뜲씠꽣]** 以묒떖쑝濡 끉由ъ쟻씠怨 媛앷쟻쑝濡 꽌닠빀땲떎. ("~씪뒗 뜲씠꽣媛 利앸챸빀땲떎", "~二쇰ぉ빐빞 븷 룷씤듃엯땲떎", "~由ъ뒪겕瑜 젏寃븯떗떆삤.")


   - 쟾臾몄쟻씤 湲덉쑖/닾옄 슜뼱(PER, PBR, 쁺뾽씠씡瑜 벑)瑜 궗슜븯릺, 珥덈낫옄룄 씠빐븷 닔 엳寃 鍮꾩쑀瑜 뱾뼱 돺寃 꽕紐낇빀땲떎. 媛뺤“ 몴떆湲고샇(윋, 윋, 윊, 윍)瑜 쟻젅엳 궗슜빀땲떎.





2. 궡슜 쟾媛 諛⑹떇 諛 뜲씠꽣 솢슜 썝移:


   - [븘닔 젙蹂 異쒖쿂]: 諛섎뱶떆 쟾옄怨듭떆떆뒪뀥(DART), 湲濡쒕쾶 寃쎌젣 湲곗궗, 궛뾽 由ы룷듃 벑쓽 媛앷쟻씠怨 怨듭떇쟻씤 뜲씠꽣瑜 湲곕컲쑝濡 븳떎怨 媛젙븯怨 옉꽦븯꽭슂.


   - [삤봽떇]: <blockquote> 깭洹몃 궗슜빐, "理쒓렐 뿃뿃 궛뾽쓽 吏媛 蹂룞 以묒떖뿉 씠 湲곗뾽씠 엳뒿땲떎." 泥섎읆 룆옄뱾쓽 닾옄 샇湲곗떖怨 떆옣쓽 솕몢瑜 뙥듃 븿猿 뜕吏묐땲떎.


   - [蹂몃줎 넄猷⑥뀡 (몴 옉꽦씠 빑떖!!!)]: 떒닚븳 二쇨 굹뿴씠 븘땲씪 鍮꾩쫰땲뒪 紐⑤뜽씠굹 떎쟻, 寃쎌웳궗 鍮꾧탳瑜 遺꾩꽍빐빞 빀땲떎. 쁾留덊겕떎슫(Markdown) 臾몃쾿 젅 벐吏 留먭퀬, 臾댁“嫄 HTML <table> 깭洹몃 궗슜빐 빑떖 옱臾 룷씤듃굹 닾옄 吏몴瑜 몴 1媛 씠긽쑝濡 吏곴쟻쑝濡 옉꽦븯꽭슂.


   - [留덈Т由]: "닾옄쓽 梨낆엫 蹂몄씤뿉寃 엳吏留, 遺꾩꽍 源뙟씠 룙寃좎뒿땲떎. 꽦怨듭쟻씤 닾옄瑜 湲곗썝빀땲떎."씪뒗 留븐쓬留먯쓣 궓寃 옒쓣 떎뼱以띾땲떎.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#湲곗뾽遺꾩꽍 #二쇱떇닾옄 #二쇨쟾留 #湲곗뾽遺꾩꽍쟾臾멸 #源뙟쓽닾옄끂듃' 媛 룷븿릺뼱빞 빀땲떎.


`;


    }> 깭洹몃 궗슜븯뿬 몴 1媛 씠긽쑝濡 젙由ы븯꽭슂. (留덊겕떎슫 몴 ' |---| ' 臾몃쾿 젅 湲덉! 삤吏 HTML <table>, <tr>, <th>, <td> 씤씪씤 CSS 궗슜)


   - [湲덉 궗빆]: 異쒖쿂媛 遺덈텇紐낇븳 而ㅻㅻ땲떚 猷⑤㉧굹 '移대뜑씪' 넻떊 젅 씤슜븯吏 留덉꽭슂!!


   - [留덈Т由]: "怨듭떇 솃럹씠吏(蹂듭濡, 蹂댁“湲24 벑)뿉꽌 븳 踰 뜑 瑗 솗씤빐蹂댁떆怨 삙깮 梨숆린꽭슂! 吏湲덇퉴吏 吏썝湲 留덉뒪꽣 源뙟씠뿀뒿땲떎." 씪뒗 臾멸뎄瑜 留븐쓬留먯뿉 꽔뼱二쇱꽭슂.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#젙遺吏썝湲 #蹂듭삙깮 #떆땲뼱嫄닿컯 #吏썝湲덈쭏뒪꽣 #源뙟쓽쁺썒씪뵒삤 #끂옒븯뒗泥異' 씠 룷븿릺뼱빞 빀땲떎.


`;


    } else if (blogType === 'wisdom') {


        personaGuidance = `


떦떊 궗엺뱾쓽 吏移 留덉쓬쓣 쐞濡쒗븯怨 궣쓽 넻李곗쓣 쟾빐二쇰뒗 씤깮 硫섑넗 **'씤깮 吏삙 씤媛꾧怨 (源뙟)'**엯땲떎. 


떦떊 쁽븰쟻씠吏 븡怨 렪븞븳 뼱議곕줈 씤媛꾧怨꾩쓽 吏삙, 紐낆뼵, 떖由ы븰쟻 넻李곗쓣 떎猷밸땲떎. 궗슜옄쓽 궎썙뱶瑜 蹂닿퀬 4060 꽭媛 源딆씠 怨듦컧븯怨 移댁뭅삤넚쑝濡 吏씤뱾뿉寃 怨듭쑀븯怨 떢뼱吏뒗 뵲쑜븯怨 吏삙濡쒖슫 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 븘닔 옉꽦 媛씠뱶]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - 룆옄 뿬윭遺꾩쓣 "슦由 踰쀫떂뱾", "씤깮쓽 꽑諛곕떂뱾", "냼以묓븳 씤뿰" 벑쑝濡 移쒓렐븯怨 뵲쑜븯寃 移빀땲떎.


   - 臾몄껜뒗 씪뵒삤 DJ굹 렪븞븳 李살쭛 二쇱씤씠 씠빞湲고븯벏 떎젙븯怨 李⑤텇븳 議곗뼵쓽 넠("~씪뒗 깮媛곸씠 벊땲떎", "~븯떆湲 諛붾엻땲떎")쓣 쑀吏븯릺, 씠紐⑦떚肄(삎, 윁, 윋, 윧섃띯셽截)쓣 留덉쓬쓣 렪븞븯寃 빐二쇰뒗 슜룄濡 쟻젅엳 벐꽭슂.





2. 궡슜 쟾媛 諛⑹떇 諛 뜲씠꽣 솢슜 썝移 (媛옣 以묒슂!!!):


   - [紐낆뼵 諛 떖由 씤슜]: 룞꽌뼇쓽 怨좎쟾 紐낆뼵(끉뼱, 끂옄, 泥좏븰옄 벑)씠굹 쁽 떖由ы븰쓽 媛꾨떒븳 씠濡좎쓣 옄뿰뒪읇寃 씤슜븯뿬 湲쓽 뭹寃⑹쓣 넂씠꽭슂.


   - [삤봽떇]: <blockquote> 깭洹몃 궗슜빐, 삤뒛 떎猷 二쇱젣뿉 留욌뒗 吏㏃ 紐낆뼵씠굹 떙洹, 샊 늻援щ굹 怨듦컧븷 留뚰븳 씤媛꾧怨꾩쓽 봺벝븯怨좊룄 뵲쑜븳 떒긽쓣 遺뱶읇寃 뜕吏硫 떆옉빀땲떎.


   - [蹂몃줎 넻李]: 留됱뿰븳 쐞濡쒕낫떎뒗, "굹瑜 吏궎硫댁꽌 씤怨 옒 吏궡뒗 踰", "留덉쓬쓣 궡젮넃뒗 吏삙" 벑 떎깮솢뿉꽌 쟻슜븷 닔 엳뒗 援ъ껜쟻씤 궣쓽 깭룄瑜 2~3媛吏濡 굹늻뼱 源딆씠 엳寃, HTML 몴(Table)굹 젙由щ맂 HTML 룷留룹쓣 씠슜빐 씫湲 돺寃 吏싳뼱以띾땲떎.


   - [湲덉 궗빆]: 꼫臾 옄洹뱀쟻씠嫄곕굹 洹밸떒쟻씤 떒젅쓣 議곗옣븯뒗 궡슜 뵾븯怨, 룷슜怨 꽦李곗쓣 媛뺤“븯꽭슂.


   - [留덈Т由]: "삤뒛룄 떦떊쓽 룊븞븳 븯猷⑤ 쓳썝빀땲떎. 吏湲덇퉴吏 씤깮 吏삙瑜 굹늻뒗 源뙟씠뿀뒿땲떎."濡 뿬슫 엳寃 留븐쑝꽭슂.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#씤깮紐낆뼵 #씤媛꾧怨 #떖由ы븰 #씤깮吏삙 #留덉쓬怨듬 #醫뗭湲洹' 媛 룷븿릺뼱빞 빀땲떎.


`;


    } else if (blogType === 'economy') {


        personaGuidance = `


떦떊 눜 꽕怨 遺꾩빞쓽 씪 媛뺤궗씠옄, 떆땲뼱뱾쓽 깮솢鍮꾩 젅꽭瑜 吏耳쒕뱶由щ뒗 씪紐 **'눜 寃쎌젣 쟾臾멸 (源뙟)'**엯땲떎.


씠 釉붾줈洹몄쓽 紐⑦넗뒗 "눜뒗 걹씠 븘땶 깉濡쒖슫 떆옉엯땲떎." 엯땲떎. 궗슜옄쓽 궎썙뱶瑜 蹂닿퀬 蹂듭옟븳 뿰湲, 嫄대낫猷 벑 끂썑 룉 臾몄젣瑜 냽 떆썝븯寃 뙆뿤移섎뒗 젙蹂댁꽦 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 뜲씠꽣 솢슜 썝移 (媛옣 以묒슂!!!)]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - "눜瑜 븵몢떊 50, 60 뿬윭遺", "삤뒛룄 뭹寃 엳뒗 끂썑瑜 以鍮꾪븯떆뒗 떆땲뼱 꽑諛곕떂뱾" 벑쑝濡 吏移빀땲떎.


   - 媛먯꽦뙏씠蹂대떎뒗 셿쟾븳 **[뙥듃, 닽옄, 떎슜꽦]** 以묒떖쑝濡 씠꽦쟻씠怨 뒪留덊듃븯寃 꽌닠빀땲떎. ("~씪뒗 궗떎, 븣怨 怨꾩뀲뒿땲源?", "~媛 빑떖엯땲떎", "~瑗 湲곗뼲븯떗떆삤.")


   - 쟾臾몄쟻씤 꽭臾/嫄대낫猷 吏떇쓣 삁由ы븯寃 遺꾩꽍븯릺, 떎깮솢뿉 쟻슜븷 닔 엳寃 궗濡(삁: 嫄대낫猷 뵾遺뼇옄 옄寃 諛뺥깉 湲곗 벑)瑜 뱾뼱 돺寃 꽕紐낇빀땲떎. 媛뺤“ 몴떆湲고샇(쐟, 윋, 윊, 윊)瑜 쟻젅엳 궗슜빀땲떎.





2. 궡슜 쟾媛 諛⑹떇 諛 뜲씠꽣 솢슜 썝移:


   - [븘닔 젙蹂 異쒖쿂]: 諛섎뱶떆 떎쓬 怨듭떇 뜲씠꽣瑜 湲곕컲쑝濡 븳떎怨 媛젙븯怨 젙솗븯寃 옉꽦븯꽭슂.


     1) 援誘쇱뿰湲덇났떒 (nps.or.kr): 끂졊뿰湲 닔졊븸 궛젙, 議곌린닔졊 옣떒젏 벑 뿰湲 젣룄 洹쒖젙


     2) 援誘쇨굔媛뺣낫뿕怨듬떒 (nhis.or.kr): 嫄닿컯蹂댄뿕猷 遺怨 泥닿퀎 媛쒗렪븞, 뵾遺뼇옄 깉씫 슂嫄 벑


     3) 湲덉쑖媛먮룆썝 넻빀뿰湲덊룷꽭 (100lifeplan.fss.or.kr): 눜吏곸뿰湲/媛쒖씤뿰湲 꽭젣 삙깮 벑


     4) 援꽭泥 (nts.go.kr): 긽냽꽭/利앹뿬꽭 벑 떆땲뼱 젅꽭 媛씠뱶


   - [삤봽떇]: <blockquote> 깭洹몃 궗슜빐, "理쒓렐 嫄닿컯蹂댄뿕猷 媛쒗렪쑝濡 떆땲뼱뱾쓽 諛쒕벑뿉 遺덉씠 뼥뼱議뚯뒿땲떎." 泥섎읆 룆옄뱾쓽 媛옣 겙 遺덉븞 슂냼(룉 臾몄젣)瑜 뙥듃 븿猿 肄 吏싳뼱 뜕吏묐땲떎.


   - [蹂몃줎 넄猷⑥뀡 (몴 옉꽦씠 빑떖!!!)]: 異붿긽쟻 쐞濡쒓 븘땲씪 뙥듃瑜 寃利앺빐빞 빀땲떎. 젣룄瑜 鍮꾧탳븯嫄곕굹 怨꾩궛빐빞 븷 궡슜(삁: 嫄대낫猷 媛쒗렪 쟾/썑)씠 臾댁“嫄 굹샃땲떎. 쁾留덊겕떎슫(Markdown) 臾몃쾿 젅 벐吏 留먭퀬, 臾댁“嫄 HTML <table> 깭洹몃 궗슜빐 몴 1媛 씠긽쓣 吏곴쟻쑝濡 옉꽦븯꽭슂.


   - [留덈Т由]: 留됱뿰븳 쐞濡쒓 븘땶, "븘뒗 留뚰겮 븘겮怨 吏궗 닔 엳뒿땲떎. 눜 寃쎌젣 쟾臾멸 源뙟怨 븿猿 移섎븯寃 鍮꾪븯떗떆삤. 뿬윭遺꾩쓽 뭹寃 엳뒗 눜瑜 쓳썝빀땲떎."씪뒗 留븐쓬留먯쓣 궓寃 옒쓣 떎뼱以띾땲떎.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#떆땲뼱寃쎌젣 #눜以鍮 #끂썑꽕怨 #눜寃쎌젣쟾臾멸 #援誘쇱뿰湲 #嫄닿컯蹂댄뿕猷' 媛 룷븿릺뼱빞 빀땲떎.


`;


    } else if (blogType === 'corporate') {


        personaGuidance = `


떦떊 援궡쇅 二쇱떇 떆옣怨 湲곗뾽쓽 옱臾, 鍮꾩쫰땲뒪 紐⑤뜽쓣 궇移대∼寃 뙆뿤移섎뒗 씪紐 **'湲곗뾽遺꾩꽍 쟾臾멸 (源뙟)'**엯땲떎.


씠 釉붾줈洹몄쓽 紐⑦넗뒗 "닽옄뒗 嫄곗쭞留먯쓣 븯吏 븡뒗떎, 뙥듃濡 듅遺븯뒗 닾옄 닾떆寃" 엯땲떎. 궗슜옄쓽 궎썙뱶瑜 蹂닿퀬 뙥듃 떆옣 룞뼢쓣 湲곕컲쑝濡 湲곗뾽쓽 媛移섏 닾옄 룷씤듃瑜 紐낆풄븯寃 吏싳뼱二쇰뒗 젙蹂댁꽦 釉붾줈洹 湲쓣 옉꽦빐二쇱꽭슂.





[釉붾줈洹 넠븻留ㅻ꼫 諛 뜲씠꽣 솢슜 썝移 (媛옣 以묒슂!!!)]





1. 룆옄 吏移 諛 湲곕낯 臾몄껜:


   - "媛쒖씤 닾옄옄 뿬윭遺", "뒪留덊듃븳 二쇱＜떂뱾" 벑쑝濡 吏移빀땲떎.


   - 媛먯젙쟻씤 뇤뵾뀥蹂대떎뒗 **[뙥듃, 옱臾댁젣몴, 떆옣 뜲씠꽣]** 以묒떖쑝濡 끉由ъ쟻씠怨 媛앷쟻쑝濡 꽌닠빀땲떎. ("~씪뒗 뜲씠꽣媛 利앸챸빀땲떎", "~二쇰ぉ빐빞 븷 룷씤듃엯땲떎", "~由ъ뒪겕瑜 젏寃븯떗떆삤.")


   - 쟾臾몄쟻씤 湲덉쑖/닾옄 슜뼱(PER, PBR, 쁺뾽씠씡瑜 벑)瑜 궗슜븯릺, 珥덈낫옄룄 씠빐븷 닔 엳寃 鍮꾩쑀瑜 뱾뼱 돺寃 꽕紐낇빀땲떎. 媛뺤“ 몴떆湲고샇(윋, 윋, 윊, 윍)瑜 쟻젅엳 궗슜빀땲떎.





2. 궡슜 쟾媛 諛⑹떇 諛 뜲씠꽣 솢슜 썝移:


   - [븘닔 젙蹂 異쒖쿂]: 諛섎뱶떆 쟾옄怨듭떆떆뒪뀥(DART), 湲濡쒕쾶 寃쎌젣 湲곗궗, 궛뾽 由ы룷듃 벑쓽 媛앷쟻씠怨 怨듭떇쟻씤 뜲씠꽣瑜 湲곕컲쑝濡 븳떎怨 媛젙븯怨 옉꽦븯꽭슂.


   - [삤봽떇]: <blockquote> 깭洹몃 궗슜빐, "理쒓렐 빐떦 湲곗뾽쓣 몮윭떬 떆옣쓽 吏媛 蹂룞씠 떖긽移 븡뒿땲떎." 泥섎읆 룆옄뱾쓽 닾옄 샇湲곗떖怨 떆옣쓽 솕몢瑜 뙥듃 븿猿 뜕吏묐땲떎.


   - [蹂몃줎 넄猷⑥뀡 (몴 옉꽦씠 빑떖!!!)]: 떒닚븳 二쇨 굹뿴씠 븘땲씪 鍮꾩쫰땲뒪 紐⑤뜽씠굹 떎쟻, 寃쎌웳궗 鍮꾧탳瑜 遺꾩꽍빐빞 빀땲떎. 쁾留덊겕떎슫(Markdown) 臾몃쾿 젅 벐吏 留먭퀬, 臾댁“嫄 HTML <table> 깭洹몃 궗슜빐 빑떖 옱臾 룷씤듃굹 닾옄 吏몴瑜 몴 1媛 씠긽쑝濡 吏곴쟻쑝濡 옉꽦븯꽭슂.


   - [留덈Т由]: "닾옄쓽 梨낆엫 蹂몄씤뿉寃 엳吏留, 遺꾩꽍 源뙟씠 룙寃좎뒿땲떎. 湲고쉶瑜 꽑젏븯뒗 쁽紐낇븳 닾옄瑜 湲곗썝빀땲떎."씪뒗 留븐쓬留먯쓣 궓寃 옒쓣 떎뼱以띾땲떎.





빐떆깭洹 洹쒖튃:


- 蹂몃Ц쓽 留 留덉留됱뿉 쓣뼱벐湲곕줈 援щ텇븯뿬 5~8媛쒖쓽 빐떆깭洹몃 異쒕젰븯꽭슂. 


- 洹 븞뿉뒗 諛섎뱶떆 '#湲곗뾽遺꾩꽍 #二쇱떇닾옄 #二쇨쟾留 #湲곗뾽遺꾩꽍쟾臾멸 #媛移섑닾옄 #源뙟쓽닾옄끂듃' 媛 룷븿릺뼱빞 빀땲떎.


`;


    }





    const currentYear = new Date().getFullYear();


    
    let visualGuidance = "";
    if (deviceType === 'mobile') {
        visualGuidance = `
3. 시각적 요소 및 썸네일 구조 (모바일 앱 전용 - 매우 중요!!):
   - 블로그 원본의 필수 레이아웃은 무조건 '대제목 -> 가벼운 인사말 -> [썸네일 이미지] -> 본격적인 본문 내용' 순서여야 합니다. 
   - 따라서 인사말이 끝나는 서론 직후에 반드시 [THUMBNAIL] 이라는 예약어를 단 1번 작성하세요.
   - 네이버 블로그 앱은 외부 사진 복사를 차단하므로 보조 사진 예약어([IMAGE_1] 등)는 절대로 쓰지 마세요.

4. 모바일 앱 환경을 위한 가독성 극대화 (HTML 표/인라인 스타일 절대 금지!!!):
   - **모바일 앱 보안 정책을 회피하기 위해 인라인 CSS(style='...')와 HTML 표(<table>)를 일절 쓰지 마세요.**
   - **표(Table) 절대 금지!!** <table> 대신 반드시 일반 텍스트, 이모지(✅, 🚨, 💡, 📌), 불릿 기호( - )를 사용하여 요약식으로 나열하세요.
   - **소제목 및 단락 구분 (핵심):** 시각적 변주를 주기 위해 '━━━━━━━━━━━━━━━━━' 와 같은 특수문자 실선이나 '▼' 기호 등을 적극 활용하여 단락을 예쁘게 구분하세요.
   - **소제목 강조:** <h2> 나 <h3> 등에 복잡한 style을 넣지 말고, <h3>🚨 [핵심 포인트] 🚨</h3> 처럼 <h3>태그와 이모지만 넣어 강조하세요.
   - 중요 단어는 <strong> 태그만 사용하여 굵게 처리하세요.`;
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
    const prompt = `


${personaGuidance}





[엯젰 젙蹂]


- 二쇱젣/궎썙뱶: ${keyword}


- 옉꽦 湲곗 뿰룄: 臾댁“嫄 ${currentYear}뀈 (젅濡 2024뀈 벑 怨쇨굅 뿰룄瑜 異쒕젰븯吏 留덉꽭슂. 紐⑤뱺 젙梨낃낵 삙깮 ${currentYear}뀈 湲곗엯땲떎.)





*** 留ㅼ슦 以묒슂븳 寃쎄퀬 ***


諛섎뱶떆 궗슜옄媛 엯젰븳 [二쇱젣/궎썙뱶]뿉 빐꽌留 吏묒쨷쟻쑝濡 빑떖쓣 떎猷⑥뼱빞 빀땲떎. 젅濡 궗슜옄쓽 궎썙뱶瑜 臾댁떆븯怨 뿁슧븳 옄泥 二쇱젣(삁: AI 湲곗닠 듃젋뱶 벑)濡 鍮좎吏 留덉꽭슂!





[怨듯넻 븘닔 以닔 媛씠뱶]


1. 遺꾨웾怨 源딆씠:


   - **湲옄 닔:** 怨듬갚 젣쇅 800옄 ~ 1,000옄 궡쇅濡 紐⑤컮씪 솚寃쎌뿉꽌 鍮좊Ⅴ怨 돺寃 씫쓣 닔 엳룄濡 빑떖留 媛꾨왂븯怨 紐낆풄븯寃 옉꽦븯꽭슂. 遺덊븘슂븯寃 뒛뼱吏뒗 꽌닠 젅 湲덉빀땲떎.





2. 겢由쓣 쑀룄븯뒗 洹밸룄쓽 썑궧삎 釉붾줈洹 젣紐 (Title) 옉꽦 (留ㅼ슦 以묒슂!!!):


   - **諛곗튂 (빑떖!)**: 硫붿씤 빑떖 紐⑺몴 궎썙뱶뒗 **臾댁“嫄 젣紐⑹쓽 媛옣 븵遺遺(理쒖쥖痢)**뿉 諛붾줈 諛곗튂븯꽭슂. (삁: "[蹂듭] 100留뚯썝..." -> X, "슂뼇蹂댄샇궗 옄寃⑹쬆 100留뚯썝 吏썝諛쏅뒗..." -> O)


   - **湲몄씠 諛 젅씠븘썐**: 紐⑤컮씪 솕硫댁뿉꽌 옒由ъ 븡룄濡 **怨듬갚 룷븿 20옄 씠궡**濡 理쒕븳 吏㏐쾶 옉꽦븯꽭슂. 꽭遺 궎썙뱶瑜 슃떖궡뼱 굹뿴븯吏 留덉꽭슂.


   - **닔移 & 뿰룄**: 異붿긽쟻씤 떒뼱瑜 鍮쇨퀬 '\${currentYear}뀈' 泥섎읆 理쒖떊 뿰룄 援ъ껜쟻씤 닔移(삁: '1000留 썝', '3諛', '50%')瑜 룷븿븯뿬 떊猶곕룄 겢由瑜좎쓣 룺諛쒖떆궎꽭슂.


   - **궎썙뱶 諛섎났 湲덉**: 젣紐 븞뿉꽌 硫붿씤 궎썙뱶瑜 2踰 씠긽 諛섎났븯硫 寃깋 뙣꼸떚瑜 諛쏆쑝誘濡 **臾댁“嫄 뵳 1踰덈쭔** 궗슜븯꽭슂.


   - **썑궧 떒뼱 궗슜**: 떒닚 젙蹂 굹뿴씠 븘땲씪 '~븯뒗 諛⑸쾿', '紐⑤Ⅴ硫 넀빐', '珥앹젙由', '쁽떎 썑湲' 벑 寃깋옄쓽 뻾룞 쓽吏瑜 옄洹뱁븯뒗 떒뼱瑜 議고빀븯꽭슂. 룷꽭 옄룞셿꽦쓽 쓣뼱벐湲곕뒗 닔젙븯吏 留먭퀬 洹몃濡 벐꽭슂.





3. 떆媛곸쟻 슂냼 諛 뜽꽕씪 援ъ“ (留ㅼ슦 以묒슂!!):


   - 釉붾줈洹 썝蹂몄쓽 븘닔 젅씠븘썐 臾댁“嫄 '젣紐 -> 媛踰쇱슫 씤궗留 -> [뜽꽕씪 씠誘몄] -> 蹂멸꺽쟻씤 蹂몃Ц 궡슜' 닚꽌뿬빞 빀땲떎. 


   - 뵲씪꽌 씤궗留먯씠 걹굹뒗 꽌濡 吏곹썑뿉 諛섎뱶떆 [THUMBNAIL] 씠씪뒗 삁빟뼱瑜 떒 1踰 옉꽦븯꽭슂.


   - 蹂몃Ц 以묎컙以묎컙 湲쓽 臾몃㎘怨 쓲由꾩씠 옄뿰뒪읇寃 쟾솚릺뒗 怨녹뿉 궗吏꾩쓣 理쒕 3옣源뚯 쟻젅엳 嫄곕━瑜 몢怨 諛곗튂븯湲 쐞빐 [IMAGE_1], [IMAGE_2], [IMAGE_3] 삁빟뼱瑜 궫엯븯꽭슂.


   - 젅 <img> 깭洹 벑쓣 엫쓽濡 궗슜븯吏 留먭퀬 삤吏 쐞 뀓뒪듃 삁빟뼱留 꽔뼱빞 빀땲떎.





4. 媛룆꽦쓣 洹밸솕븯뒗 꽭젴맂 援ъ“ (留덊겕떎슫 젅 湲덉, 100% HTML 깭洹 옉꽦):


   - **臾몃떒 湲몄씠 諛 以꾨컮轅:** 2~3臾몄옣留덈떎 諛섎뱶떆 臾몃떒쓣 굹늻怨, 蹂몃Ц쓽 紐⑤뱺 씪諛 뀓뒪듃뒗 <p style='font-size: 16px; line-height: 1.8; margin-bottom: 26px; color: #333; letter-spacing: -0.5px;'>...</p> 깭洹몃줈 媛먯떥꽌 븘二 씫湲 렪븯寃 留뚮뱶꽭슂.


   - **몴(Table) 옉꽦 洹쒖튃:** 留덊겕떎슫 臾몃쾿( |---| ) 솕硫댁씠 源⑥誘濡 젅 벐吏 留덉꽭슂!! 몴媛 븘슂븷 븣뒗 諛섎뱶떆 HTML <table> <tr> <th> <td> 깭洹몃 궗슜븯怨, style 냽꽦쑝濡 뀒몢由(border: 1px solid #ddd; border-collapse: collapse; padding: 12px; text-align: left;)瑜 紐낆떆븯꽭슂. <th>뿉뒗 諛곌꼍깋(background-color: #f8f9fa;)룄 꽔쑝꽭슂.


   - **냼젣紐 怨꾩링솕 (븘닔):** 二쇱젣 냼二쇱젣뒗 湲쓽 쓲由꾩씠 옄뿰뒪읇寃 씠뼱吏룄濡 吏곴쟻쑝濡 옉꽦븯怨(踰덊샇 룷븿 媛뒫), 븘옒쓽 꽭젴맂 씤씪씤 뒪씪쓣 젙솗엳 蹂듭궗빐꽌 궗슜븯꽭슂.


     쐟 二쇱젣 삁떆: <h2 style='font-size: 24px; font-weight: 800; color: #111; margin-top: 70px; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 2px solid #111;'>1. 二쇱젣 씠</h2>


     쐟 냼二쇱젣 삁떆: <h3 style='font-size: 20px; font-weight: 700; color: #333; margin-top: 60px; margin-bottom: 20px; padding-left: 14px; border-left: 4px solid #00c73c;'>1.1. 냼二쇱젣 씠</h3>


   - **由ъ뒪듃(List) 옉꽦 洹쒖튃:** <ul> 깭洹몄뿉뒗 쐞븘옒 닲넻쓣 듃湲 쐞빐 諛섎뱶떆 <ul style='margin-top: 15px; margin-bottom: 35px; padding-left: 22px;'> 瑜 쟻슜븯꽭슂. 洹 븞쓽 <li> 깭洹몃뒗 蹂몃Ц怨 湲뵪 겕湲곌 떎瑜닿쾶 吏 븡룄濡 <li style='font-size: 16px; letter-spacing: -0.5px; margin-bottom: 15px; line-height: 1.8; color: #333;'> 泥섎읆 룿듃 궗씠利덉 뿬諛깆쓣 紐낆떆븯怨, 빑떖 떒뼱뒗 <strong style='color: #00c73c;'> 깭洹몃줈 媛뺤“븯꽭슂.


   - **以묒슂**: HTML 깭洹몄뿉 냽꽦쓣 꽔쓣 븣뒗 겙뵲샂몴(") 떊 **諛섎뱶떆 솑뵲샂몴(')**瑜 궗슜븯꽭슂.





[異쒕젰 삎떇 젣븳]


諛섎뱶떆 븘옒쓽 듅닔 援щ텇옄瑜 궗슜븯뿬 젣紐⑷낵 蹂몃Ц쓣 굹늻뼱 옉꽦븯꽭슂. JSON 삎떇 젅 궗슜븯吏 留덉꽭슂.


[TITLE]


(깮꽦맂 釉붾줈洹 젣紐⑹쓣 닚닔 뀓뒪듃濡 1以꾨줈 옉꽦)


[/TITLE]


[CONTENT]


(깮꽦맂 釉붾줈洹 蹂몃Ц쓣 HTML 깭洹 諛 빐떆깭洹멸 紐⑤몢 룷븿맂 湲 뀓뒪듃濡 옉꽦)


[/CONTENT]


`;





    // Call Gemini 2.5 Flash model


    const response = await ai.models.generateContent({


      model: "gemini-2.5-flash",


      contents: prompt,


      config: {


        temperature: 0.7, // slightly creative


        maxOutputTokens: 8192,


      },


    });





    const textResponse = response.text;


    


    if (!textResponse) {


      throw new Error("Empty response from AI");


    }





    let cleanText = textResponse.trim();





    // 援щ텇옄瑜 넻빐 젙洹쒖떇쑝濡 뙆떛


    let title = "젣紐⑹쓣 깮꽦븯吏 紐삵뻽뒿땲떎.";


    let generatedHtml = cleanText;


    


    const titleMatch = cleanText.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/i);


    const contentMatch = cleanText.match(/\[CONTENT\]([\s\S]*?)\[\/CONTENT\]/i);





    if (titleMatch && titleMatch[1]) {


      title = titleMatch[1].trim();


    }


    if (contentMatch && contentMatch[1]) {


      generatedHtml = contentMatch[1].trim();


    } else if (cleanText.includes('[CONTENT]')) {


      // 떕뒗 깭洹멸 옒由 寃쎌슦


      generatedHtml = cleanText.split(/\[CONTENT\]/i)[1].trim();


    }





    const parsedResult = {


      title: title,


      content: generatedHtml


    };





    // Host & Protocol 援ы븯湲


    const host = req.headers.get('host') || 'localhost:3000';


    const protocol = req.headers.get('x-forwarded-proto') || 'http';


    const baseUrl = `${protocol}://${host}`;





    // 뜽꽕씪 OG Image HTML (蹂몃Ц 二쇱엯슜) - 꽕씠踰 뿉뵒꽣 씤떇쓣 쐞빐 媛吏 솗옣옄 異붽


    const bgUrlParam = imageUrls.length > 0 ? `&bg=${encodeURIComponent(imageUrls[0])}` : '';


    const thumbnailHtml = `<div style="text-align: center; margin-bottom: 24px;">


      <img src="${baseUrl}/api/og?title=${encodeURIComponent(parsedResult.title)}&type=${blogType}${bgUrlParam}&ext=.png" alt="釉붾줈洹 몴 뜽꽕씪" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);" />


    </div>`;





    // 4. 봽濡쒓렇옩 떒뿉꽌 븞쟾븯寃 [IMAGE_X] 移섑솚븯湲 (以묐났 諛⑹)


    let finalContent = parsedResult.content;


    const usedImages = new Set<string>();


    


    // imageUrls[0] 뜽꽕씪 諛곌꼍쑝濡 궗슜뻽쑝誘濡, imageUrls[1]遺꽣 蹂몃Ц뿉 궗슜


    if (deviceType === 'desktop') {
      for (let i = 1; i < imageUrls.length; i++) {


        const placeholder = `[IMAGE_${i}]`;


        const imgUrl = imageUrls[i];


        


        // 移섑솚슜 HTML 뀥뵆由


        const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(imgUrl)}`;


        const imgTag = `<div style="text-align: center; margin: 32px 0;"><img src="${proxyUrl}" alt="愿젴 꽕紐 궗吏 ${i}" style="max-width: 100%; height: auto; border-radius: 8px;"></div>`;


        


        // 뵆젅씠뒪뜑媛 蹂몃Ц뿉 엳쑝硫 떎젣濡 1踰덈쭔 移섑솚


        if (finalContent.includes(placeholder)) {


            finalContent = finalContent.replace(placeholder, imgTag);


            usedImages.add(imgUrl);


        }


    }





    // 留뚯빟 AI媛 뵆젅씠뒪뜑瑜 늻씫빐꽌 궓 씠誘몄媛 엳떎硫, 媛뺤젣濡 걹뿉 遺숈뿬以 (諛곌꼍슜 0踰 젣쇅)


    for (let i = 1; i < imageUrls.length; i++) {


        const imgUrl = imageUrls[i];


        if (!usedImages.has(imgUrl)) {


            const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(imgUrl)}`;


            const imgTag = `<div style="text-align: center; margin: 32px 0;"><img src="${proxyUrl}" alt="愿젴 꽕紐 궗吏 異붽" style="max-width: 100%; height: auto; border-radius: 8px;"></div>`;


            finalContent += imgTag;


        }
    }


    }





    // 뜽꽕씪 쐞移 移섑솚


    if (finalContent.includes('[THUMBNAIL]')) {


        finalContent = finalContent.replace('[THUMBNAIL]', thumbnailHtml);


    } else {


        // 샊떆 AI媛 늻씫뻽떎硫 理쒖긽떒뿉 二쇱엯


        finalContent = thumbnailHtml + '\n' + finalContent;


    }





    parsedResult.content = finalContent;





    return NextResponse.json(parsedResult);


  } catch (error: unknown) {


    console.error("Gemini API Error:", error);


    return NextResponse.json(


      { error: error instanceof Error ? error.message : "Failed to generate blog post" },


      { status: 500 }


    );


  }


}


