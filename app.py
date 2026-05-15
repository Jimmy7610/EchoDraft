import os
import re
import json
import hashlib
import subprocess
from flask import Flask, request, jsonify, send_file, render_template

app = Flask(__name__, template_folder='static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOICES_DIR = os.path.join(BASE_DIR, 'voices')
CACHE_DIR = os.path.join(BASE_DIR, 'data', 'cache')
UPLOADS_DIR = os.path.join(BASE_DIR, 'data', 'uploads')
CONFIG_FILE = os.path.join(BASE_DIR, 'config', 'settings.json')
PIPER_DIR = os.path.join(BASE_DIR, 'tools', 'piper')
PIPER_EXE = os.path.join(PIPER_DIR, 'piper.exe')

# Ensure directories exist
os.makedirs(VOICES_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
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

    voice_path = os.path.join(VOICES_DIR, voice_filename)
    if not os.path.exists(voice_path):
        return jsonify({"ok": False, "error": "Ingen röst hittades. Lägg .onnx och .onnx.json i voices/"}), 404
        
    if not os.path.exists(voice_path + ".json"):
        return jsonify({"ok": False, "error": "Röstens JSON-konfiguration saknas."}), 404
        
    if not os.path.exists(PIPER_EXE):
        return jsonify({"ok": False, "error": "Piper hittades inte. Lägg piper.exe och tillhörande filer i tools/piper/"}), 404

    # Clean text
    clean_text = clean_markdown(raw_text)
    if not clean_text or (len(clean_text) < 2 and not re.match(r'^[.!?\-"\']$', clean_text)):
        return jsonify({"ok": False, "error": "Tomt stycke hoppades över."}), 400

    # Limit text length to avoid crashes (arbitrary limit of 2000 chars per paragraph)
    if len(clean_text) > 2000:
        clean_text = clean_text[:2000]

    # Generate hash for cache
    hash_obj = hashlib.md5((clean_text + voice_filename).encode('utf-8'))
    wav_filename = f"{hash_obj.hexdigest()}.wav"
    wav_path = os.path.join(CACHE_DIR, wav_filename)

    # Use Piper to generate audio if not cached
    if not os.path.exists(wav_path):
        try:
            cmd = [
                PIPER_EXE,
                '--model', voice_path,
                '--config', voice_path + '.json',
                '--output_file', wav_path
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
                print(f"Piper error: {process.stderr}")
                return jsonify({"ok": False, "error": "Ett fel uppstod vid uppläsning med Piper (kontrollera terminalen)."}), 500
        except FileNotFoundError:
            return jsonify({"ok": False, "error": "Piper hittades inte. Lägg piper.exe och tillhörande filer i tools/piper/"}), 500
        except subprocess.TimeoutExpired:
            return jsonify({"ok": False, "error": "Uppläsningen tog för lång tid (timeout)."}), 500
        except Exception as e:
            return jsonify({"ok": False, "error": f"Kritiskt fel: {str(e)}"}), 500

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
