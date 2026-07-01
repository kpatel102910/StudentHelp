// Database Manager for Student Academic Help
// This handles reading/writing to the shared database.json file

class DatabaseManager {
    constructor() {
        this.dbFile = 'database.json';
        this.submissions = [];
        this.init();
    }

    async init() {
        await this.loadDatabase();
    }

    // Load database from JSON file
    async loadDatabase() {
        try {
            // In a real server environment, this would be a database query
            // For now, we'll use localStorage as a fallback but sync with the JSON file
            const localData = localStorage.getItem('studentHelpDatabase');
            const fileData = await this.readDatabaseFile();
            
            if (fileData) {
                this.submissions = fileData.submissions || [];
                // Sync to localStorage for backup
                localStorage.setItem('studentHelpDatabase', JSON.stringify(fileData));
            } else if (localData) {
                const parsed = JSON.parse(localData);
                this.submissions = parsed.submissions || [];
            }
            
            console.log('Database loaded with', this.submissions.length, 'submissions');
        } catch (error) {
            console.error('Error loading database:', error);
            this.submissions = [];
        }
    }

    // Simulate reading database file (in real app, this would be API call)
    async readDatabaseFile() {
        try {
            // Try to fetch from the API endpoint instead of file
            const response = await fetch('/api/submissions');
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.log('API not accessible, using localStorage');
        }
        return null;
    }

    // Save submission to database
    async saveSubmission(submission) {
        try {
            // Add unique ID and timestamps
            submission.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            submission.timestamp = new Date().toISOString();
            submission.lastUpdated = new Date().toISOString();
            submission.status = 'pending';
            
            this.submissions.push(submission);
            
            // Save to localStorage (immediate)
            const dbData = {
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem('studentHelpDatabase', JSON.stringify(dbData));
            
            // In a real app, this would save to a database
            console.log('Submission saved to database:', submission);
            
            // Trigger storage event for other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'studentHelpDatabase',
                newValue: JSON.stringify(dbData)
            }));
            
            return true;
        } catch (error) {
            console.error('Error saving submission:', error);
            return false;
        }
    }

    // Get all submissions
    getAllSubmissions() {
        return this.submissions;
    }

    // Update submission status
    async updateSubmissionStatus(id, newStatus) {
        try {
            const submission = this.submissions.find(s => s.id === id);
            if (submission) {
                submission.status = newStatus;
                submission.lastUpdated = new Date().toISOString();
                
                // Save to localStorage
                const dbData = {
                    submissions: this.submissions,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0'
                };
                localStorage.setItem('studentHelpDatabase', JSON.stringify(dbData));
                
                console.log('Submission status updated:', id, newStatus);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating submission:', error);
            return false;
        }
    }

    // Delete submission
    async deleteSubmission(id) {
        try {
            this.submissions = this.submissions.filter(s => s.id !== id);
            
            // Save to localStorage
            const dbData = {
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem('studentHelpDatabase', JSON.stringify(dbData));
            
            console.log('Submission deleted:', id);
            return true;
        } catch (error) {
            console.error('Error deleting submission:', error);
            return false;
        }
    }

    // Get filtered submissions
    getFilteredSubmissions(filters = {}) {
        let filtered = [...this.submissions];
        
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(s => s.status === filters.status);
        }
        
        if (filters.subject && filters.subject !== 'all') {
            filtered = filtered.filter(s => s.subject === filters.subject);
        }
        
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(s => s.type === filters.type);
        }
        
        // Sort by timestamp (newest first)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return filtered;
    }

    // Export data
    exportData() {
        const data = {
            submissions: this.submissions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return data;
    }

    // Import data
    async importData(data) {
        try {
            if (data.submissions && Array.isArray(data.submissions)) {
                this.submissions = data.submissions;
                
                // Save to localStorage
                const dbData = {
                    submissions: this.submissions,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0'
                };
                localStorage.setItem('studentHelpDatabase', JSON.stringify(dbData));
                
                console.log('Data imported successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Global database instance
window.databaseManager = new DatabaseManager();
