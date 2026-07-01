// Simple Database Manager that works with Live Server
class SimpleDatabase {
    constructor() {
        this.storageKey = 'studentHelpRequests';
        this.init();
    }

    init() {
        console.log('Simple Database initialized');
    }

    saveSubmission(submission) {
        try {
            const submissions = this.getSubmissions();
            submission.id = Date.now().toString();
            submission.timestamp = new Date().toISOString();
            submission.status = 'pending';
            submissions.push(submission);
            
            localStorage.setItem(this.storageKey, JSON.stringify(submissions));
            console.log('Submission saved:', submission);
            return true;
        } catch (error) {
            console.error('Error saving submission:', error);
            return false;
        }
    }

    getSubmissions() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting submissions:', error);
            return [];
        }
    }

    updateSubmissionStatus(id, newStatus) {
        try {
            const submissions = this.getSubmissions();
            const submission = submissions.find(s => s.id === id);
            if (submission) {
                submission.status = newStatus;
                submission.lastUpdated = new Date().toISOString();
                localStorage.setItem(this.storageKey, JSON.stringify(submissions));
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
            const submissions = this.getSubmissions();
            const filtered = submissions.filter(s => s.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting submission:', error);
            return false;
        }
    }

    exportData() {
        return {
            submissions: this.getSubmissions(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importData(data) {
        try {
            if (data.submissions && Array.isArray(data.submissions)) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.submissions));
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
window.simpleDatabase = new SimpleDatabase();
