
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
      .select('*')
      .eq('webhook_key', webhookKey)
      .eq('enabled', true)
      .single()

    if (webhookError || !webhook) {
      throw new Error('Invalid webhook key or webhook is disabled')
    }

    // Parse the payload
    const payload = await req.json()

    // Map the fields according to the configuration
    const mappedData: Record<string, any> = {}
    const fieldsMapping = webhook.fields_mapping || {}

    // Apply field mapping
    Object.entries(fieldsMapping).forEach(([sourceField, targetField]) => {
      if (payload[sourceField] !== undefined) {
        mappedData[targetField] = payload[sourceField]
      }
    });

    // Add required fields based on target table
    mappedData.creche_id = webhook.creche_id
    mappedData.source = 'webhook'

    // Insert data into the target table
    const { error: insertError } = await supabaseClient
      .from(webhook.target_table)
      .insert(mappedData)

    if (insertError) {
      throw insertError
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
      JSON.stringify({ 
        success: true,
        message: `Data successfully inserted into ${webhook.target_table}`,
        mapped_data: mappedData
      }),
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

    // Log the error
    if (error.webhook_id) {
      await supabaseClient
        .from('webhook_logs')
        .insert({
          webhook_id: error.webhook_id,
          payload: error.payload,
          status: 'error',
          error_message: error.message,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        })
    }

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
