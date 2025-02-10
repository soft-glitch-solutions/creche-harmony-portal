
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract webhook key from URL
    const url = new URL(req.url)
    const webhookKey = url.pathname.split('/').pop()

    if (!webhookKey) {
      throw new Error('No webhook key provided')
    }

    // Find the webhook configuration
    const { data: webhook, error: webhookError } = await supabaseClient
      .from('webhook_configurations')
      .select('id, creche_id')
      .eq('webhook_key', webhookKey)
      .single()

    if (webhookError || !webhook) {
      throw new Error('Invalid webhook key')
    }

    // Parse the payload
    const payload = await req.json()

    // Create application from webhook data
    const { error: applicationError } = await supabaseClient
      .from('applications')
      .insert({
        creche_id: webhook.creche_id,
        parent_name: payload.name || 'Unknown',
        parent_email: payload.email,
        parent_phone_number: payload.phone || 'Unknown',
        message: payload.message || '',
        source: 'webhook',
      })

    if (applicationError) {
      throw applicationError
    }

    // Log the webhook request
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        payload,
        status: 'success',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      })

    // Update last_used_at timestamp
    await supabaseClient
      .from('webhook_configurations')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', webhook.id)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)

    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
