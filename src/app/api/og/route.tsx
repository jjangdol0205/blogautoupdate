import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const top = searchParams.get('top') || '블로그 왕초보 필수';
    const mid = searchParams.get('mid') || '블로그';
    const bottom = searchParams.get('bottom') || '챌린지';

    // 해시태그 형식으로 변환 (앞에 #이 없으면 단어별로 # 추가)
    const topTags = top.includes('#') ? top : `#${top.split(' ').filter(t => t.trim() !== '').join(' #')}`;
    
    // 글자 길이에 따른 동적 폰트 사이즈 (글자 짤림 방지)
    const getFontSize = (text: string) => {
      if (text.length > 12) return 80;
      if (text.length > 8) return 110;
      if (text.length > 5) return 140;
      return 180;
    };
    
    const midSize = getFontSize(mid);
    const bottomSize = getFontSize(bottom);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111111', // 아웃라인 블랙 배경 (강렬한 대비)
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Text Pattern */}
          <div style={{ position: 'absolute', top: '-10px', left: '40px', display: 'flex', fontSize: 130, fontWeight: 900, color: 'rgba(255, 234, 0, 0.08)', letterSpacing: '0.05em' }}>
            URGENT INFO
          </div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '40px', display: 'flex', fontSize: 130, fontWeight: 900, color: 'rgba(255, 234, 0, 0.08)', letterSpacing: '0.05em' }}>
            HOT TOPIC
          </div>

          {/* Inner High-Contrast Yellow Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFEA00', // 시선 강탈 형광 노란색
              width: '880px',
              height: '880px',
              borderRadius: '70px',
              border: '12px solid #FFFFFF', // 흰색 굵은 테두리로 분리감 극대화
              boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
              position: 'relative',
              padding: '40px',
            }}
          >
            {/* Top Hashtags (Red Highlight) */}
            <div
              style={{
                display: 'flex',
                fontSize: 40,
                color: '#FFFFFF',
                backgroundColor: '#E60000', // 빨간색 배경에 흰 텍스트
                padding: '10px 25px',
                borderRadius: '20px',
                fontWeight: 900,
                marginBottom: '60px',
                letterSpacing: '-0.02em',
                boxShadow: '0 10px 20px rgba(230,0,0,0.3)',
              }}
            >
              {topTags}
            </div>

            {/* Mid Huge Text (Black) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                textAlign: 'center',
                wordBreak: 'keep-all',
                fontSize: midSize + 10,
                fontWeight: 900,
                color: '#000000', // 완전 검정
                lineHeight: 1.1,
                letterSpacing: '-0.05em',
                marginBottom: '10px',
                padding: '0 10px',
                textShadow: '0px 8px 15px rgba(0,0,0,0.1)',
              }}
            >
              {mid}
            </div>

            {/* Bottom Huge Text (Red emphasis or Black) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                textAlign: 'center',
                wordBreak: 'keep-all',
                fontSize: bottomSize,
                fontWeight: 900,
                color: '#E60000', // 강렬한 빨간색
                lineHeight: 1.1,
                letterSpacing: '-0.05em',
                marginBottom: '80px',
                padding: '0 10px',
                textShadow: '0px 8px 15px rgba(230,0,0,0.15)',
              }}
            >
              {bottom}
            </div>

            {/* Decorative dots changed to attention grabbing diagonal stripes or simple dots */}
            <div style={{ position: 'absolute', display: 'flex', left: '40px', top: '80px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#000000', opacity: 0.9 }} />
            <div style={{ position: 'absolute', display: 'flex', right: '60px', bottom: '100px', width: '50px', height: '50px', borderRadius: '25px', backgroundColor: '#000000', opacity: 0.9 }} />
            <div style={{ position: 'absolute', display: 'flex', right: '90px', top: '90px', width: '20px', height: '20px', borderRadius: '10px', backgroundColor: '#E60000', opacity: 0.9 }} />
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (e: unknown) {
    console.log(`${e instanceof Error ? e.message : 'Unknown Error'}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
