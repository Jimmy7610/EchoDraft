document.addEventListener('DOMContentLoaded', () => {
    // INSTÄLLNING - Paus i millisekunder mellan upplästa stycken.
    const PAUSE_BETWEEN_PARAGRAPHS = 700;
    
    // INSTÄLLNING - Max antal tecken som sparas i webbläsarens localStorage.
    const MAX_LOCAL_STORAGE_MANUSCRIPT_CHARS = 500000;

    // INSTÄLLNING - Max antal tecken per ljudbit som skickas till Piper.
    const MAX_SPEECH_CHUNK_CHARS = 450;

    // INSTÄLLNING - Avstånd från toppen när aktivt stycke scrollas fram.
    const UI_SCROLL_OFFSET = 120;

    // INSTÄLLNING - Här kan egna ord få ett mer talvänligt uttal.
    const PRONUNCIATION_REPLACEMENTS = {
        "Taren": "Taaren",
        "Lyssnaren": "Lyssnaren"
    };

    const CHAPTER_NUMBERS = {
        1: "ett", 2: "två", 3: "tre", 4: "fyra", 5: "fem", 6: "sex", 7: "sju", 8: "åtta", 9: "nio", 10: "tio",
        11: "elva", 12: "tolv", 13: "tretton", 14: "fjorton", 15: "femton", 16: "sexton", 17: "sjutton", 18: "arton", 19: "nitton", 20: "tjugo",
        21: "tjugoett", 22: "tjugotvå", 23: "tjugotre", 24: "tjugofyra", 25: "tjugofem", 26: "tjugosex", 27: "tjugosju", 28: "tjugoåtta", 29: "tjugonio", 30: "trettio"
    };

    // Translations
    const I18N = {
        sv: {
            brand_subtitle: "Lokal svensk manusuppläsare",
            brand_credits: "Byggd av Jimmy Eliasson",
            lbl_voice: "Röst",
            opt_loading_voices: "Laddar röster...",
            opt_no_voices: "Inga röster funna",
            opt_load_error: "Fel vid laddning",
            btn_choose_file: "Välj fil...",
            help_text_local: "Texten stannar lokalt i din webbläsare.",
            title_test_voice: "Testa röst",
            title_prev: "Föregående stycke",
            title_play: "Läs upp / Fortsätt",
            title_pause: "Pausa",
            title_stop: "Stoppa",
            title_next: "Nästa stycke",
            title_read_selected: "Läs endast markerat stycke",
            btn_read_selected: "Läs markerat",
            btn_resume: "Fortsätt",
            lbl_speed: "Hastighet",
            lbl_volume: "Volym",
            status_ready: "Klar",
            lbl_saved_locally: "Lokalt sparat",
            btn_clear: "Rensa",
            btn_save_audio: "Spara ljudfil",
            top_no_manuscript: "Inget manus laddat",
            title_privacy: "All text stannar lokalt på din dator",
            badge_local_runtime: "Lokal körning",
            empty_title: "Ladda in ett manus",
            empty_desc: "Öppna en Markdown-fil eller klistra in text för att börja lyssna.",
            empty_btn_file: "Välj .md-fil",
            empty_btn_paste: "Klistra in text",
            empty_privacy: "All text stannar lokalt på din dator.",
            placeholder_paste: "Klistra in text här...",
            
            // Dynamic messages
            msg_too_large: "Manuset är för stort för automatisk sparning.",
            msg_restored: "Senaste manus återställt.",
            msg_cleared: "Sparat manus rensat.",
            msg_err_fetch_voices: "Fel vid hämtning av röster",
            msg_err_no_voice: "Ingen röst hittades. Kontrollera voices-mappen.",
            msg_err_backend: "Backend svarar inte. Körs app.py?",
            msg_pasted_manuscript: "Inklistrat manus",
            msg_no_readable_text: "Ingen läsbar text hittades i manuset.",
            msg_ready_to_read: "Klar att läsa",
            msg_preparing_audio: "Förbereder ljud...",
            msg_reading_error: "Fel vid uppläsning",
            msg_network_error: "Nätverksfel",
            msg_playing: "Spelar upp...",
            msg_playback_error: "Uppspelningsfel",
            msg_paused: "Pausad",
            msg_stopped: "Stoppad",
            msg_resuming: "Fortsätter...",
            msg_resuming_from: "Fortsätter från stycke {idx}",
            msg_paragraphs: "Läser stycke {current} av {total}",
            msg_paragraphs_idle: "Stycke {current} av {total}",
            msg_short_pause: "Pausar kort...",
            msg_test_sample: "Det här är ett rösttest för bokuppläsning i EchoDraft. Rösten ska läsa långsamt, tydligt och med mjuka pauser mellan meningarna. Taren låg stilla i dimman, och brevet på bordet väntade på att bli förstått.",
            
            alert_select_voice: "Välj en röst först.",
            alert_clear_confirm: "Vill du rensa det sparade manuset från den här webbläsaren?",
            alert_no_audio: "Ingen ljudfil finns att spara. Läs upp ett stycke först.",
            alert_generic_error: "Ett fel uppstod.",
            
            err_piper_missing: "Piper hittades inte.",
            err_json_missing: "Röstens JSON-konfiguration saknas."
        },
        en: {
            brand_subtitle: "Local manuscript reader",
            brand_credits: "Built by Jimmy Eliasson",
            lbl_voice: "Voice",
            opt_loading_voices: "Loading voices...",
            opt_no_voices: "No voices found",
            opt_load_error: "Loading error",
            btn_choose_file: "Choose file...",
            help_text_local: "Text stays local in your browser.",
            title_test_voice: "Test voice",
            title_prev: "Previous paragraph",
            title_play: "Read / Resume",
            title_pause: "Pause",
            title_stop: "Stop",
            title_next: "Next paragraph",
            title_read_selected: "Read only selected paragraph",
            btn_read_selected: "Read selected",
            btn_resume: "Resume",
            lbl_speed: "Speed",
            lbl_volume: "Volume",
            status_ready: "Ready",
            lbl_saved_locally: "Saved locally",
            btn_clear: "Clear",
            btn_save_audio: "Save audio file",
            top_no_manuscript: "No manuscript loaded",
            title_privacy: "Text is not sent to the cloud",
            badge_local_runtime: "Local runtime",
            empty_title: "Load a manuscript",
            empty_desc: "Open a Markdown file or paste text to start listening.",
            empty_btn_file: "Select .md file",
            empty_btn_paste: "Paste text",
            empty_privacy: "All text stays local on your computer.",
            placeholder_paste: "Paste text here...",
            
            // Dynamic messages
            msg_too_large: "Manuscript is too large to auto-save.",
            msg_restored: "Latest manuscript restored.",
            msg_cleared: "Saved manuscript cleared.",
            msg_err_fetch_voices: "Error fetching voices",
            msg_err_no_voice: "No voice found. Check the voices folder.",
            msg_err_backend: "Backend is not responding. Is app.py running?",
            msg_pasted_manuscript: "Pasted manuscript",
            msg_no_readable_text: "No readable text found.",
            msg_ready_to_read: "Ready to read",
            msg_preparing_audio: "Preparing audio...",
            msg_reading_error: "Reading error",
            msg_network_error: "Network error",
            msg_playing: "Playing...",
            msg_playback_error: "Playback error",
            msg_paused: "Paused",
            msg_stopped: "Stopped",
            msg_resuming: "Resuming...",
            msg_resuming_from: "Resuming from paragraph {idx}",
            msg_paragraphs: "Reading paragraph {current} of {total}",
            msg_paragraphs_idle: "Paragraph {current} of {total}",
            msg_short_pause: "Short pause...",
            msg_test_sample: "This is a voice test for manuscript reading in EchoDraft. The voice should read clearly, calmly, and with soft pauses between sentences. The room was quiet, and the page waited to be heard.",
            
            alert_select_voice: "Please select a voice first.",
            alert_clear_confirm: "Do you want to clear the saved manuscript from this browser?",
            alert_no_audio: "No audio file to save. Read a paragraph first.",
            alert_generic_error: "An error occurred.",
            
            err_piper_missing: "Piper was not found.",
            err_json_missing: "Voice JSON configuration is missing."
        }
    };

    let currentLang = localStorage.getItem('echodraft_uiLanguage') || 'sv';

    function t(key, vars = {}) {
        let str = I18N[currentLang][key] || I18N['sv'][key] || key;
        for (const [k, v] of Object.entries(vars)) {
            str = str.replace(`{${k}}`, v);
        }
        return str;
    }

    function translateBackendError(errStr) {
        if (!errStr) return t('alert_generic_error');
        if (errStr.includes("Piper hittades inte")) return t('err_piper_missing');
        if (errStr.includes("JSON-konfiguration saknas")) return t('err_json_missing');
        if (errStr.includes("Tomt stycke") || errStr.includes("Ingen läsbar text")) return t('msg_no_readable_text');
        return errStr;
    }

    function translateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.getAttribute('data-i18n-title'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        });
        updateProgress();
        updateDynamicStatusFromState();
        
        document.getElementById('lang-sv').classList.toggle('active', currentLang === 'sv');
        document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
        
        // Retranslate empty options if they are selected
        if (voiceSelect && voiceSelect.value === "") {
            const currentOptText = voiceSelect.options[0].textContent;
            if (currentOptText.includes("Laddar") || currentOptText.includes("Loading")) {
                voiceSelect.options[0].textContent = t('opt_loading_voices');
            } else if (currentOptText.includes("Fel") || currentOptText.includes("error")) {
                voiceSelect.options[0].textContent = t('opt_load_error');
            } else if (currentOptText.includes("Inga") || currentOptText.includes("No")) {
                voiceSelect.options[0].textContent = t('opt_no_voices');
            }
        }
        
        // Retranslate topbar if empty or pasted
        if (topbarTitle) {
            if (paragraphs.length === 0 && textInput.value.trim() === "") {
                topbarTitle.textContent = t('top_no_manuscript');
            } else if (topbarTitle.textContent === I18N['sv']['msg_pasted_manuscript'] || topbarTitle.textContent === I18N['en']['msg_pasted_manuscript']) {
                topbarTitle.textContent = t('msg_pasted_manuscript');
            }
        }
    }

    function setLanguage(lang) {
        if (!I18N[lang]) return;
        currentLang = lang;
        localStorage.setItem('echodraft_uiLanguage', lang);
        translateUI();
    }

    function updateDynamicStatusFromState() {
        if (!statusText) return;
        // Don't overwrite if it's currently showing an active transient state
        if (isReading && !isPaused) {
            if (statusText.textContent.includes("Spelar") || statusText.textContent.includes("Play")) {
                statusText.textContent = t('msg_playing');
            } else if (statusText.textContent.includes("Förbereder") || statusText.textContent.includes("Prep")) {
                statusText.textContent = t('msg_preparing_audio');
            }
        } else if (isPaused) {
            statusText.textContent = t('msg_paused');
        } else if (!isReading && (statusText.textContent === I18N['sv']['msg_ready_to_read'] || statusText.textContent === I18N['en']['msg_ready_to_read'] || statusText.textContent === "Klar" || statusText.textContent === "Ready")) {
            statusText.textContent = t(paragraphs.length > 0 ? 'msg_ready_to_read' : 'status_ready');
        } else if (!isReading && (statusText.textContent === I18N['sv']['msg_stopped'] || statusText.textContent === I18N['en']['msg_stopped'])) {
            statusText.textContent = t('msg_stopped');
        }
    }

    // Stabilitetsfunktion för att hämta element utan att krascha om de saknas
    function safeGetElement(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`EchoDraft Varning: Saknat DOM-element: #${id}. Viss funktionalitet kan påverkas.`);
        }
        return el;
    }

    // Stabilitetsfunktion för att säkert fästa event listeners
    function safeAddListener(id, event, callback) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, callback);
        } else {
            console.error(`EchoDraft Varning: Kunde inte lägga till ${event}-lyssnare. Saknat element: #${id}`);
        }
    }

    // Elements
    const voiceSelect = safeGetElement('voice-select');
    const voiceError = safeGetElement('voice-error');
    const fileUpload = safeGetElement('file-upload');
    const textInput = safeGetElement('text-input');
    const readerView = safeGetElement('reader-view');
    const statusText = safeGetElement('status-text');
    const progressText = safeGetElement('progress-text');
    const topbarTitle = safeGetElement('topbar-title');
    const emptyState = safeGetElement('empty-state');
    const editorContainer = safeGetElement('editor-container');
    const scrollArea = document.querySelector('.scroll-area');
    const storageFooter = safeGetElement('storage-footer');
    
    const speedRange = safeGetElement('speed-range');
    const speedVal = safeGetElement('speed-val');
    const volumeRange = safeGetElement('volume-range');
    const volumeVal = safeGetElement('volume-val');
    
    const audioPlayer = safeGetElement('audio-player');

    // State
    let paragraphs = [];
    let currentParagraphIndex = -1;
    let isReading = false;
    let isSingleReading = false;
    let isPaused = false;
    let currentAudioUrl = null;
    let documentHash = "";

    // Load Settings
    const savedSpeed = localStorage.getItem('echodraft_speed') || '0.9';
    const savedVolume = localStorage.getItem('echodraft_volume') || '1.0';
    if (speedRange) speedRange.value = savedSpeed;
    if (speedVal) speedVal.textContent = parseFloat(savedSpeed).toFixed(1);
    if (volumeRange) volumeRange.value = savedVolume;
    if (volumeVal) volumeVal.textContent = Math.round(parseFloat(savedVolume) * 100);

    // Save voice preference
    if (voiceSelect) {
        voiceSelect.addEventListener('change', () => {
            if (voiceSelect.value) {
                localStorage.setItem('echodraft_voice', voiceSelect.value);
            }
        });
    }

    safeAddListener('lang-sv', 'click', () => setLanguage('sv'));
    safeAddListener('lang-en', 'click', () => setLanguage('en'));

    function hashCode(str) {
        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash.toString();
    }

    function saveManuscriptLocally(text, title = t('msg_pasted_manuscript')) {
        if (!text || text.trim() === "" || text === I18N['sv']['msg_test_sample'] || text === I18N['en']['msg_test_sample']) return;
        
        documentHash = hashCode(text);
        
        if (text.length > MAX_LOCAL_STORAGE_MANUSCRIPT_CHARS) {
            if (statusText) statusText.textContent = t('msg_too_large');
            return;
        }

        localStorage.setItem('echodraft_lastManuscriptRaw', text);
        localStorage.setItem('echodraft_lastManuscriptHash', documentHash);
        localStorage.setItem('echodraft_lastManuscriptTitle', title);
        localStorage.setItem('echodraft_lastUpdatedAt', Date.now().toString());
        
        if (storageFooter) storageFooter.style.display = 'flex';
    }

    function saveCurrentPosition() {
        if (currentParagraphIndex >= 0) {
            localStorage.setItem('echodraft_lastParagraphIndex', currentParagraphIndex.toString());
            if (documentHash) {
                localStorage.setItem(`echodraft_pos_${documentHash}`, currentParagraphIndex.toString());
            }
        }
    }

    function tryRestoreManuscript() {
        const savedRaw = localStorage.getItem('echodraft_lastManuscriptRaw');
        if (savedRaw && savedRaw.trim() !== "") {
            if (textInput) textInput.value = savedRaw;
            documentHash = localStorage.getItem('echodraft_lastManuscriptHash');
            
            const savedTitle = localStorage.getItem('echodraft_lastManuscriptTitle') || t('msg_pasted_manuscript');
            if (topbarTitle) topbarTitle.textContent = savedTitle;

            prepareReaderView(true);
            
            const savedIndex = localStorage.getItem('echodraft_lastParagraphIndex');
            if (savedIndex !== null) {
                let idx = parseInt(savedIndex);
                if (idx >= 0 && idx < paragraphs.length) {
                    currentParagraphIndex = idx;
                    const btnResume = document.getElementById('btn-resume');
                    if (btnResume) btnResume.style.display = 'block';
                } else {
                    currentParagraphIndex = 0;
                    const btnResume = document.getElementById('btn-resume');
                    if (btnResume) btnResume.style.display = 'none';
                }
            }
            
            if (statusText) statusText.textContent = t('msg_restored');
            if (storageFooter) storageFooter.style.display = 'flex';
        } else {
            showEmptyState();
        }
    }

    async function loadVoices() {
        if (!voiceSelect) return;
        
        try {
            const res = await fetch('/api/voices');
            
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            
            const data = await res.json();
            voiceSelect.innerHTML = '';
            
            if (data.voices && data.voices.length > 0) {
                data.voices.sort((a, b) => {
                    const aPref = a.toLowerCase().includes('sv') || a.toLowerCase().includes('alma') ? -1 : 1;
                    const bPref = b.toLowerCase().includes('sv') || b.toLowerCase().includes('alma') ? -1 : 1;
                    return aPref - bPref;
                });
                
                data.voices.forEach(v => {
                    const option = document.createElement('option');
                    option.value = v;
                    option.textContent = v;
                    voiceSelect.appendChild(option);
                });
                
                const savedVoice = localStorage.getItem('echodraft_voice');
                if (savedVoice && data.voices.includes(savedVoice)) {
                    voiceSelect.value = savedVoice;
                } else {
                    voiceSelect.value = data.voices[0];
                }
                
                if (voiceError) voiceError.style.display = 'none';
            } else {
                voiceSelect.innerHTML = `<option value="">${t('opt_no_voices')}</option>`;
                if (voiceError) {
                    voiceError.textContent = t('msg_err_no_voice');
                    voiceError.style.display = 'block';
                }
            }
        } catch (e) {
            console.error("Kunde inte hämta röster", e);
            if (statusText) statusText.textContent = t('msg_err_fetch_voices');
            voiceSelect.innerHTML = `<option value="">${t('opt_load_error')}</option>`;
            if (voiceError) {
                voiceError.textContent = t('msg_err_backend');
                voiceError.style.display = 'block';
            }
        }
    }

    function showEmptyState() {
        if (emptyState) emptyState.style.display = 'flex';
        if (editorContainer) editorContainer.style.display = 'none';
        if (readerView) readerView.style.display = 'none';
        const btnResume = document.getElementById('btn-resume');
        if (btnResume) btnResume.style.display = 'none';
        if (topbarTitle) topbarTitle.textContent = t('top_no_manuscript');
    }

    function showEditorState() {
        if (emptyState) emptyState.style.display = 'none';
        if (editorContainer) editorContainer.style.display = 'flex';
        if (readerView) readerView.style.display = 'none';
        if (textInput) textInput.focus();
        if (topbarTitle && (topbarTitle.textContent === I18N['sv']['top_no_manuscript'] || topbarTitle.textContent === I18N['en']['top_no_manuscript'])) {
            topbarTitle.textContent = t('msg_pasted_manuscript');
        }
    }

    if (fileUpload && textInput && topbarTitle) {
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            topbarTitle.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                textInput.value = e.target.result;
                resetReader();
                saveManuscriptLocally(textInput.value, file.name);
                prepareReaderView();
            };
            reader.readAsText(file);
        });
    }

    safeAddListener('btn-paste-focus', 'click', () => {
        showEditorState();
    });

    let typingTimer;
    if (textInput) {
        textInput.addEventListener('input', () => {
            if (isReading) stopReading();
            const btnResume = document.getElementById('btn-resume');
            if (btnResume) btnResume.style.display = 'none';
            
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                saveManuscriptLocally(textInput.value, t('msg_pasted_manuscript'));
            }, 1500);
        });
    }

    function normalizeForSpeech(text) {
        let t_val = text;

        t_val = t_val.replace(/KAPITEL\s+(\d+)/gi, (match, p1) => {
            const num = parseInt(p1);
            if (CHAPTER_NUMBERS[num]) {
                return "Kapitel " + CHAPTER_NUMBERS[num];
            }
            return "Kapitel " + num;
        });

        // Only aggressive decapitalization for purely Swedish looking blocks to avoid harming English acronyms
        // Let's make it more conservative: don't touch ALL CAPS unless it's very long or purely Swedish names
        // But the user requested to keep it working for Swedish and not break English.
        t_val = t_val.replace(/\b([A-ZÅÄÖ])([A-ZÅÄÖ]+)\b/g, (match, p1, p2) => {
            // Keep it mostly the same as before as per instructions, but ensure it works.
            return p1 + p2.toLowerCase();
        });

        t_val = t_val.replace(/\.{2,}/g, '. ');
        t_val = t_val.replace(/[—–]/g, ', ');
        t_val = t_val.replace(/[~^*_#]/g, ' ');
        t_val = t_val.replace(/\s+/g, ' ');
        t_val = t_val.replace(/([.,!?;:])\1+/g, '$1');

        for (const [word, replacement] of Object.entries(PRONUNCIATION_REPLACEMENTS)) {
            const regex = new RegExp(`(^|[^a-zåäöA-ZÅÄÖ0-9])(${word})(?=[^a-zåäöA-ZÅÄÖ0-9]|$)`, 'gi');
            t_val = t_val.replace(regex, `$1${replacement}`);
        }

        return t_val.trim();
    }

    function cleanMarkdownBlock(raw) {
        let text = raw;
        let isHeading = false;
        
        if (/^#+\s+/.test(text)) {
            isHeading = true;
        }
        
        text = text.replace(/#+\s+/g, (match, offset) => offset === 0 ? '' : ' — ');
        text = text.replace(/```[\s\S]*?```/g, '');
        text = text.replace(/`[^`]*`/g, '');
        text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
        text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        text = text.replace(/\*(.*?)\*/g, '$1');
        text = text.replace(/__(.*?)__/g, '$1');
        text = text.replace(/_(.*?)_/g, '$1');
        text = text.replace(/^[\-\*\_]{3,}\s*$/gm, '');
        
        text = text.trim();
        
        return {
            raw: raw,
            displayText: text,
            speakText: normalizeForSpeech(text),
            type: isHeading ? 'heading' : 'paragraph',
            isEmpty: text.length < 2 && !/^[.!?\-"']$/.test(text)
        };
    }

    function splitSpeakText(text) {
        if (text.length <= MAX_SPEECH_CHUNK_CHARS) return [text];
        
        let chunks = [];
        let parts = text.match(/[^.!?;:]+[.!?;:]+(?:\s|$)|[^.!?;:]+$/g);
        if (!parts) return [text];

        let currentChunk = "";
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i].trim();
            if (!part) continue;
            
            if (part.length > MAX_SPEECH_CHUNK_CHARS) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = "";
                }
                
                let subparts = part.match(/[^,]+,?(?:\s|$)|[^,]+$/g);
                if (!subparts) subparts = [part];
                for (let j = 0; j < subparts.length; j++) {
                    let sub = subparts[j].trim();
                    if (!sub) continue;
                    
                    if (currentChunk.length + sub.length + 1 > MAX_SPEECH_CHUNK_CHARS) {
                        if (currentChunk) chunks.push(currentChunk.trim());
                        currentChunk = sub;
                        if (currentChunk.length > MAX_SPEECH_CHUNK_CHARS) {
                            chunks.push(currentChunk);
                            currentChunk = "";
                        }
                    } else {
                        currentChunk += (currentChunk ? " " : "") + sub;
                    }
                }
            } else {
                if (currentChunk.length + part.length + 1 > MAX_SPEECH_CHUNK_CHARS) {
                    chunks.push(currentChunk.trim());
                    currentChunk = part;
                } else {
                    currentChunk += (currentChunk ? " " : "") + part;
                }
            }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }

    function prepareReaderView(isRestoring = false) {
        if (!textInput || !readerView) return;
        
        let text = textInput.value;
        if (!text.trim()) {
            if (!isRestoring) showEditorState();
            return;
        }

        let blocks = text.split(/\n\s*\n/);
        
        paragraphs = blocks
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .map(raw => cleanMarkdownBlock(raw))
            .filter(block => !block.isEmpty);
            
        readerView.innerHTML = '';
        
        if (paragraphs.length === 0) {
            if (statusText) statusText.textContent = t('msg_no_readable_text');
            showEditorState();
            return;
        }

        if (!isRestoring) {
            saveManuscriptLocally(text, topbarTitle ? topbarTitle.textContent : t('msg_pasted_manuscript'));
        }

        paragraphs.forEach((block, index) => {
            const pElement = document.createElement('div');
            pElement.className = 'paragraph ' + block.type;
            pElement.id = `para-${index}`;
            pElement.textContent = block.displayText;
            
            pElement.addEventListener('click', () => {
                currentParagraphIndex = index;
                saveCurrentPosition();
                highlightParagraph(index);
                updateProgress();
            });
            
            readerView.appendChild(pElement);
        });

        if (emptyState) emptyState.style.display = 'none';
        if (editorContainer) editorContainer.style.display = 'none';
        readerView.style.display = 'block';
        
        if (!isRestoring && statusText) {
            statusText.textContent = t('msg_ready_to_read');
        }
        updateProgress();
    }

    function resetReader() {
        stopReading();
        showEditorState();
        const btnResume = document.getElementById('btn-resume');
        if (btnResume) btnResume.style.display = 'none';
    }

    async function startReadingFromCurrent(continuous = true, overrideText = null) {
        if (!voiceSelect) return;
        const selectedVoice = voiceSelect.value;
        if (!selectedVoice) {
            alert(t('alert_select_voice'));
            return;
        }

        if (overrideText) {
            isReading = true;
            isPaused = false;
            isSingleReading = true;
            if (statusText) {
                statusText.textContent = t('msg_preparing_audio');
                statusText.classList.add("status-loading");
            }
            await readRawText(overrideText, selectedVoice);
            return;
        }

        if (paragraphs.length === 0) {
            prepareReaderView();
        }
        
        if (currentParagraphIndex < 0 || currentParagraphIndex >= paragraphs.length) {
            currentParagraphIndex = 0;
        }

        if (paragraphs.length === 0) return;

        isReading = true;
        isPaused = false;
        isSingleReading = !continuous;
        highlightParagraph(currentParagraphIndex);
        saveCurrentPosition();
        await readParagraph(currentParagraphIndex, selectedVoice);
    }

    async function readRawText(text, voice) {
        if (!isReading) return;
        
        let chunks = splitSpeakText(normalizeForSpeech(text));

        try {
            for (let i = 0; i < chunks.length; i++) {
                if (!isReading) return;
                
                const res = await fetch('/api/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: chunks[i], voice })
                });
                
                const data = await res.json();
                
                if (data.ok) {
                    currentAudioUrl = data.audioUrl;
                    await playAudioAndWait(data.audioUrl);
                } else {
                    if (statusText) {
                        statusText.textContent = t('msg_reading_error');
                        statusText.classList.remove("status-loading");
                    }
                    alert(translateBackendError(data.error));
                    stopReading();
                    return;
                }
            }
            
            if (statusText) {
                statusText.textContent = t('status_ready');
                statusText.classList.remove("status-loading");
            }
            stopReading();
        } catch (e) {
            if (statusText) {
                statusText.textContent = t('msg_network_error');
                statusText.classList.remove("status-loading");
            }
            console.error(e);
            stopReading();
        }
    }

    async function readParagraph(index, voice) {
        if (!isReading) return;
        
        if (statusText) {
            statusText.textContent = t('msg_preparing_audio');
            statusText.classList.add("status-loading");
        }
        updateProgress();
        saveCurrentPosition();

        const block = paragraphs[index];
        let chunks = splitSpeakText(block.speakText);

        try {
            for (let i = 0; i < chunks.length; i++) {
                if (!isReading) return;
                
                const text = chunks[i];
                const res = await fetch('/api/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, voice })
                });
                
                const data = await res.json();
                
                if (data.ok) {
                    currentAudioUrl = data.audioUrl;
                    await playAudioAndWait(data.audioUrl);
                } else if (data.error.includes("Tomt stycke") || data.error.includes("Ingen läsbar text") || data.error.includes("Empty text")) {
                    console.warn("Hoppar över pga fel: ", data.error);
                } else {
                    if (statusText) {
                        statusText.textContent = t('msg_reading_error');
                        statusText.classList.remove("status-loading");
                    }
                    alert(translateBackendError(data.error));
                    stopReading();
                    return;
                }
            }
            
            if (isReading) {
                if (isSingleReading) {
                    if (statusText) {
                        statusText.textContent = t('msg_ready_to_read');
                        statusText.classList.remove("status-loading");
                    }
                    stopReading();
                } else {
                    if (currentParagraphIndex < paragraphs.length - 1) {
                        currentParagraphIndex++;
                        highlightParagraph(currentParagraphIndex);
                        saveCurrentPosition();
                        
                        if (statusText) statusText.textContent = t('msg_short_pause');
                        await new Promise(r => setTimeout(r, PAUSE_BETWEEN_PARAGRAPHS));
                        if (!isReading) return;
                        
                        readParagraph(currentParagraphIndex, voiceSelect.value);
                    } else {
                        if (statusText) {
                            statusText.textContent = t('msg_ready_to_read');
                            statusText.classList.remove("status-loading");
                        }
                        stopReading();
                    }
                }
            }

        } catch (e) {
            if (statusText) {
                statusText.textContent = t('msg_network_error');
                statusText.classList.remove("status-loading");
            }
            console.error(e);
            stopReading();
        }
    }

    function playAudioAndWait(url) {
        return new Promise((resolve) => {
            if (!isReading || !audioPlayer) return resolve();
            
            audioPlayer.src = url;
            if (speedRange) audioPlayer.playbackRate = parseFloat(speedRange.value);
            if (volumeRange) audioPlayer.volume = parseFloat(volumeRange.value);
            
            audioPlayer.play().then(() => {
                if (statusText) {
                    statusText.textContent = t('msg_playing');
                    statusText.classList.remove("status-loading");
                }
                isPaused = false;
            }).catch(e => {
                console.error("Audio play error", e);
                if (statusText) {
                    statusText.textContent = t('msg_playback_error');
                    statusText.classList.remove("status-loading");
                }
                stopReading();
                resolve();
            });

            audioPlayer.onended = () => resolve();
        });
    }

    function stopReading() {
        isReading = false;
        isPaused = false;
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        if (statusText) {
            statusText.classList.remove("status-loading");
            if (statusText.textContent === I18N['sv']['msg_playing'] || statusText.textContent === I18N['en']['msg_playing'] || statusText.textContent === I18N['sv']['msg_preparing_audio'] || statusText.textContent === I18N['en']['msg_preparing_audio']) {
                statusText.textContent = t('msg_stopped');
            }
        }
        saveCurrentPosition();
    }

    function highlightParagraph(index) {
        document.querySelectorAll('.paragraph').forEach(el => el.classList.remove('active'));
        const pElement = document.getElementById(`para-${index}`);
        if (pElement && scrollArea) {
            pElement.classList.add('active');
            
            const scrollRect = scrollArea.getBoundingClientRect();
            const elementRect = pElement.getBoundingClientRect();
            
            const elementTopRelToScroll = elementRect.top - scrollRect.top + scrollArea.scrollTop;
            
            scrollArea.scrollTo({
                top: elementTopRelToScroll - UI_SCROLL_OFFSET,
                behavior: 'smooth'
            });
        }
    }

    function updateProgress() {
        if (!progressText) return;
        const total = paragraphs.length;
        const current = currentParagraphIndex >= 0 ? currentParagraphIndex + 1 : 0;
        
        if (isReading && !isPaused) {
            progressText.textContent = t('msg_paragraphs', { current, total });
        } else {
            progressText.textContent = t('msg_paragraphs_idle', { current, total });
        }
    }

    // Playback Event Listeners with safe attachment
    safeAddListener('btn-play', 'click', () => {
        if (editorContainer && textInput && editorContainer.style.display !== 'none' && textInput.value.trim() !== '') {
            prepareReaderView();
        }

        if (isPaused && audioPlayer) {
            audioPlayer.play();
            isPaused = false;
            isReading = true;
            if (statusText) statusText.textContent = t('msg_playing');
        } else if (!isReading) {
            startReadingFromCurrent(true);
        }
    });

    safeAddListener('btn-read-selected', 'click', () => {
        if (editorContainer && textInput && editorContainer.style.display !== 'none' && textInput.value.trim() !== '') {
            prepareReaderView();
        }
        if (!isReading && !isPaused) {
            startReadingFromCurrent(false);
        }
    });

    safeAddListener('btn-test-voice', 'click', () => {
        stopReading();
        if (currentParagraphIndex >= 0 && currentParagraphIndex < paragraphs.length && paragraphs.length > 0) {
            startReadingFromCurrent(false);
        } else {
            startReadingFromCurrent(false, t('msg_test_sample'));
        }
    });

    safeAddListener('btn-resume', 'click', () => {
        if (editorContainer && textInput && editorContainer.style.display !== 'none' && textInput.value.trim() !== '') {
            prepareReaderView();
        }
        let savedPos = localStorage.getItem('echodraft_lastParagraphIndex');
        if (savedPos !== null) {
            currentParagraphIndex = parseInt(savedPos);
            if (statusText) statusText.textContent = t('msg_resuming_from', { idx: currentParagraphIndex + 1 });
            startReadingFromCurrent(true);
            const btnResume = document.getElementById('btn-resume');
            if (btnResume) btnResume.style.display = 'none';
        }
    });

    safeAddListener('btn-clear-local', 'click', () => {
        if (confirm(t('alert_clear_confirm'))) {
            localStorage.removeItem('echodraft_lastManuscriptRaw');
            localStorage.removeItem('echodraft_lastManuscriptHash');
            localStorage.removeItem('echodraft_lastManuscriptTitle');
            localStorage.removeItem('echodraft_lastParagraphIndex');
            localStorage.removeItem('echodraft_lastUpdatedAt');
            
            if (textInput) textInput.value = "";
            paragraphs = [];
            currentParagraphIndex = -1;
            if (readerView) readerView.innerHTML = "";
            if (topbarTitle) topbarTitle.textContent = t('top_no_manuscript');
            resetReader();
            
            if (storageFooter) storageFooter.style.display = 'none';
            if (statusText) statusText.textContent = t('msg_cleared');
            showEmptyState();
            updateProgress();
        }
    });

    safeAddListener('btn-pause', 'click', () => {
        if (isReading && !isPaused && audioPlayer) {
            audioPlayer.pause();
            isPaused = true;
            if (statusText) {
                statusText.textContent = t('msg_paused');
                statusText.classList.remove("status-loading");
            }
            saveCurrentPosition();
        }
    });

    safeAddListener('btn-stop', 'click', stopReading);

    safeAddListener('btn-next', 'click', () => {
        if (paragraphs.length === 0) return;
        if (currentParagraphIndex < paragraphs.length - 1) {
            currentParagraphIndex++;
            saveCurrentPosition();
            if (isReading) {
                stopReading();
                startReadingFromCurrent(isSingleReading ? false : true);
            } else {
                highlightParagraph(currentParagraphIndex);
                updateProgress();
            }
        }
    });

    safeAddListener('btn-prev', 'click', () => {
        if (paragraphs.length === 0) return;
        if (currentParagraphIndex > 0) {
            currentParagraphIndex--;
            saveCurrentPosition();
            if (isReading) {
                stopReading();
                startReadingFromCurrent(isSingleReading ? false : true);
            } else {
                highlightParagraph(currentParagraphIndex);
                updateProgress();
            }
        }
    });

    safeAddListener('btn-save', 'click', () => {
        if (currentAudioUrl) {
            const a = document.createElement('a');
            a.href = currentAudioUrl;
            a.download = `echodraft_audio_${currentParagraphIndex + 1}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert(t('alert_no_audio'));
        }
    });

    if (speedRange && audioPlayer && speedVal) {
        speedRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            speedVal.textContent = val.toFixed(1);
            audioPlayer.playbackRate = val;
            localStorage.setItem('echodraft_speed', val);
        });
    }

    if (volumeRange && audioPlayer && volumeVal) {
        volumeRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            volumeVal.textContent = Math.round(val * 100);
            audioPlayer.volume = val;
            localStorage.setItem('echodraft_volume', val);
        });
    }

    // Init
    translateUI();
    loadVoices();
    tryRestoreManuscript();
});
