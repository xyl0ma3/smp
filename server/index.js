const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const speakeasy = require('speakeasy');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  // don't exit so Render can show error logs; return 500 on calls
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// POST /api/verify-totp
// body: { user_id: string, token: string }
app.post('/api/verify-totp', async (req, res) => {
  const { user_id, token } = req.body;
  if (!user_id || !token) return res.status(400).json({ error: 'user_id and token required' });

  try {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', user_id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message || 'db error' });
    }
    if (!data) return res.status(404).json({ ok: false, message: '2FA not enabled' });

    const secret = data.secret;
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    return res.json({ ok: verified });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'internal error' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`TOTP server listening on ${port}`));
