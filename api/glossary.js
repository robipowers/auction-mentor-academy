// Auction Mentor: AMT Glossary API
// GET /api/glossary
// Returns all glossary terms sorted alphabetically

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('amt_glossary')
            .select('term, definition')
            .order('term', { ascending: true });

        if (error) {
            console.error('Glossary fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch glossary' });
        }

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).json({ terms: data });

    } catch (err) {
        console.error('Glossary error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
