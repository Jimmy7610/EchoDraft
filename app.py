import os
import re
import json
import hashlib
import subprocess
import zipfile
import shutil
from flask import Flask, request, jsonify, send_file, render_template, send_from_directory

app = Flask(__name__, template_folder='static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOICES_DIR = os.path.join(BASE_DIR, 'voices')
CACHE_DIR = os.path.join(BASE_DIR, 'data', 'cache')
UPLOADS_DIR = os.path.join(BASE_DIR, 'data', 'uploads')
EXPORTS_DIR = os.path.join(BASE_DIR, 'data', 'exports')
CONFIG_FILE = os.path.join(BASE_DIR, 'config', 'settings.json')
PIPER_DIR = os.path.join(BASE_DIR, 'tools', 'piper')
PIPER_EXE = os.path.join(PIPER_DIR, 'piper.exe')

# Ensure directories exist
os.makedirs(VOICES_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)
os.makedirs(PIPER_DIR, exist_ok=True)

# Load config
try:
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        settings = json.load(f)
        VERSION = settings.get('version', '0.1.0')
except:
    VERSION = '0.1.0'

def clean_markdown(text):
    """
    Remove or normalize markdown to plain readable text for Piper.
    - headings (#)
    - bold (**bold**) -> bold
    - italic (*italic*) -> italic
    - links [text](url) -> text
    - images ![text](url) -> ignore
    - code blocks -> skip
    """
    if not text:
        return ""
    
    # Remove code blocks
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    # Remove inline code
    text = re.sub(r'`[^`]*`', '', text)
    # Remove images
    text = re.sub(r'!\[([^\]]*)\]\([^)]*\)', '', text)
    # Convert links to just text
    text = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
    # Remove headings
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    # Remove bold/italic
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'__(.*?)__', r'\1', text)
    text = re.sub(r'_(.*?)_', r'\1', text)
    # Remove horizontal rules
    text = re.sub(r'^[\-\*\_]{3,}\s*$', '', text, flags=re.MULTILINE)
    
    # Clean up extra whitespace
    text = re.sub(r'\n+', '\n', text).strip()
    
    # Clean multiple heading symbols inline
    text = re.sub(r'\s+#+\s+', ' — ', text)
    
    return text

def sanitize_filename(text):
    """
    Make a string safe for use as a filename.
    Replaces Swedish chars and non-alphanumeric chars.
    """
    # Replace Swedish chars
    text = text.replace('å', 'a').replace('ä', 'a').replace('ö', 'o')
    text = text.replace('Å', 'A').replace('Ä', 'A').replace('Ö', 'O')
    
    # Lowercase and replace spaces with underscores
    text = text.lower()
    text = re.sub(r'[^a-z0-9_\-]', '_', text)
    
    # Remove duplicate underscores
    text = re.sub(r'_+', '_', text)
    
    return text.strip('_')[:50] # Limit length

def generate_audio_file(text, voice_filename, output_path):
    """
    Shared helper to generate audio using Piper.
    """
    voice_path = os.path.join(VOICES_DIR, voice_filename)
    
    # Validation
    if not os.path.exists(PIPER_EXE):
        return False, "Piper hittades inte."
    if not os.path.exists(voice_path):
        return False, "Röstfil saknas."
    if not os.path.exists(voice_path + ".json"):
        return False, "JSON-konfiguration saknas."
        
    clean_text = clean_markdown(text)
    if not clean_text or (len(clean_text) < 2 and not re.match(r'^[.!?\-"\']$', clean_text)):
        return False, "Ingen läsbar text."

    # Limit text length per chunk
    if len(clean_text) > 2000:
        clean_text = clean_text[:2000]

    try:
        cmd = [
            PIPER_EXE,
            '--model', voice_path,
            '--config', voice_path + '.json',
            '--output_file', output_path
        ]
        
        process = subprocess.run(
            cmd,
            input=clean_text,
            text=True,
            encoding='utf-8',
            capture_output=True,
            timeout=30
        )
        
        if process.returncode != 0:
            return False, f"Piper error: {process.stderr}"
        return True, None
    except Exception as e:
        return False, str(e)

@app.route('/')
def index():
    return render_template('index.html', version=VERSION)

@app.route('/favicon.ico')
def favicon():
    return "", 204

