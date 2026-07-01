// Express server using Supabase for persistent database
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const databaseConfigured = !!(supabaseUrl && supabaseKey);

if (databaseConfigured) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    app.locals.supabase = supabase;
} else {
    console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - API will return errors');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files from repo root
app.use(express.static(path.join(__dirname)));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        databaseConfigured: databaseConfigured
    });
});

// API Routes
// GET /api/submissions - Get all submissions
app.get('/api/submissions', async (req, res) => {
    if (!app.locals.supabase) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    try {
        const { data, error } = await app.locals.supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to read database' });
        }
        
        // Normalize rows for frontend compatibility
        const normalizedSubmissions = (data || []).map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            subject: row.subject,
            topic: row.topic,
            description: row.description,
            status: row.status,
            type: row.submission_type || 'request',
            submission_type: row.submission_type || 'request',
            timestamp: row.created_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            last_updated: row.updated_at
        }));
        
        res.json({
            submissions: normalizedSubmissions,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to read database' });
    }
});

// POST /api/submissions - Add new submission
app.post('/api/submissions', async (req, res) => {
    if (!app.locals.supabase) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    try {
        const { name, subject, topic, description, email, type } = req.body;
        
        // Validate required fields
        if (!name || !subject || !topic || !description) {
            return res.status(400).json({ error: 'Missing required fields: name, subject, topic, description' });
        }
        
        const newSubmission = {
            submission_type: type || 'request',
            name: name,
            email: email || null,
            subject: subject,
            topic: topic,
            description: description,
            status: 'pending'
        };
        
        const { data, error } = await app.locals.supabase
            .from('submissions')
            .insert([newSubmission])
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to save submission' });
        }
        
        res.status(201).json({ success: true, id: data[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

// PUT /api/submissions/:id - Update submission
app.put('/api/submissions/:id', async (req, res) => {
    if (!app.locals.supabase) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    try {
        const id = req.params.id;
        const { status } = req.body;
        
        // Only allow status updates to specific values
        if (status && !['pending', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: pending, in-progress, or resolved' });
        }
        
        const updateData = {};
        if (status) {
            updateData.status = status;
        }
        
        const { data, error } = await app.locals.supabase
            .from('submissions')
            .update(updateData)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to update submission' });
        }
        
        if (data && data.length > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Submission not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

// DELETE /api/submissions/:id - Delete submission
app.delete('/api/submissions/:id', async (req, res) => {
    if (!app.locals.supabase) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    try {
        const id = req.params.id;
        
        const { error } = await app.locals.supabase
            .from('submissions')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to delete submission' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

// 404 handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel
module.exports = app;

// Start server only when run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Database configured: ${databaseConfigured}`);
    });
}
