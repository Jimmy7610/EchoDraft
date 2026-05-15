# Installera Piper och röster

EchoDraft använder Piper TTS för att syntetisera tal. Du måste manuellt ladda ner både själva programmet Piper och röstmodellerna. Python-beroenden installeras automatiskt av `setup.bat`, men Piper är numera ett separat, lokalt Windows-program (`piper.exe`).

## 1. Ladda ner programmet Piper
1. Gå till Pipers [Releases-sida på Github](https://github.com/rhasspy/piper/releases).
2. Ladda ner den senaste versionen för Windows (ofta en fil som slutar på `windows_amd64.tar.gz` eller `.zip`).
3. Packa upp filen du laddade ner.
4. Kopiera **alla** filer (inklusive `piper.exe` och eventuella andra mappar/.dll-filer) till mappen `tools/piper/` i din EchoDraft-installation.

## 2. Ladda ner Alma (sv_SE)
Den svenska rösten "Alma" är en högkvalitativ, lokal röst.

1. Gå till Pipers officiella röstkatalog (via Hugging Face eller Github):
   - [Hugging Face Piper Voices (sv_SE)](https://huggingface.co/rhasspy/piper-voices/tree/main/sv/sv_SE)
2. Navigera till `alma/medium/`
3. Ladda ner följande två filer:
   - `sv_SE-alma-medium.onnx`
   - `sv_SE-alma-medium.onnx.json`
4. Flytta båda filerna till `voices/` mappen i din EchoDraft-installation.

När du har gjort detta:
1. Pipers programfiler ska ligga i `tools/piper/`
2. Röstfilerna ska ligga i `voices/`
3. Starta om EchoDraft så kommer rösten att dyka upp i menyn!
