import type { APIRoute } from 'astro';

export const prerender = false;

// Helper to store email in Cloudflare KV as fallback
async function storeInKV(kv: any, email: string, firstName?: string): Promise<boolean> {
  if (!kv) return false;

  try {
    const timestamp = new Date().toISOString();
    const key = `signup:${timestamp}:${email}`;
    await kv.put(key, JSON.stringify({
      email,
      firstName: firstName || null,
      timestamp,
      synced: false,
    }));
    return true;
  } catch (error) {
    console.error('KV storage error:', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { email, firstName } = data;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Access Cloudflare runtime environment variables and KV
    const runtime = (locals as any).runtime;
    const apiKey = runtime?.env?.KIT_API_KEY || import.meta.env.KIT_API_KEY;
    const formId = runtime?.env?.KIT_FORM_ID || import.meta.env.KIT_FORM_ID;
    const emailSignupsKV = runtime?.env?.EMAIL_SIGNUPS;

    let kitSuccess = false;
    let kvSuccess = false;

    // Try Kit API if configured
    if (apiKey && formId) {
      try {
        const kitResponse = await fetch(
          `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: apiKey,
              email,
              ...(firstName && { first_name: firstName }),
            }),
          }
        );

        if (kitResponse.ok) {
          kitSuccess = true;
          console.log('Kit API success');
        } else {
          const errorData = await kitResponse.json();
          console.error('Kit API error:', errorData);
        }
      } catch (error) {
        console.error('Kit API request failed:', error);
      }
    }

    // Always store in KV as backup
    kvSuccess = await storeInKV(emailSignupsKV, email, firstName);

    // Success if either worked
    if (kitSuccess || kvSuccess) {
      return new Response(
        JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Both failed
    return new Response(
      JSON.stringify({ error: 'Failed to subscribe. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
