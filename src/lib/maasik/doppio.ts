/**
 * Doppio.sh client for converting HTML to PDF.
 * V1 simple wrapper. Returns a Buffer of the PDF bytes.
 */
export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const apiKey = process.env.DOPPIO_API_KEY;
  if (!apiKey) throw new Error('DOPPIO_API_KEY not set');

  const response = await fetch('https://api.doppio.sh/v1/render/pdf/direct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: {
        setContent: { html, waitUntil: 'networkidle0' },
      },
      pdf: {
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
        preferCSSPageSize: true,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Doppio failed: ${response.status} ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
