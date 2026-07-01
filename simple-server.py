#!/usr/bin/env python3
import http.server
import socketserver
import threading
import json
import os
from urllib.parse import urlparse, parse_qs
import datetime

# Database file
DB_FILE = 'database.json'

# Initialize database if it doesn't exist
if not os.path.exists(DB_FILE):
    with open(DB_FILE, 'w') as f:
        json.dump({
            "submissions": [],
            "lastUpdated": datetime.datetime.now().isoformat(),
            "version": "1.0"
        }, f, indent=2)

class DatabaseHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse URL
        parsed_path = urlparse(self.path)
        
        # Serve static files
        if parsed_path.path == '/' or parsed_path.path == '':
            self.serve_file('index.html')
        elif parsed_path.path.startswith('/api/'):
            self.handle_api_get(parsed_path.path)
        else:
            self.serve_file(parsed_path.path[1:])  # Remove leading slash
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/'):
            self.handle_api_post(parsed_path.path)
        else:
            self.send_error(404, "API endpoint not found")
    
    def do_PUT(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/'):
            self.handle_api_put(parsed_path.path)
        else:
            self.send_error(404, "API endpoint not found")
    
    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/'):
            self.handle_api_delete(parsed_path.path)
        else:
            self.send_error(404, "API endpoint not found")
    
    def serve_file(self, filename):
        try:
            with open(filename, 'rb') as f:
                self.send_response(200, f.read())
        except FileNotFoundError:
            self.send_error(404, "File not found")
    
    def handle_api_get(self, path):
        if path == '/api/submissions':
            try:
                with open(DB_FILE, 'r') as f:
                    data = json.load(f)
                self.send_json_response(200, data)
            except Exception as e:
                self.send_error(500, f"Failed to read database: {str(e)}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_api_post(self, path):
        if path == '/api/submissions':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                submission = json.loads(post_data.decode('utf-8'))
                
                # Add metadata
                submission['id'] = str(int(datetime.datetime.now().timestamp()))
                submission['timestamp'] = datetime.datetime.now().isoformat()
                submission['status'] = 'pending'
                
                # Read existing data
                with open(DB_FILE, 'r') as f:
                    data = json.load(f)
                
                data['submissions'].append(submission)
                data['lastUpdated'] = datetime.datetime.now().isoformat()
                
                # Save to file
                with open(DB_FILE, 'w') as f:
                    json.dump(data, f, indent=2)
                
                self.send_json_response(201, {"success": True, "id": submission['id']})
            except Exception as e:
                self.send_error(500, f"Failed to save submission: {str(e)}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_api_put(self, path):
        if path.startswith('/api/submissions/'):
            submission_id = path.split('/')[-1]
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                update_data = json.loads(post_data.decode('utf-8'))
                
                # Read existing data
                with open(DB_FILE, 'r') as f:
                    data = json.load(f)
                
                # Find and update submission
                for submission in data['submissions']:
                    if submission['id'] == submission_id:
                        submission.update(update_data)
                        submission['lastUpdated'] = datetime.datetime.now().isoformat()
                        break
                
                data['lastUpdated'] = datetime.datetime.now().isoformat()
                
                # Save to file
                with open(DB_FILE, 'w') as f:
                    json.dump(data, f, indent=2)
                
                self.send_json_response(200, {"success": True})
            except Exception as e:
                self.send_error(500, f"Failed to update submission: {str(e)}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_api_delete(self, path):
        if path.startswith('/api/submissions/'):
            submission_id = path.split('/')[-1]
            try:
                # Read existing data
                with open(DB_FILE, 'r') as f:
                    data = json.load(f)
                
                original_length = len(data['submissions'])
                data['submissions'] = [s for s in data['submissions'] if s['id'] != submission_id]
                
                if len(data['submissions']) < original_length:
                    data['lastUpdated'] = datetime.datetime.now().isoformat()
                    
                    # Save to file
                    with open(DB_FILE, 'w') as f:
                        json.dump(data, f, indent=2)
                    
                    self.send_json_response(200, {"success": True})
                else:
                    self.send_error(404, "Submission not found")
            except Exception as e:
                self.send_error(500, f"Failed to delete submission: {str(e)}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def send_json_response(self, status, data):
        self.send_response(status, json.dumps(data).encode(), 'application/json')
    
    def send_error(self, status, message):
        self.send_response(status, message.encode(), 'text/plain')
    
    def send_response(self, status, content, content_type='text/html'):
        self.send_response_only(status)
        self.send_header('Content-type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

def run_server():
    port = 3000
    server = socketserver.TCPServer(('', port), DatabaseHandler)
    httpd = http.server.HTTPServer(server, DatabaseHandler)
    
    print(f"Server running at http://localhost:{port}")
    print(f"Database file: {os.path.abspath(DB_FILE)}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == '__main__':
    run_server()
