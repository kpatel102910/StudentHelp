// Local Database Manager that works without server - uses localStorage + manual file sync
class LocalDatabase {
    constructor() {
        this.storageKey = 'studentHelpLocalDB';
        this.submissions = [];
        this.init();
    }

    init() {
        this.loadFromStorage();
        console.log('Local Database initialized with', this.submissions.length, 'submissions');
        
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveToStorage();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.submissions = data.submissions || [];
                console.log('Loaded from localStorage:', this.submissions.length, 'submissions');
            } else {
                this.submissions = [];
                console.log('No data in localStorage, starting empty');
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.submissions = [];
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('Saved to localStorage:', this.submissions.length, 'submissions');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Save submission
    saveSubmission(submission) {
        try {
            submission.id = Date.now().toString();
            submission.timestamp = new Date().toISOString();
            submission.status = 'pending';
            
            this.submissions.push(submission);
            this.saveToStorage();
            
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
                this.saveToStorage();
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
            this.saveToStorage();
            console.log('Submission deleted:', id);
            return true;
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
        try {
            if (data.submissions && Array.isArray(data.submissions)) {
                this.submissions = data.submissions;
                this.saveToStorage();
                console.log('Data imported successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Manual sync to database.json file
    syncToFile() {
        try {
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
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Database synced to file:', this.submissions.length, 'submissions');
            return true;
        } catch (error) {
            console.error('Error syncing to file:', error);
            return false;
        }
    }
}

// Global instance
window.localDatabase = new LocalDatabase();
