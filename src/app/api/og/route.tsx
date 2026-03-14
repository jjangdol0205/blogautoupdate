import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const type = searchParams.get('type') || 'economy';
    const bg = searchParams.get('bg'); // Background image URL

    const hasTitle = title && title.length > 0;
    const ogTitle = hasTitle ? title : '당신을 위한 프리미엄 정보';

    // 텍스트 테두리 효과 (Black stroke effect)
    const strokeShadow = '2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000';

    let tagText = '은퇴 후 30년, 품격 있는 경제';
    if (type === 'health') {
        tagText = '노래하는 청춘 건강 연구소';
    } else if (type === 'wisdom') {
        tagText = '인생 지혜와 인간관계 (김쌤)';
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Image */}
          {bg ? (
            <img 
              src={bg} 
              alt="Background" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }} 
            />
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: 'linear-gradient(135deg, #1f1f1f 0%, #050505 100%)'
            }} />
          )}

          {/* Dim Overlay for extremely high text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.45)', // Darken background slightly
          }} />

          {/* Text Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // 다시 가운데 정렬 (네이버 블로그 스타일)
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '0 60px',
              textAlign: 'center',
              zIndex: 10,
              gap: '32px', // 여백 넓히기
            }}
          >
            {/* Category / Tag Text (High contrast badge style) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFEB3B', // YouTube style yellow badge
                color: '#000000',
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '0.05em',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              }}
            >
              {tagText}
            </div>

            {/* Main Title Text (White with heavy black stroke and shadow) */}
            <div
              style={{
                fontSize: ogTitle.length > 20 ? 68 : 84, // 정사각형 뷰에 맞게 크루게
                fontWeight: 900,
                color: '#FFFFFF', // Pure White
                lineHeight: 1.3,
                wordBreak: 'keep-all',
                letterSpacing: '-0.03em',
                textShadow: strokeShadow,
                maxWidth: '850px', // 가운데 정렬시 너무 넓게 퍼지지 않도록 제한
              }}
            >
              {ogTitle}
            </div>
          </div>
        </div>
      ),
      {
        width: 1000,
        height: 1000,
      }
    );
  } catch (e: unknown) {
    console.log(`${e instanceof Error ? e.message : 'Unknown Error'}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
