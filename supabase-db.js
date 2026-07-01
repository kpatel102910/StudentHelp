// API Database Manager - Uses server API endpoints instead of direct Supabase
class SupabaseDatabase {
    constructor() {
        this.submissions = [];
        this.storageKey = 'studentHelpFallbackDB';
        this.useLocalStorage = false;
        this.init();
    }

    async init() {
        try {
            await this.loadSubmissions();
        } catch (error) {
            console.error('Error initializing database:', error);
            this.fallbackToLocalStorage();
        }
    }

    // Fallback to localStorage if API fails
    fallbackToLocalStorage() {
        console.log('Falling back to localStorage');
        this.useLocalStorage = true;
        this.loadFromStorage();
    }

    // Load submissions from API
    async loadSubmissions() {
        if (this.useLocalStorage) {
            this.submissions = this.getFromStorage();
            return;
        }

        try {
            const response = await fetch('/api/submissions');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.submissions = this.normalizeSubmissions(data.submissions || []);
            console.log('Loaded from API:', this.submissions.length, 'submissions');
        } catch (error) {
            console.error('Error loading from API:', error);
            this.fallbackToLocalStorage();
        }
    }

    // Normalize submissions for frontend compatibility
    normalizeSubmissions(submissions) {
        return submissions.map(sub => ({
            id: sub.id,
            name: sub.name,
            email: sub.email || '',
            subject: sub.subject,
            topic: sub.topic,
            description: sub.description,
            status: sub.status,
            type: sub.type || sub.submission_type || 'request',
            submission_type: sub.submission_type || sub.type || 'request',
            timestamp: sub.timestamp || sub.created_at,
            created_at: sub.created_at || sub.timestamp,
            updated_at: sub.updated_at || sub.last_updated,
            last_updated: sub.last_updated || sub.updated_at
        }));
    }

    // Save submission via API
    async saveSubmission(submission) {
        if (this.useLocalStorage) {
            return this.saveToStorage(submission);
        }

        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submission)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Successfully saved via API:', result);
            await this.loadSubmissions(); // Refresh local cache
            return true;
        } catch (error) {
            console.error('Error saving via API:', error);
            this.fallbackToLocalStorage();
            return this.saveToStorage(submission);
        }
    }

    // Update submission status via API
    async updateSubmissionStatus(id, newStatus) {
        if (this.useLocalStorage) {
            return this.updateInStorage(id, newStatus);
        }

        try {
            const response = await fetch(`/api/submissions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Updated via API:', id, newStatus);
            await this.loadSubmissions(); // Refresh local cache
            return true;
        } catch (error) {
            console.error('Error updating via API:', error);
            this.fallbackToLocalStorage();
            return this.updateInStorage(id, newStatus);
        }
    }

    // Delete submission via API
    async deleteSubmission(id) {
        if (this.useLocalStorage) {
            return this.deleteFromStorage(id);
        }

        try {
            const response = await fetch(`/api/submissions/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Deleted via API:', id);
            await this.loadSubmissions(); // Refresh local cache
            return true;
        } catch (error) {
            console.error('Error deleting via API:', error);
            this.fallbackToLocalStorage();
            return this.deleteFromStorage(id);
        }
    }

    getSubmissions() {
        return this.submissions;
    }

    exportData() {
        return {
            submissions: this.submissions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importData(data) {
        console.log('Import not implemented - use server API directly');
        return false;
    }

    // LocalStorage fallback methods
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.submissions = this.normalizeSubmissions(data.submissions || []);
            } else {
                this.submissions = [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.submissions = [];
        }
    }

    saveToStorage(submission) {
        try {
            submission.id = submission.id || Date.now().toString();
            submission.timestamp = submission.timestamp || new Date().toISOString();
            submission.status = submission.status || 'pending';
            
            this.submissions.push(submission);
            
            const data = {
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
            console.log('Saved to localStorage fallback:', submission);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getFromStorage() {
        return this.submissions;
    }

    updateInStorage(id, newStatus) {
        try {
            const submission = this.submissions.find(s => s.id === id);
            if (submission) {
                submission.status = newStatus;
                submission.lastUpdated = new Date().toISOString();
                
                const data = {
                    submissions: this.submissions,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0'
                };
                localStorage.setItem(this.storageKey, JSON.stringify(data));
                
                console.log('Updated in localStorage fallback:', id, newStatus);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating in localStorage:', error);
            return false;
        }
    }

    deleteFromStorage(id) {
        try {
            this.submissions = this.submissions.filter(s => s.id !== id);
            
            const data = {
                submissions: this.submissions,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
            console.log('Deleted from localStorage fallback:', id);
            return true;
        } catch (error) {
            console.error('Error deleting from localStorage:', error);
            return false;
        }
    }
}

// Global instance
window.supabaseDatabase = new SupabaseDatabase();
