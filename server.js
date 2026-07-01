// Express server using in-memory database for Vercel compatibility
const express = require('express');
const path = require('path');

const app = express();

// Initialize in-memory database (no file system access)
let dbData = {
    submissions: [],
    lastUpdated: new Date().toISOString(),
    version: '1.0'
};

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
    res.send('Student Help app is running with an in-memory database.');
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
// GET /api/submissions - Get all submissions
app.get('/api/submissions', (req, res) => {
    try {
        res.json(dbData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read database' });
    }
});

// POST /api/submissions - Add new submission
app.post('/api/submissions', (req, res) => {
    try {
        const submission = req.body;
        submission.id = Date.now().toString();
        submission.timestamp = new Date().toISOString();
        submission.status = 'pending';
        dbData.submissions.push(submission);
        dbData.lastUpdated = new Date().toISOString();
        
        res.status(201).json({ success: true, id: submission.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

// PUT /api/submissions/:id - Update submission
app.put('/api/submissions/:id', (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const submission = dbData.submissions.find(s => s.id === id);
        
        if (submission) {
            Object.assign(submission, updateData);
            submission.lastUpdated = new Date().toISOString();
            dbData.lastUpdated = new Date().toISOString();
            
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Submission not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

// DELETE /api/submissions/:id - Delete submission
app.delete('/api/submissions/:id', (req, res) => {
    try {
        const id = req.params.id;
        const originalLength = dbData.submissions.length;
        dbData.submissions = dbData.submissions.filter(s => s.id !== id);
        
        if (dbData.submissions.length < originalLength) {
            dbData.lastUpdated = new Date().toISOString();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Submission not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Export for Vercel
module.exports = app;
