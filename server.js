// Express server using Supabase for persistent database
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Root route
app.get('/', (req, res) => {
    res.send('Student Help app is running with Supabase database.');
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
// GET /api/submissions - Get all submissions
app.get('/api/submissions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('timestamp', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to read database' });
        }
        
        // Return in the same format as before for frontend compatibility
        res.json({
            submissions: data || [],
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
    try {
        const submission = req.body;
        const id = Date.now().toString();
        
        const newSubmission = {
            id: id,
            name: submission.name || '',
            email: submission.email || '',
            subject: submission.subject || '',
            topic: submission.topic || '',
            description: submission.description || '',
            type: submission.type || 'request',
            status: 'pending',
            timestamp: new Date().toISOString(),
            last_updated: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('submissions')
            .insert([newSubmission])
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to save submission' });
        }
        
        res.status(201).json({ success: true, id: id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

// PUT /api/submissions/:id - Update submission
app.put('/api/submissions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        
        const { data, error } = await supabase
            .from('submissions')
            .update({
                ...updateData,
                last_updated: new Date().toISOString()
            })
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
    try {
        const id = req.params.id;
        
        const { data, error } = await supabase
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Export for Vercel
module.exports = app;
