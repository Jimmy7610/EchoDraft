# Felsökning

### "Ingen svensk Piper-röst hittades" visas i gränssnittet
Detta betyder att appen inte kunde hitta några `.onnx`-filer (eller deras .json-filer) i mappen `voices/`.
- Lösning: Se [setup-piper.md](setup-piper.md) för att ladda ner röster.

### "Ett fel uppstod vid uppläsning med Piper"
Om uppläsningen misslyckas:
1. Kontrollera kommandotolken (svarta fönstret som öppnades av run.bat). Där skrivs eventuella kritiska fel ut.
2. Säkerställ att du inte har döpt om .json-filen. Om din röst heter `min_rost.onnx` måste konfigurationsfilen heta `min_rost.onnx.json`!
3. Säkerställ att texten inte är tom eller bara innehåller markdown-symboler (som appen rensar bort).

### Appen startar inte alls (run.bat kraschar)
1. Kontrollera att du körde `setup.bat` först.
2. Kontrollera att du har Python 3.8 eller nyare installerat och tillagt i din Windows PATH.
3. Du kan testa att manuellt öppna en kommandotolk, gå till EchoDraft-mappen och skriva:
   `python app.py` för att se vad felet är.
