# Piper TTS

Den här mappen ska innehålla Piper för Windows. EchoDraft använder piper.exe för att generera röst lokalt utan python-paket.

## Installation

1. Gå till Pipers [Releases-sida på Github](https://github.com/rhasspy/piper/releases).
2. Ladda ner den senaste versionen för Windows (filen heter oftast `piper_windows_amd64.tar.gz` eller liknande zip-format).
3. Extrahera arkivet.
4. Kopiera **hela innehållet** från mappen du just extraherade (inklusive `piper.exe` och eventuella `.dll`-filer eller andra tillbehör).
5. Klistra in allt här i mappen `tools/piper/`.

När du är klar ska sökvägen `tools/piper/piper.exe` existera.
