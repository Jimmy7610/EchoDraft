# EchoDraft v0.2.0

EchoDraft är byggd av Jimmy Eliasson som ett lokalt författarverktyg för svensk/engelsk manusuppläsning.

## Funktioner
- **Läser upp Markdown/manus:** Klistra in text eller öppna `.md` och `.txt`-filer.
- **Använder lokala Piper-röster:** Blixtsnabb text-till-tal direkt på din dator.
- **Fungerar utan moln-TTS:** Din text skickas inte till molnet. Ingen API-nyckel behövs.
- **Har SV/EN-gränssnitt:** Stöd för både svenskt och engelskt användargränssnitt.
- **Sparar senaste manus lokalt i webbläsaren:** Stäng fliken och fortsätt precis där du slutade, utan databas.
- **Exportera ljud (Nytt i v0.2.0):** Spara markerade stycken som WAV-filer eller hela manuskript som ZIP-arkiv för användning i andra program.

## Snabbstart
1. Dubbelklicka på `setup.bat` (endast första gången). Detta skapar en lokal Python-miljö och installerar beroenden (t.ex. `flask`).
2. Dubbelklicka på `run.bat` för att starta servern och öppna appen i din standardwebbläsare.
3. Om webbläsaren inte öppnas automatiskt, surfa till http://127.0.0.1:5000.

## Piper-installation
EchoDraft drivs av [Piper TTS](https://github.com/rhasspy/piper).
1. Ladda ner Piper-programvaran för Windows (från Pipers GitHub).
2. Packa upp och placera `piper.exe` och **alla tillhörande runtime-filer/DLL:er** inuti mappen `tools/piper/`.

## Röstinstallation
1. Ladda ner valfria `.onnx` och `.onnx.json`-röstfiler.
2. Placera filerna i mappen `voices/`.
3. Exempel på filer som ska ligga bredvid varandra:
   - `sv_SE-alma-medium.onnx`
   - `sv_SE-alma-medium.onnx.json`

## Integritet (Privacy)
- Manus sparas enbart lokalt i din webbläsare via `localStorage`.
- Ingen text skickas till molnet eller någon extern tjänst.
- Piper-motorn körs helt lokalt på din maskin.

## Exportera ljud / Export audio
EchoDraft v0.2.0 stöder export av ljudfiler:
- **Markerat stycke:** Klicka på ett stycke och välj "Markerat" i Export-menyn för att ladda ner en `.wav`-fil.
- **Hela manuset:** Välj "Manus (ZIP)" för att generera ett ZIP-arkiv med numrerade ljudfiler för varje stycke.
- Exporterna genereras helt lokalt och sparas tillfälligt i mappen `data/exports/`. Dessa filer inkluderas inte i Git.

## Språk (Language)
- UI supports Swedish and English.
- The UI language is saved locally in the browser.
- Voice language depends entirely on the installed Piper voices.
- Swedish and English voices can be used freely together.

## Felsökning (Troubleshooting)
- **Inga röster hittades:** Kontrollera att `.onnx` och `.onnx.json`-filerna ligger i `voices/`.
- **Piper hittades inte:** Kontrollera att `piper.exe` ligger i `tools/piper/`.
- **Ingen ljuduppspelning:** Kontrollera att din dators ljud är påslaget och att du inte har tystat fliken. Kika även i terminalen för eventuella felmeddelanden.
- **Flask saknas:** Kör `setup.bat` igen.
- **Konstigt beteende i gränssnittet:** Prova att trycka F5 för att ladda om cachen.

## Version
v0.2.0
