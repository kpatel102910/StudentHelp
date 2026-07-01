// API-based Database Manager that uses server to actually write to files
class ApiDatabase {
    constructor() {
        this.baseUrl = window.location.origin.replace(/:\d+/, ':3000'); // Assume server on port 3000
        this.submissions = [];
        this.init();
    }

    async init() {
        await this.loadSubmissions();
        console.log('API Database initialized with', this.submissions.length, 'submissions');
        
        // Auto-refresh every 5 seconds
        setInterval(() => {
            this.loadSubmissions();
        }, 5000);
    }

    // Load submissions from server
    async loadSubmissions() {
        try {
            const response = await fetch(`${this.baseUrl}/api/submissions`);
            if (response.ok) {
                const data = await response.json();
                this.submissions = Array.isArray(data) ? data : data.submissions || [];
                console.log('Loaded from server:', this.submissions.length, 'submissions');
            } else {
                console.log('Server not available, using empty database');
                this.submissions = [];
            }
        } catch (error) {
            console.log('Error loading from server, using empty database:', error);
            this.submissions = [];
        }
    }

    // Save submission to server
    async saveSubmission(submission) {
        try {
            console.log('Attempting to save submission:', submission);
            console.log('Server URL:', `${this.baseUrl}/api/submissions`);
            
            const response = await fetch(`${this.baseUrl}/api/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const result = await response.json();
                console.log('Submission saved to server:', result);
                await this.loadSubmissions(); // Refresh local data
                return true;
            } else {
                const errorText = await response.text();
                console.error('Failed to save submission to server:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('Error saving submission:', error);
            console.error('Server running at:', this.baseUrl);
            return false;
        }
    }

    getSubmissions() {
        return this.submissions;
    }

    // Update submission status on server
    async updateSubmissionStatus(id, newStatus) {
        try {
            const response = await fetch(`${this.baseUrl}/api/submissions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                console.log('Status updated on server:', id, newStatus);
                await this.loadSubmissions(); // Refresh local data
                return true;
            } else {
                console.error('Failed to update status on server');
                return false;
            }
        } catch (error) {
            console.error('Error updating submission:', error);
            return false;
        }
    }

    // Delete submission from server
    async deleteSubmission(id) {
        try {
            const response = await fetch(`${this.baseUrl}/api/submissions/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log('Submission deleted from server:', id);
                await this.loadSubmissions(); // Refresh local data
                return true;
            } else {
                console.error('Failed to delete submission from server');
                return false;
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            return false;
        }
    }

    exportData() {
        return {
            submissions: this.submissions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importData(data) {
        // For API database, import would need to send each submission to server
        console.log('Import not implemented for API database - use server directly');
        return false;
    }
}

// Global instance
window.apiDatabase = new ApiDatabase();