@app.route('/api/voices', methods=['GET'])
def get_voices():
    voices = []
    if os.path.exists(VOICES_DIR):
        for filename in os.listdir(VOICES_DIR):
            if filename.endswith('.onnx'):
                json_config = filename + '.json'
                if os.path.exists(os.path.join(VOICES_DIR, json_config)):
                    voices.append(filename)
    return jsonify({"voices": voices})

@app.route('/api/speak', methods=['POST'])
def speak():
    data = request.json
    if not data or 'text' not in data or 'voice' not in data:
        return jsonify({"ok": False, "error": "Saknar text eller röst"}), 400

    raw_text = data['text'].strip()
    voice_filename = data['voice']
    
    if not raw_text:
        return jsonify({"ok": False, "error": "Tom text"}), 400
        
    # Basic sanitization of voice filename
    if '..' in voice_filename or '/' in voice_filename or '\\' in voice_filename:
        return jsonify({"ok": False, "error": "Ogiltigt röstfilnamn"}), 400

    # Generate hash for cache
    # We use cleaned text for the hash to avoid redundant generation
    clean_text = clean_markdown(raw_text)
    hash_obj = hashlib.md5((clean_text + voice_filename).encode('utf-8'))
    wav_filename = f"{hash_obj.hexdigest()}.wav"
    wav_path = os.path.join(CACHE_DIR, wav_filename)

    # Use Piper to generate audio if not cached
    if not os.path.exists(wav_path):
        success, error = generate_audio_file(raw_text, voice_filename, wav_path)
        if not success:
            return jsonify({"ok": False, "error": error}), 500

    return jsonify({
        "ok": True,
        "audioUrl": f"/audio/{wav_filename}"
    })

@app.route('/audio/<filename>')
def serve_audio(filename):
    # Basic sanitization
    if '..' in filename or '/' in filename or '\\' in filename:
        return "Ogiltigt filnamn", 400
        
    file_path = os.path.join(CACHE_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype="audio/wav")
    return "Ljudfil hittades inte", 404

@app.route('/api/export/paragraph', methods=['POST'])
def export_paragraph():
    data = request.json
    if not data or 'text' not in data or 'voice' not in data:
        return jsonify({"ok": False, "error": "Saknar data"}), 400
        
    text = data['text'].strip()
    voice = data['voice']
    filename_base = data.get('filenameBase', 'paragraph')
    
    safe_name = sanitize_filename(filename_base)
    wav_filename = f"{safe_name}.wav"
    wav_path = os.path.join(EXPORTS_DIR, wav_filename)
    
    success, error = generate_audio_file(text, voice, wav_path)
    if not success:
        return jsonify({"ok": False, "error": error}), 500
        
    return jsonify({
        "ok": True,
        "downloadUrl": f"/download/exports/{wav_filename}"
    })

@app.route('/api/export/manuscript', methods=['POST'])
def export_manuscript():
    data = request.json
    if not data or 'blocks' not in data or 'voice' not in data:
        return jsonify({"ok": False, "error": "Saknar data"}), 400
        
    blocks = data['blocks']
    voice = data['voice']
    filename_base = data.get('filenameBase', 'manuscript')
    
    safe_name = sanitize_filename(filename_base)
    zip_filename = f"{safe_name}.zip"
    zip_path = os.path.join(EXPORTS_DIR, zip_filename)
    
    # Create a temporary directory for WAV files
    temp_dir = os.path.join(EXPORTS_DIR, f"temp_{safe_name}")
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        wav_files = []
        for i, block in enumerate(blocks):
            text = block.get('speakText', block.get('displayText', ''))
            display = block.get('displayText', f"stycke_{i+1}")
            
            p_num = str(i + 1).zfill(3)
            p_name = sanitize_filename(display)
            p_filename = f"{p_num}_{p_name}.wav"
            p_path = os.path.join(temp_dir, p_filename)
            
            success, error = generate_audio_file(text, voice, p_path)
            if success:
                wav_files.append(p_path)
            # We skip failed blocks for now or log them
            
        if not wav_files:
            return jsonify({"ok": False, "error": "Inga stycken kunde exporteras."}), 500
            
        # Create ZIP
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for f in wav_files:
                zipf.write(f, os.path.basename(f))
                
        return jsonify({
            "ok": True,
            "downloadUrl": f"/download/exports/{zip_filename}"
        })
    finally:
        # Cleanup temp files
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

@app.route('/download/exports/<filename>')
def download_export(filename):
    # Basic sanitization
    if '..' in filename or '/' in filename or '\\' in filename:
        return "Ogiltigt filnamn", 400
    return send_from_directory(EXPORTS_DIR, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
