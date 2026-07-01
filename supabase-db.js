// Supabase Database Manager - Real cloud database solution
class SupabaseDatabase {
    constructor() {
        // Initialize Supabase client
        this.supabaseUrl = 'https://ctjskblszxlwqyfefblx.supabase.co'; // Fixed: added https://
        this.supabaseKey = 'sb_publishable_pmxjlbhs3YyQ5Ylc7Auqcw_PA9vQKZE'; // Replace with your Supabase anon key
        this.supabase = null;
        this.submissions = [];
        this.init();
    }

    async init() {
        try {
            // Load Supabase client
            if (window.supabase) {
                this.supabase = window.supabase.createClient(
                    this.supabaseUrl,
                    this.supabaseKey
                );
                console.log('Supabase client initialized');
                await this.loadSubmissions();
            } else {
                console.error('Supabase client not loaded. Please include Supabase CDN.');
                this.fallbackToLocalStorage();
            }
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            this.fallbackToLocalStorage();
        }
    }

    // Fallback to localStorage if Supabase fails
    fallbackToLocalStorage() {
        console.log('Falling back to localStorage');
        this.storageKey = 'studentHelpFallbackDB';
        this.loadFromStorage();
    }

    // Load submissions from Supabase
    async loadSubmissions() {
        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('submissions')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error loading from Supabase:', error);
                    this.fallbackToLocalStorage();
                    return;
                }

                this.submissions = data || [];
                console.log('Loaded from Supabase:', this.submissions.length, 'submissions');
            } catch (error) {
                console.error('Error loading from Supabase:', error);
                this.fallbackToLocalStorage();
            }
        } else {
            this.submissions = this.getFromStorage();
        }
    }

    // Save submission to Supabase
    async saveSubmission(submission) {
        if (this.supabase) {
            try {
                const submissionData = {
                    submission_type: submission.type,  // Updated to match SQL schema
                    name: submission.name,
                    subject: submission.subject,
                    topic: submission.topic,
                    description: submission.description,
                    status: 'pending',
                    created_at: new Date().toISOString()
                };

                console.log('Attempting to save to Supabase:', submissionData);
                
                const { data, error } = await this.supabase
                    .from('submissions')
                    .insert([submissionData])
                    .select();

                if (error) {
                    console.error('Supabase save error:', error);
                    console.error('Error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint
                    });
                    return false;
                }

                console.log('Successfully saved to Supabase:', data[0]);
                await this.loadSubmissions(); // Refresh local cache
                return true;
            } catch (error) {
                console.error('Exception saving to Supabase:', error);
                console.error('Exception details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                return false;
            }
        } else {
            console.log('Supabase not available, using localStorage fallback');
            return this.saveToStorage(submission);
        }
    }

    // Update submission status in Supabase
    async updateSubmissionStatus(id, newStatus) {
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('submissions')
                    .update({ 
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (error) {
                    console.error('Error updating in Supabase:', error);
                    return false;
                }

                console.log('Updated in Supabase:', id, newStatus);
                await this.loadSubmissions(); // Refresh local cache
                return true;
            } catch (error) {
                console.error('Error updating in Supabase:', error);
                return false;
            }
        } else {
            return this.updateInStorage(id, newStatus);
        }
    }

    // Delete submission from Supabase
    async deleteSubmission(id) {
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('submissions')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting from Supabase:', error);
                    return false;
                }

                console.log('Deleted from Supabase:', id);
                await this.loadSubmissions(); // Refresh local cache
                return true;
            } catch (error) {
                console.error('Error deleting from Supabase:', error);
                return false;
            }
        } else {
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
        console.log('Import not implemented for Supabase - use Supabase dashboard directly');
        return false;
    }

    // LocalStorage fallback methods
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.submissions = data.submissions || [];
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
            submission.id = Date.now().toString();
            submission.timestamp = new Date().toISOString();
            submission.status = 'pending';
            
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
