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

    // Kit API v4 - Step 1: Create or update subscriber
    const subscriberResponse = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': apiKey,
      },
      body: JSON.stringify({
        email_address: email,
        ...(firstName && { first_name: firstName }),
      }),
    });

    if (!subscriberResponse.ok) {
      const errorData = await subscriberResponse.json();
      console.error('Kit API subscriber error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to subscribe. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriberData = await subscriberResponse.json();
    const subscriberId = subscriberData.subscriber?.id;

    if (!subscriberId) {
      console.error('No subscriber ID returned:', subscriberData);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscriber.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kit API v4 - Step 2: Add subscriber to form
    const formResponse = await fetch(
      `https://api.kit.com/v4/forms/${formId}/subscribers/${subscriberId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': apiKey,
        },
      }
    );

    if (!formResponse.ok) {
      const errorData = await formResponse.json();
      console.error('Kit API form error:', errorData);
      // Subscriber created but form add failed - still partial success
    }

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
