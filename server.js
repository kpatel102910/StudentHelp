// Simple Node.js server that actually writes to database.json
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        submissions: [],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'text/plain';
}

// Server handler
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);

    // Handle API endpoints
    if (parsedUrl.pathname.startsWith('/api/')) {
        handleApiRequest(req, res, parsedUrl);
        return;
    }

    // Serve static files
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

function handleApiRequest(req, res, parsedUrl) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const endpoint = parsedUrl.pathname.replace('/api/', '');

    // GET /api/submissions - Get all submissions
    if (endpoint === 'submissions' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read database' }));
        }
        return;
    }

    // POST /api/submissions - Add new submission
    if (endpoint === 'submissions' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const submission = JSON.parse(body);
                const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
                submission.id = Date.now().toString();
                submission.timestamp = new Date().toISOString();
                submission.status = 'pending';
                dbData.submissions.push(submission);
                dbData.lastUpdated = new Date().toISOString();
                
                fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, id: submission.id }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to save submission' }));
            }
        });
        return;
    }

    // PUT /api/submissions/:id - Update submission
    if (endpoint.startsWith('submissions/') && req.method === 'PUT') {
        const id = endpoint.split('/')[1];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const updateData = JSON.parse(body);
                const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
                const submission = dbData.submissions.find(s => s.id === id);
                
                if (submission) {
                    Object.assign(submission, updateData);
                    submission.lastUpdated = new Date().toISOString();
                    dbData.lastUpdated = new Date().toISOString();
                    
                    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Submission not found' }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to update submission' }));
            }
        });
        return;
    }

    // DELETE /api/submissions/:id - Delete submission
    if (endpoint.startsWith('submissions/') && req.method === 'DELETE') {
        const id = endpoint.split('/')[1];
        try {
            const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            const originalLength = dbData.submissions.length;
            dbData.submissions = dbData.submissions.filter(s => s.id !== id);
            
            if (dbData.submissions.length < originalLength) {
                dbData.lastUpdated = new Date().toISOString();
                fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Submission not found' }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to delete submission' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Database file:', DB_FILE);
});
