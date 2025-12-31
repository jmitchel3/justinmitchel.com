import type { APIRoute } from 'astro';

export const prerender = false;

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

    // Access Cloudflare runtime environment variables
    const runtime = (locals as any).runtime;
    const apiKey = runtime?.env?.KIT_API_KEY || import.meta.env.KIT_API_KEY;
    const formId = runtime?.env?.KIT_FORM_ID || import.meta.env.KIT_FORM_ID;

    if (!apiKey || !formId) {
      console.error('Missing KIT_API_KEY or KIT_FORM_ID environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kit API v3 - Subscribe to form
    const kitResponse = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          email,
          ...(firstName && { first_name: firstName }),
        }),
      }
    );

    const responseData = await kitResponse.json();

    if (!kitResponse.ok) {
      console.error('Kit API error:', responseData);
      return new Response(
        JSON.stringify({ error: responseData.message || 'Failed to subscribe. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log success for debugging
    console.log('Kit API success:', responseData);

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
