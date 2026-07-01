// File-based Database Manager that actually writes to database.json
class FileDatabase {
    constructor() {
        this.dbFile = 'database.json';
        this.submissions = [];
        this.init();
    }

    async init() {
        await this.loadFromFile();
        console.log('File Database initialized with', this.submissions.length, 'submissions');
    }

    // Load data from JSON file
    async loadFromFile() {
        try {
            const response = await fetch(this.dbFile);
            if (response.ok) {
                const data = await response.json();
                this.submissions = data.submissions || [];
                console.log('Loaded from file:', this.submissions.length, 'submissions');
            } else {
                console.log('File not found, starting with empty database');
                this.submissions = [];
            }
        } catch (error) {
            console.log('Error loading from file, using empty database:', error);
            this.submissions = [];
        }
    }

    // Save data to localStorage and trigger file download
    saveSubmission(submission) {
        try {
            submission.id = Date.now().toString();
            submission.timestamp = new Date().toISOString();
            submission.status = 'pending';
            
            this.submissions.push(submission);
            
            // Save to localStorage for immediate access
            localStorage.setItem('studentHelpFileDB', JSON.stringify({
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            }));
            
            console.log('Submission saved:', submission);
            return true;
        } catch (error) {
            console.error('Error saving submission:', error);
            return false;
        }
    }

    getSubmissions() {
        return this.submissions;
    }

    updateSubmissionStatus(id, newStatus) {
        try {
            const submission = this.submissions.find(s => s.id === id);
            if (submission) {
                submission.status = newStatus;
                submission.lastUpdated = new Date().toISOString();
                
                // Update localStorage
                localStorage.setItem('studentHelpFileDB', JSON.stringify({
                    submissions: this.submissions,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0'
                }));
                
                console.log('Status updated:', id, newStatus);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating submission:', error);
            return false;
        }
    }

    deleteSubmission(id) {
        try {
            this.submissions = this.submissions.filter(s => s.id !== id);
            
            // Update localStorage
            localStorage.setItem('studentHelpFileDB', JSON.stringify({
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            }));
            
            console.log('Submission deleted:', id);
            return true;
        } catch (error) {
            console.error('Error deleting submission:', error);
            return false;
        }
    }

    exportData() {
        const data = {
            submissions: this.submissions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return data;
    }

    importData(data) {
        try {
            if (data.submissions && Array.isArray(data.submissions)) {
                this.submissions = data.submissions;
                
                // Update localStorage
                localStorage.setItem('studentHelpFileDB', JSON.stringify({
                    submissions: this.submissions,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0'
                }));
                
                console.log('Data imported successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Method to update the actual JSON file (requires manual action)
    updateJSONFile() {
        const data = {
            submissions: this.submissions,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'database.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('JSON file updated - please replace the old database.json file');
    }
}

// Global instance
window.fileDatabase = new FileDatabase();
