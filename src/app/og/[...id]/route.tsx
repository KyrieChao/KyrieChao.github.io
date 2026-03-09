import { ImageResponse } from 'next/og';
import { getPostData, getAllPostIds } from '@/lib/posts';

export const runtime = 'nodejs';

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => {
    // Clone id array
    const id = [...path.params.id];
    // Append .png to the last segment
    const lastIndex = id.length - 1;
    if (lastIndex >= 0) {
      // id is already encoded from getAllPostIds
      id[lastIndex] = id[lastIndex] + '.png';
    }
    return { id };
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const { id } = await params;
  
  // Remove .png from the last segment
  const cleanId = [...id];
  const lastIndex = cleanId.length - 1;
  if (lastIndex >= 0) {
    cleanId[lastIndex] = cleanId[lastIndex].replace(/\.png$/, '');
  }
  
  // Decode URL components
  // Note: If params are already decoded by Next.js, this might double decode, but usually safe for standard chars.
  // But wait, if we passed encoded params in generateStaticParams, Next.js passes them to us.
  // In app router, params are usually decoded.
  // However, since we encoded them MANUALLY in generateStaticParams, Next.js might treat them as raw strings?
  // Let's assume we need to decode.
  const decodedId = cleanId.map(segment => decodeURIComponent(segment));
  const postId = decodedId.join('/');

  try {
    const post = await getPostData(postId);

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            background: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            border: '20px solid #3b82f6',
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'white',
            padding: '40px 60px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            maxWidth: '90%',
          }}>
            <div style={{ fontSize: 32, marginBottom: 20, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>
              KyrieChao Blog
            </div>
            <div style={{ 
              fontSize: 72, 
              fontWeight: 900, 
              textAlign: 'center', 
              lineHeight: 1.1, 
              marginBottom: 30,
              background: 'linear-gradient(to right, #1e40af, #3b82f6)',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              {post.title}
            </div>
            <div style={{ fontSize: 28, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
              {post.date}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
