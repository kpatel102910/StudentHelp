// Automatic Database Manager that updates JSON file automatically
class AutoDatabase {
    constructor() {
        this.dbFile = 'database.json';
        this.submissions = [];
        this.isUpdating = false;
        this.init();
    }

    async init() {
        await this.loadFromFile();
        console.log('Auto Database initialized with', this.submissions.length, 'submissions');
        
        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSaveToFile();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }

    // Load from JSON file or localStorage
    async loadFromFile() {
        try {
            // Try to load from JSON file first
            const response = await fetch(this.dbFile);
            if (response.ok) {
                const data = await response.json();
                this.submissions = data.submissions || [];
                console.log('Loaded from JSON file:', this.submissions.length, 'submissions');
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem('autoStudentHelpDB');
                if (stored) {
                    const data = JSON.parse(stored);
                    this.submissions = data.submissions || [];
                    console.log('Loaded from localStorage:', this.submissions.length, 'submissions');
                } else {
                    this.submissions = [];
                    console.log('Starting with empty database');
                }
            }
        } catch (error) {
            console.log('Error loading from file, using localStorage:', error);
            const stored = localStorage.getItem('autoStudentHelpDB');
            if (stored) {
                const data = JSON.parse(stored);
                this.submissions = data.submissions || [];
            } else {
                this.submissions = [];
            }
        }
    }

    // Save submission to localStorage and trigger auto-save
    saveSubmission(submission) {
        try {
            submission.id = Date.now().toString();
            submission.timestamp = new Date().toISOString();
            submission.status = 'pending';
            
            this.submissions.push(submission);
            
            // Save to localStorage immediately
            this.saveToLocalStorage();
            
            // Trigger auto-save to file
            this.autoSaveToFile();
            
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
                
                this.saveToLocalStorage();
                this.autoSaveToFile();
                
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
            
            this.saveToLocalStorage();
            this.autoSaveToFile();
            
            console.log('Submission deleted:', id);
            return true;
        } catch (error) {
            console.error('Error deleting submission:', error);
            return false;
        }
    }

    // Save to localStorage
    saveToLocalStorage() {
        const data = {
            submissions: this.submissions,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem('autoStudentHelpDB', JSON.stringify(data));
    }

    // Auto-save to JSON file using download
    autoSaveToFile() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        const data = {
            submissions: this.submissions,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        
        // Create download link
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'database-auto.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Auto-saved to file:', this.submissions.length, 'submissions');
        
        setTimeout(() => {
            this.isUpdating = false;
        }, 1000);
    }

    exportData() {
        return {
            submissions: this.submissions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importData(data) {
        try {
            if (data.submissions && Array.isArray(data.submissions)) {
                this.submissions = data.submissions;
                this.saveToLocalStorage();
                this.autoSaveToFile();
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

// Global instance
window.autoDatabase = new AutoDatabase();
