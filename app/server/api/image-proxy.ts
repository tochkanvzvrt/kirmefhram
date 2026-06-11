export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string
  
  if (!url) {
    throw createError({ statusCode: 400, message: 'Missing URL' })
  }
  
  try {
    const response = await fetch(url)
    if (!response.ok) throw createError({ statusCode: response.status })
    
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000')
    return Buffer.from(buffer)
  } catch (error) {
    throw createError({ statusCode: 502, message: 'Failed to fetch image' })
  }
})
