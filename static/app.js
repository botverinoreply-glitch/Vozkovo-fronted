const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const voiceSearch = document.getElementById('voiceSearch');
const voiceSelect = document.getElementById('voiceSelect');
const languageFilter = document.getElementById('languageFilter');
const voiceCount = document.getElementById('voiceCount');
const voiceNote = document.getElementById('voiceNote');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const generateBtn = document.getElementById('generateBtn');
const generateLabel = document.getElementById('generateLabel');
const progressPanel = document.getElementById('progressPanel');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressBar = document.getElementById('progressBar');
const progressDetail = document.getElementById('progressDetail');
const resultPanel = document.getElementById('resultPanel');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const errorBox = document.getElementById('errorBox');
const uiLanguage = document.getElementById('uiLanguage');
const libraryPanel = document.getElementById('libraryPanel');
const libraryList = document.getElementById('libraryList');
const libraryEmpty = document.getElementById('libraryEmpty');
const libraryCount = document.getElementById('libraryCount');
const libraryStatus = document.getElementById('libraryStatus');
const voiceCacheKey = 'vozkovo-voices-cache-v1';
const selectedVoiceKey = 'vozkovo-selected-voice';
const libraryObjectUrls = new Set();
const API_BASE_URL = String(window.VOZKOVO_CONFIG?.API_BASE_URL || '').replace(/\\/+$/, '');
const apiUrl = path => `${API_BASE_URL}${path}`;

const translations = {
  es: {
    pageTitle: 'VozKovo — Texto a voz', brandHome: 'VozKovo inicio', generatorLabel: 'Generador de voz', pageDescription: 'Convierte texto en voz y descarga tu audio en MP3.',
    languageLabel: 'Idioma de la web', status: 'Texto a voz', eyebrow: 'CONVIERTE TUS PALABRAS EN AUDIO', heroTitle: 'Tu texto.', heroAccent: 'Una voz natural.',
    heroCopy: 'Escribe, elige una voz y descarga el resultado en MP3.',
    textStep: '01 / TEXTO', textHeading: '¿Qué quieres que diga?', clearText: 'Limpiar texto', placeholder: 'Escribe o pega aquí tu texto...\n\nPuedes añadir párrafos largos. El texto se procesa automáticamente por fragmentos.',
    characters: 'caracteres', character: 'carácter', noLimit: 'Hasta 10.000 caracteres por generación', voiceStep: '02 / VOZ', voiceHeading: 'Elige cómo debe sonar', loadingVoices: 'Cargando voces…',
    searchVoice: 'BUSCAR VOZ', searchPlaceholder: 'Buscar por nombre o idioma…', voiceLanguage: 'IDIOMA', allLanguages: 'Todos los idiomas', spanish: 'Español', voiceLabel: 'VOZ',
    noVoicesFound: 'No se encontraron voces', selectedVoice: 'Voz seleccionada:', voiceCount: '{shown} de {total} voces', voicesUnavailable: 'No disponibles',
    settingsStep: '03 / AJUSTES', speedHeading: 'Velocidad de lectura', slower: 'Más lento', faster: 'Más rápido', normal: 'Normal',
    generate: 'Generar voz', generating: 'Generando audio…', generateHint: 'El audio se genera en el servidor y se descarga como archivo MP3.',
    resultTitle: 'Tu voz está lista', resultSubtitle: 'Reproduce el audio o guarda el MP3.', download: 'Descargar MP3',
    preparing: 'Preparando tu voz…', sending: 'Enviando el texto al generador de voz.', queued: 'En cola…', queuedDetail: 'Tu audio empezará a generarse en cuanto el servidor esté libre.',
    processing: 'Generando tu voz…', chunksPreparing: 'Preparando los fragmentos de audio.', chunk: 'Fragmento {done} de {total}.', processingChunks: 'Procesando el texto por partes.',
    emptyText: 'Escribe o pega un texto antes de generar la voz.', selectVoice: 'Selecciona una voz disponible.', startFailed: 'No se pudo iniciar la generación.',
    progressFailed: 'No se pudo consultar el progreso.', generateFailed: 'No se pudo generar el audio.', connectionError: 'Ha ocurrido un error de conexión.',
    voiceLoadFailed: 'No se pudo cargar la lista de voces. Recarga la página para intentarlo de nuevo.', emptyCatalog: 'El catálogo de voces está vacío.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> HECHO PARA DAR VOZ A TUS IDEAS', footerNote: 'Los límites reales dependen del servicio de voz y del servidor donde se despliegue.'
  },
  en: {
    pageTitle: 'VozKovo — Text to speech', brandHome: 'VozKovo home', generatorLabel: 'Text to speech generator', pageDescription: 'Turn text into speech and download your audio as an MP3.',
    languageLabel: 'Website language', status: 'Text to speech', eyebrow: 'TURN YOUR WORDS INTO AUDIO', heroTitle: 'Your text.', heroAccent: 'A natural voice.',
    heroCopy: 'Write, choose a voice and download the result as an MP3.',
    textStep: '01 / TEXT', textHeading: 'What would you like it to say?', clearText: 'Clear text', placeholder: 'Type or paste your text here...\n\nLong paragraphs are welcome. Text is processed automatically in chunks.',
    characters: 'characters', character: 'character', noLimit: 'Up to 10,000 characters per generation', voiceStep: '02 / VOICE', voiceHeading: 'Choose how it should sound', loadingVoices: 'Loading voices…',
    searchVoice: 'SEARCH VOICE', searchPlaceholder: 'Search by name or language…', voiceLanguage: 'LANGUAGE', allLanguages: 'All languages', spanish: 'Spanish', voiceLabel: 'VOICE',
    noVoicesFound: 'No voices found', selectedVoice: 'Selected voice:', voiceCount: '{shown} of {total} voices', voicesUnavailable: 'Unavailable',
    settingsStep: '03 / SETTINGS', speedHeading: 'Reading speed', slower: 'Slower', faster: 'Faster', normal: 'Normal',
    generate: 'Generate voice', generating: 'Generating audio…', generateHint: 'Audio is generated on the server and downloaded as an MP3 file.',
    resultTitle: 'Your voice is ready', resultSubtitle: 'Play the audio or save the MP3.', download: 'Download MP3',
    preparing: 'Preparing your voice…', sending: 'Sending text to the voice generator.', queued: 'In queue…', queuedDetail: 'Your audio will start as soon as the server is available.',
    processing: 'Generating your voice…', chunksPreparing: 'Preparing audio chunks.', chunk: 'Chunk {done} of {total}.', processingChunks: 'Processing the text in chunks.',
    emptyText: 'Type or paste some text before generating the voice.', selectVoice: 'Choose an available voice.', startFailed: 'Could not start generation.',
    progressFailed: 'Could not check the progress.', generateFailed: 'Could not generate the audio.', connectionError: 'A connection error occurred.',
    voiceLoadFailed: 'Could not load the voice list. Refresh the page to try again.', emptyCatalog: 'The voice catalogue is empty.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> MADE TO GIVE YOUR IDEAS A VOICE', footerNote: 'Actual limits depend on the speech service and the server hosting the app.'
  },
  fr: {
    pageTitle: 'VozKovo — Synthèse vocale', brandHome: 'Accueil VozKovo', generatorLabel: 'Générateur vocal', pageDescription: 'Convertissez du texte en voix et téléchargez votre audio au format MP3.',
    languageLabel: 'Langue du site', status: 'Synthèse vocale', eyebrow: 'TRANSFORMEZ VOS MOTS EN AUDIO', heroTitle: 'Votre texte.', heroAccent: 'Une voix naturelle.',
    heroCopy: 'Écrivez, choisissez une voix et téléchargez le résultat en MP3.',
    textStep: '01 / TEXTE', textHeading: 'Que voulez-vous faire dire ?', clearText: 'Effacer le texte', placeholder: 'Saisissez ou collez votre texte ici...\n\nVous pouvez ajouter de longs paragraphes. Le texte est traité automatiquement par segments.',
    characters: 'caractères', character: 'caractère', noLimit: 'Jusqu’à 10 000 caractères par génération', voiceStep: '02 / VOIX', voiceHeading: 'Choisissez le rendu vocal', loadingVoices: 'Chargement des voix…',
    searchVoice: 'RECHERCHER UNE VOIX', searchPlaceholder: 'Rechercher par nom ou langue…', voiceLanguage: 'LANGUE', allLanguages: 'Toutes les langues', spanish: 'Espagnol', voiceLabel: 'VOIX',
    noVoicesFound: 'Aucune voix trouvée', selectedVoice: 'Voix sélectionnée :', voiceCount: '{shown} sur {total} voix', voicesUnavailable: 'Indisponibles',
    settingsStep: '03 / RÉGLAGES', speedHeading: 'Vitesse de lecture', slower: 'Plus lent', faster: 'Plus rapide', normal: 'Normal',
    generate: 'Générer la voix', generating: 'Génération de l’audio…', generateHint: 'L’audio est généré sur le serveur puis téléchargé au format MP3.',
    resultTitle: 'Votre voix est prête', resultSubtitle: 'Écoutez l’audio ou enregistrez le MP3.', download: 'Télécharger le MP3',
    preparing: 'Préparation de votre voix…', sending: 'Envoi du texte au générateur vocal.', queued: 'En file d’attente…', queuedDetail: 'La génération commencera dès que le serveur sera disponible.',
    processing: 'Génération de votre voix…', chunksPreparing: 'Préparation des segments audio.', chunk: 'Segment {done} sur {total}.', processingChunks: 'Traitement du texte par segments.',
    emptyText: 'Saisissez ou collez un texte avant de générer la voix.', selectVoice: 'Sélectionnez une voix disponible.', startFailed: 'Impossible de démarrer la génération.',
    progressFailed: 'Impossible de vérifier la progression.', generateFailed: 'Impossible de générer l’audio.', connectionError: 'Une erreur de connexion est survenue.',
    voiceLoadFailed: 'Impossible de charger la liste des voix. Actualisez la page pour réessayer.', emptyCatalog: 'Le catalogue de voix est vide.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> POUR DONNER UNE VOIX À VOS IDÉES', footerNote: 'Les limites réelles dépendent du service vocal et du serveur qui héberge l’application.'
  },
  de: {
    pageTitle: 'VozKovo — Text zu Sprache', brandHome: 'VozKovo Startseite', generatorLabel: 'Sprachgenerator', pageDescription: 'Wandle Text in Sprache um und lade dein Audio als MP3 herunter.',
    languageLabel: 'Sprache der Website', status: 'Text zu Sprache', eyebrow: 'VERWANDELE DEINE WORTE IN AUDIO', heroTitle: 'Dein Text.', heroAccent: 'Eine natürliche Stimme.',
    heroCopy: 'Schreibe, wähle eine Stimme und lade das Ergebnis als MP3 herunter.',
    textStep: '01 / TEXT', textHeading: 'Was soll gesprochen werden?', clearText: 'Text löschen', placeholder: 'Schreibe oder füge deinen Text hier ein...\n\nAuch lange Absätze sind möglich. Der Text wird automatisch in Abschnitten verarbeitet.',
    characters: 'Zeichen', character: 'Zeichen', noLimit: 'Bis zu 10.000 Zeichen pro Generierung', voiceStep: '02 / STIMME', voiceHeading: 'Wähle den Klang', loadingVoices: 'Stimmen werden geladen…',
    searchVoice: 'STIMME SUCHEN', searchPlaceholder: 'Nach Name oder Sprache suchen…', voiceLanguage: 'SPRACHE', allLanguages: 'Alle Sprachen', spanish: 'Spanisch', voiceLabel: 'STIMME',
    noVoicesFound: 'Keine Stimmen gefunden', selectedVoice: 'Ausgewählte Stimme:', voiceCount: '{shown} von {total} Stimmen', voicesUnavailable: 'Nicht verfügbar',
    settingsStep: '03 / EINSTELLUNGEN', speedHeading: 'Lesegeschwindigkeit', slower: 'Langsamer', faster: 'Schneller', normal: 'Normal',
    generate: 'Stimme erzeugen', generating: 'Audio wird erzeugt…', generateHint: 'Das Audio wird auf dem Server erzeugt und als MP3 heruntergeladen.',
    resultTitle: 'Deine Stimme ist fertig', resultSubtitle: 'Spiele das Audio ab oder speichere die MP3.', download: 'MP3 herunterladen',
    preparing: 'Stimme wird vorbereitet…', sending: 'Text wird an den Sprachgenerator gesendet.', queued: 'In der Warteschlange…', queuedDetail: 'Die Erstellung beginnt, sobald der Server verfügbar ist.',
    processing: 'Stimme wird erzeugt…', chunksPreparing: 'Audioabschnitte werden vorbereitet.', chunk: 'Abschnitt {done} von {total}.', processingChunks: 'Text wird abschnittsweise verarbeitet.',
    emptyText: 'Gib Text ein oder füge ihn ein, bevor du die Stimme erzeugst.', selectVoice: 'Wähle eine verfügbare Stimme aus.', startFailed: 'Erstellung konnte nicht gestartet werden.',
    progressFailed: 'Fortschritt konnte nicht abgerufen werden.', generateFailed: 'Audio konnte nicht erzeugt werden.', connectionError: 'Ein Verbindungsfehler ist aufgetreten.',
    voiceLoadFailed: 'Stimmliste konnte nicht geladen werden. Lade die Seite neu und versuche es erneut.', emptyCatalog: 'Der Stimmenkatalog ist leer.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> DEINE IDEEN BEKOMMEN EINE STIMME', footerNote: 'Die tatsächlichen Grenzen hängen vom Sprachdienst und dem Server ab, auf dem die App läuft.'
  },
  it: {
    pageTitle: 'VozKovo — Da testo a voce', brandHome: 'Home VozKovo', generatorLabel: 'Generatore vocale', pageDescription: 'Converti il testo in voce e scarica l’audio in formato MP3.',
    languageLabel: 'Lingua del sito', status: 'Da testo a voce', eyebrow: 'TRASFORMA LE TUE PAROLE IN AUDIO', heroTitle: 'Il tuo testo.', heroAccent: 'Una voce naturale.',
    heroCopy: 'Scrivi, scegli una voce e scarica il risultato in MP3.',
    textStep: '01 / TESTO', textHeading: 'Che cosa vuoi far dire?', clearText: 'Cancella testo', placeholder: 'Scrivi o incolla qui il testo...\n\nPuoi inserire anche paragrafi lunghi. Il testo viene elaborato automaticamente a blocchi.',
    characters: 'caratteri', character: 'carattere', noLimit: 'Fino a 10.000 Zeichen pro generazione', voiceStep: '02 / VOCE', voiceHeading: 'Scegli come deve suonare', loadingVoices: 'Caricamento voci…',
    searchVoice: 'CERCA VOCE', searchPlaceholder: 'Cerca per nome o lingua…', voiceLanguage: 'LINGUA', allLanguages: 'Tutte le lingue', spanish: 'Spagnolo', voiceLabel: 'VOCE',
    noVoicesFound: 'Nessuna voce trovata', selectedVoice: 'Voce selezionata:', voiceCount: '{shown} di {total} voci', voicesUnavailable: 'Non disponibili',
    settingsStep: '03 / IMPOSTAZIONI', speedHeading: 'Velocità di lettura', slower: 'Più lento', faster: 'Più veloce', normal: 'Normale',
    generate: 'Genera voce', generating: 'Generazione audio…', generateHint: 'L’audio viene generato sul server e scaricato come file MP3.',
    resultTitle: 'La tua voce è pronta', resultSubtitle: 'Riproduci l’audio o salva il file MP3.', download: 'Scarica MP3',
    preparing: 'Preparazione della voce…', sending: 'Invio del testo al generatore vocale.', queued: 'In coda…', queuedDetail: 'La generazione inizierà appena il server sarà disponibile.',
    processing: 'Generazione della voce…', chunksPreparing: 'Preparazione dei segmenti audio.', chunk: 'Segmento {done} di {total}.', processingChunks: 'Elaborazione del testo in blocchi.',
    emptyText: 'Scrivi o incolla un testo prima di generare la voce.', selectVoice: 'Seleziona una voce disponibile.', startFailed: 'Impossibile avviare la generazione.',
    progressFailed: 'Impossibile controllare l’avanzamento.', generateFailed: 'Impossibile generare l’audio.', connectionError: 'Si è verificato un errore di connessione.',
    voiceLoadFailed: 'Impossibile caricare l’elenco delle voci. Ricarica la pagina per riprovare.', emptyCatalog: 'Il catalogo delle voci è vuoto.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> PER DARE VOCE ALLE TUE IDEE', footerNote: 'I limiti effettivi dipendono dal servizio vocale e dal server che ospita l’app.'
  },
  pt: {
    pageTitle: 'VozKovo — Texto para voz', brandHome: 'Início do VozKovo', generatorLabel: 'Gerador de voz', pageDescription: 'Converta texto em voz e transfira o áudio em MP3.',
    languageLabel: 'Idioma do site', status: 'Texto para voz', eyebrow: 'TRANSFORME AS SUAS PALAVRAS EM ÁUDIO', heroTitle: 'O seu texto.', heroAccent: 'Uma voz natural.',
    heroCopy: 'Escreva, escolha entre centenas de vozes e transfira o resultado em MP3. Não precisa de chaves API.',
    textStep: '01 / TEXTO', textHeading: 'O que pretende que seja dito?', clearText: 'Limpar texto', placeholder: 'Escreva ou cole o seu texto aqui...\n\nPode adicionar parágrafos longos. O texto é processado automaticamente por partes.',
    characters: 'caracteres', character: 'carácter', noLimit: 'Até 10.000 caracteres por geração', voiceStep: '02 / VOZ', voiceHeading: 'Escolha como deve soar', loadingVoices: 'A carregar vozes…',
    searchVoice: 'PESQUISAR VOZ', searchPlaceholder: 'Pesquisar por nome ou idioma…', voiceLanguage: 'IDIOMA', allLanguages: 'Todos os idiomas', spanish: 'Espanhol', voiceLabel: 'VOZ',
    noVoicesFound: 'Não foram encontradas vozes', selectedVoice: 'Voz selecionada:', voiceCount: '{shown} de {total} vozes', voicesUnavailable: 'Indisponíveis',
    settingsStep: '03 / DEFINIÇÕES', speedHeading: 'Velocidade de leitura', slower: 'Mais lento', faster: 'Mais rápido', normal: 'Normal',
    generate: 'Gerar voz', generating: 'A gerar áudio…', generateHint: 'O áudio é gerado no servidor e transferido como ficheiro MP3.',
    resultTitle: 'A sua voz está pronta', resultSubtitle: 'Reproduza o áudio ou guarde o MP3.', download: 'Transferir MP3',
    preparing: 'A preparar a sua voz…', sending: 'A enviar o texto para o gerador de voz.', queued: 'Em fila…', queuedDetail: 'O áudio começará a ser gerado assim que o servidor estiver disponível.',
    processing: 'A gerar a sua voz…', chunksPreparing: 'A preparar os segmentos de áudio.', chunk: 'Segmento {done} de {total}.', processingChunks: 'A processar o texto por partes.',
    emptyText: 'Escreva ou cole um texto antes de gerar a voz.', selectVoice: 'Selecione uma voz disponível.', startFailed: 'Não foi possível iniciar a geração.',
    progressFailed: 'Não foi possível consultar o progresso.', generateFailed: 'Não foi possível gerar o áudio.', connectionError: 'Ocorreu um erro de ligação.',
    voiceLoadFailed: 'Não foi possível carregar a lista de vozes. Atualize a página para tentar novamente.', emptyCatalog: 'O catálogo de vozes está vazio.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> PARA DAR VOZ ÀS SUAS IDEIAS', footerNote: 'Os limites reais dependem do serviço de voz e do servidor onde a aplicação está alojada.'
  },
  nl: {
    pageTitle: 'VozKovo — Tekst naar spraak', brandHome: 'VozKovo home', generatorLabel: 'Spraakgenerator', pageDescription: 'Zet tekst om in spraak en download je audio als MP3.',
    languageLabel: 'Websitet taal', status: 'Tekst naar spraak', eyebrow: 'MAAK AUDIO VAN JE WOORDEN', heroTitle: 'Jouw tekst.', heroAccent: 'Een natuurlijke stem.',
    heroCopy: 'Schrijf, kies een stem en download het resultaat als MP3.',
    textStep: '01 / TEKST', textHeading: 'Wat moet er worden uitgesproken?', clearText: 'Tekst wissen', placeholder: 'Typ of plak hier je tekst...\n\nLange alinea’s zijn welkom. De tekst wordt automatisch in delen verwerkt.',
    characters: 'tekens', character: 'teken', noLimit: 'Tot 10.000 tekens per generatie', voiceStep: '02 / STEM', voiceHeading: 'Kies hoe het moet klinken', loadingVoices: 'Stemmen laden…',
    searchVoice: 'STEM ZOEKEN', searchPlaceholder: 'Zoek op naam of taal…', voiceLanguage: 'TAAL', allLanguages: 'Alle talen', spanish: 'Spaans', voiceLabel: 'STEM',
    noVoicesFound: 'Geen stemmen gevonden', selectedVoice: 'Geselecteerde stem:', voiceCount: '{shown} van {total} stemmen', voicesUnavailable: 'Niet beschikbaar',
    settingsStep: '03 / INSTELLINGEN', speedHeading: 'Leessnelheid', slower: 'Langzamer', faster: 'Sneller', normal: 'Normaal',
    generate: 'Stem genereren', generating: 'Audio genereren…', generateHint: 'De audio wordt op de server gemaakt en als MP3-bestand gedownload.',
    resultTitle: 'Je stem is klaar', resultSubtitle: 'Speel de audio af of sla de MP3 op.', download: 'MP3 downloaden',
    preparing: 'Je stem voorbereiden…', sending: 'Tekst naar de stemgenerator verzenden.', queued: 'In de wachtrij…', queuedDetail: 'De audio wordt gemaakt zodra de server beschikbaar is.',
    processing: 'Je stem genereren…', chunksPreparing: 'Audiofragmenten voorbereiden.', chunk: 'Fragment {done} van {total}.', processingChunks: 'De tekst in delen verwerken.',
    emptyText: 'Typ of plak eerst tekst voordat je de stem genereert.', selectVoice: 'Selecteer een beschikbare stem.', startFailed: 'Genereren kon niet worden gestart.',
    progressFailed: 'De voortgang kon niet worden opgehaald.', generateFailed: 'De audio kon niet worden gemaakt.', connectionError: 'Er is een verbindingsfout opgetreden.',
    voiceLoadFailed: 'De stemmenlijst kon niet worden geladen. Vernieuw de pagina en probeer het opnieuw.', emptyCatalog: 'De stemmencatalogus is leeg.',
    footerBrand: 'VOZKOVO <span class="footer-dot">•</span> GEEF JE IDEEËN EEN STEM', footerNote: 'De werkelijke limieten zijn afhankelijk van de spraakdienst en de server waarop de app wordt gehost.'
  }
};

const uiExtras = {
  es: {pauseHelp:'Las marcas de pausa todavía no están disponibles con el motor de audio actual.',libraryStep:'TU AUDIO',libraryTitle:'Audio guardado en este navegador',libraryInfo:'Los MP3 generados se guardan en este dispositivo hasta que los borres o elimines los datos del navegador.',libraryEmpty:'Tus audios generados aparecerán aquí automáticamente.',libraryCount:'{count} archivos',downloadSaved:'Descargar',deleteSaved:'Eliminar',docsLink:'Documentación',savedAt:'Guardado {date}',saveFailed:'El audio se generó, pero no se pudo guardar en el navegador.'},
  en: {pauseHelp:'Pause markers are not supported by the current audio engine yet.',libraryStep:'YOUR AUDIO',libraryTitle:'Saved audio in this browser',libraryInfo:'Generated MP3 files stay on this device until you delete them or clear browser data.',libraryEmpty:'Your generated audio will appear here automatically.',libraryCount:'{count} files',downloadSaved:'Download',deleteSaved:'Delete',docsLink:'Documentation',savedAt:'Saved {date}',saveFailed:'The audio was generated, but could not be saved in this browser.'},
  fr: {pauseHelp:'Les marqueurs de pause ne sont pas encore pris en charge par le moteur audio actuel.',libraryStep:'VOTRE AUDIO',libraryTitle:'Audio enregistré dans ce navigateur',libraryInfo:'Les MP3 générés restent sur cet appareil jusqu’à leur suppression ou à l’effacement des données du navigateur.',libraryEmpty:'Vos audios générés apparaîtront ici automatiquement.',libraryCount:'{count} fichiers',downloadSaved:'Télécharger',deleteSaved:'Supprimer',docsLink:'Documentation',savedAt:'Enregistré le {date}',saveFailed:'L’audio a été généré, mais n’a pas pu être enregistré dans ce navigateur.'},
  de: {pauseHelp:'Pausenmarkierungen werden vom aktuellen Audiomodell noch nicht unterstützt.',libraryStep:'DEIN AUDIO',libraryTitle:'In diesem Browser gespeicherte Audiodateien',libraryInfo:'Erstellte MP3-Dateien bleiben auf diesem Gerät, bis du sie löschst oder die Browserdaten entfernst.',libraryEmpty:'Deine erstellten Audiodateien erscheinen hier automatisch.',libraryCount:'{count} Dateien',downloadSaved:'Herunterladen',deleteSaved:'Löschen',docsLink:'Dokumentation',savedAt:'Gespeichert am {date}',saveFailed:'Das Audio wurde erstellt, konnte aber nicht in diesem Browser gespeichert werden.'},
  it: {pauseHelp:'I marcatori di pausa non sono ancora supportati dal motore audio attuale.',libraryStep:'IL TUO AUDIO',libraryTitle:'Audio salvati in questo browser',libraryInfo:'I file MP3 generati restano su questo dispositivo finché non li elimini o cancelli i dati del browser.',libraryEmpty:'Gli audio generati appariranno qui automaticamente.',libraryCount:'{count} file',downloadSaved:'Scarica',deleteSaved:'Elimina',docsLink:'Documentazione',savedAt:'Salvato il {date}',saveFailed:'L’audio è stato generato, ma non è stato possibile salvarlo in questo browser.'},
  pt: {pauseHelp:'As marcações de pausa ainda não são suportadas pelo motor de áudio atual.',libraryStep:'O SEU ÁUDIO',libraryTitle:'Áudio guardado neste navegador',libraryInfo:'Os MP3 gerados permanecem neste dispositivo até os apagar ou limpar os dados do navegador.',libraryEmpty:'Os seus áudios gerados aparecerão aqui automaticamente.',libraryCount:'{count} ficheiros',downloadSaved:'Transferir',deleteSaved:'Eliminar',docsLink:'Documentação',savedAt:'Guardado em {date}',saveFailed:'O áudio foi gerado, mas não foi possível guardá-lo neste navegador.'},
  nl: {pauseHelp:'Pauzemarkeringen worden nog niet ondersteund door de huidige audiomotor.',libraryStep:'JOUW AUDIO',libraryTitle:'Audio opgeslagen in deze browser',libraryInfo:'Gegenereerde MP3-bestanden blijven op dit apparaat totdat je ze verwijdert of browsergegevens wist.',libraryEmpty:'Je gegenereerde audio verschijnt hier automatisch.',libraryCount:'{count} bestanden',downloadSaved:'Downloaden',deleteSaved:'Verwijderen',docsLink:'Documentatie',savedAt:'Opgeslagen op {date}',saveFailed:'De audio is gegenereerd, maar kon niet in deze browser worden opgeslagen.'}
};

const supportedLanguages = Object.keys(translations);
const languageNames = {
  es: {es: 'Español', en: 'Inglés', fr: 'Francés', de: 'Alemán', it: 'Italiano', pt: 'Portugués', nl: 'Neerlandés'},
  en: {es: 'Spanish', en: 'English', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', nl: 'Dutch'},
  fr: {es: 'Espagnol', en: 'Anglais', fr: 'Français', de: 'Allemand', it: 'Italien', pt: 'Portugais', nl: 'Néerlandais'},
  de: {es: 'Spanisch', en: 'Englisch', fr: 'Französisch', de: 'Deutsch', it: 'Italienisch', pt: 'Portugiesisch', nl: 'Niederländisch'},
  it: {es: 'Spagnolo', en: 'Inglese', fr: 'Francese', de: 'Tedesco', it: 'Italiano', pt: 'Portoghese', nl: 'Olandese'},
  pt: {es: 'Espanhol', en: 'Inglês', fr: 'Francês', de: 'Alemão', it: 'Italiano', pt: 'Português', nl: 'Neerlandês'},
  nl: {es: 'Spaans', en: 'Engels', fr: 'Frans', de: 'Duits', it: 'Italiaans', pt: 'Portugees', nl: 'Nederlands'}
};

let currentLanguage = detectLanguage();
let allVoices = [];
let pollTimer = null;

function detectLanguage() {
  try {
    const saved = localStorage.getItem('vozkovo-language');
    if (saved && supportedLanguages.includes(saved)) return saved;
  } catch (_) { /* Storage may be disabled by the browser. */ }

  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  for (const preference of preferences) {
    const baseLanguage = String(preference).toLowerCase().split('-')[0].split('_')[0];
    if (supportedLanguages.includes(baseLanguage)) return baseLanguage;
  }
  return 'en';
}

function t(key, values = {}) {
  let result = translations[currentLanguage][key] ?? uiExtras[currentLanguage]?.[key] ?? translations.en[key] ?? uiExtras.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    result = result.replaceAll(`{${name}}`, String(value));
  }
  return result;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function applyTranslations() {
  const tr = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.title = tr.pageTitle;
  document.getElementById('brandLink').setAttribute('aria-label', tr.brandHome);
  document.querySelector('.workspace').setAttribute('aria-label', tr.generatorLabel);
  document.querySelector('meta[name="description"]')?.setAttribute('content', tr.pageDescription);
  uiLanguage.value = currentLanguage;
  uiLanguage.setAttribute('aria-label', tr.languageLabel);
  document.getElementById('uiLanguageLabel').textContent = tr.languageLabel;

  const textMap = {
    statusLabel: 'status', eyebrowText: 'eyebrow', heroTitle: 'heroTitle', heroAccent: 'heroAccent', heroCopy: 'heroCopy',
    textStep: 'textStep', textHeading: 'textHeading', clearTextLabel: 'clearText', noLimitText: 'noLimit', voiceStep: 'voiceStep',
    voiceHeading: 'voiceHeading', searchVoiceLabel: 'searchVoice', voiceLanguageLabel: 'voiceLanguage', voiceLabel: 'voiceLabel',
    settingsStep: 'settingsStep', speedHeading: 'speedHeading', slowerLabel: 'slower', fasterLabel: 'faster', generateHint: 'generateHint',
    resultTitle: 'resultTitle', resultSubtitle: 'resultSubtitle', downloadLabel: 'download', footerNote: 'footerNote',
    libraryStep: 'libraryStep', libraryTitle: 'libraryTitle', libraryInfo: 'libraryInfo', libraryEmpty: 'libraryEmpty',
    documentationLink: 'docsLink'
  };
  for (const [id, key] of Object.entries(textMap)) setText(id, t(key));

  document.getElementById('footerBrand').innerHTML = tr.footerBrand;
  setText('pauseHelp', t('pauseHelp'));
  textInput.placeholder = tr.placeholder;
  voiceSearch.placeholder = tr.searchPlaceholder;
  languageFilter.options[0].textContent = tr.allLanguages;
  if (allVoices.length) populateLanguageFilter();
  document.getElementById('speedRange').setAttribute('aria-label', tr.speedHeading);
  updateCount();
  updateSpeedLabel();
  updateGenerateLabel();
  renderVoices();
  renderAudioLibrary();
}

function setLanguage(language, save = true) {
  if (!supportedLanguages.includes(language)) language = 'en';
  currentLanguage = language;
  if (save) {
    try { localStorage.setItem('vozkovo-language', language); } catch (_) { /* Keep the choice for this session. */ }
  }
  applyTranslations();
}

function updateCount() {
  const count = textInput.value.length;
  const formatted = count.toLocaleString(currentLanguage);
  charCount.textContent = `${formatted} ${count === 1 ? t('character') : t('characters')}`;
}

function regionName(locale) {
  try {
    const region = new Intl.Locale(locale).region;
    if (!region) return locale;
    return new Intl.DisplayNames([currentLanguage], {type: 'region'}).of(region) || region;
  } catch (_) {
    return locale;
  }
}

function countryFlag(locale) {
  try {
    const region = new Intl.Locale(locale).region?.toUpperCase();
    if (region && /^[A-Z]{2}$/.test(region)) {
      return String.fromCodePoint(...[...region].map(letter => 127397 + letter.charCodeAt(0)));
    }
  } catch (_) { /* Some voice locales are not valid BCP 47 tags. */ }
  return '🔊';
}

function displayVoiceName(voice) {
  const locale = voice.locale || '';
  const gender = voice.gender === 'Male'
    ? ({es: 'Masculina', en: 'Male', fr: 'Masculine', de: 'Männlich', it: 'Maschile', pt: 'Masculina', nl: 'Mannelijk'}[currentLanguage])
    : voice.gender === 'Female'
      ? ({es: 'Femenina', en: 'Female', fr: 'Féminine', de: 'Weiblich', it: 'Femminile', pt: 'Feminina', nl: 'Vrouwelijk'}[currentLanguage])
      : '';
  const localizedName = voice.name || voice.id;
  const match = localizedName.match(/\(([^,]+),\s*([^)]+)\)/);
  const person = match ? match[2].replace(/Neural$/i, '') : voice.id.split('-').slice(-1)[0].replace(/Neural$/i, '');
  return `${person} · ${regionName(locale)}${gender ? ` · ${gender}` : ''}`;
}

function populateLanguageFilter() {
  const previous = languageFilter.value || 'all';
  const locales = [...new Set(allVoices.map(voice => (voice.locale || '').split('-')[0].toLowerCase()).filter(Boolean))];
  const displayNames = new Intl.DisplayNames([currentLanguage], {type: 'language'});
  languageFilter.replaceChildren(new Option(t('allLanguages'), 'all'));
  locales.sort((a, b) => displayNames.of(a).localeCompare(displayNames.of(b), currentLanguage));
  locales.forEach(code => languageFilter.add(new Option(displayNames.of(code) || code, code)));
  languageFilter.value = locales.includes(previous) ? previous : 'all';
}

function renderVoices() {
  if (!allVoices.length) return;
  const query = voiceSearch.value.trim().toLocaleLowerCase(currentLanguage);
  const language = languageFilter.value;
  const filtered = allVoices.filter(voice => {
    const matchesLanguage = language === 'all' || voice.locale.toLowerCase().startsWith(language);
    const haystack = `${voice.id} ${voice.name} ${voice.locale} ${voice.gender}`.toLocaleLowerCase(currentLanguage);
    return matchesLanguage && haystack.includes(query);
  });

  const previous = voiceSelect.value;
  voiceSelect.innerHTML = '';
  if (!filtered.length) {
    const option = document.createElement('option');
    option.textContent = t('noVoicesFound');
    option.value = '';
    voiceSelect.appendChild(option);
    voiceSelect.disabled = true;
  } else {
    voiceSelect.disabled = false;
    filtered.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.id;
      option.textContent = `${countryFlag(voice.locale)}  ${displayVoiceName(voice)}`;
      voiceSelect.appendChild(option);
    });
    const keep = filtered.some(voice => voice.id === previous) ? previous : filtered[0].id;
    voiceSelect.value = keep;
  }
  voiceCount.textContent = t('voiceCount', {
    shown: filtered.length.toLocaleString(currentLanguage),
    total: allVoices.length.toLocaleString(currentLanguage)
  });
  updateVoiceNote();
}

function updateVoiceNote() {
  const selected = allVoices.find(voice => voice.id === voiceSelect.value);
  if (!selected) return;
  const readable = displayVoiceName(selected).split(' · ')[0];
  voiceNote.replaceChildren();
  const icon = document.createElement('span');
  icon.className = 'voice-note-icon';
  icon.textContent = countryFlag(selected.locale);
  const note = document.createElement('span');
  note.append(`${t('selectedVoice')} `);
  const strong = document.createElement('strong');
  strong.textContent = readable;
  note.appendChild(strong);
  const locale = document.createElement('span');
  locale.style.color = '#9aa29c';
  locale.textContent = ` (${selected.locale})`;
  note.appendChild(locale);
  voiceNote.append(icon, note);
}

function cacheVoiceCatalogue(data) {
  try {
    localStorage.setItem(voiceCacheKey, JSON.stringify({...data, savedAt: Date.now()}));
  } catch (_) { /* Keep the live catalogue if browser storage is full or disabled. */ }
}

function readVoiceCatalogueCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(voiceCacheKey) || 'null');
    if (cached?.voices?.length && Date.now() - cached.savedAt < 7 * 24 * 60 * 60 * 1000) return cached;
  } catch (_) { /* Ignore invalid or unavailable browser storage. */ }
  return null;
}

function openAudioDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Browser storage is unavailable.'));
    const request = indexedDB.open('vozkovo-audio-library', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio', {keyPath: 'id'});
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open browser storage.'));
  });
}

async function storeAudioRecord(record) {
  const db = await openAudioDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('audio', 'readwrite');
    transaction.objectStore('audio').put(record);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Could not save audio.'));
    transaction.onabort = () => reject(transaction.error || new Error('Audio saving was cancelled.'));
  });
  db.close();
}

async function readAudioRecords() {
  const db = await openAudioDatabase();
  const records = await new Promise((resolve, reject) => {
    const request = db.transaction('audio', 'readonly').objectStore('audio').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Could not read saved audio.'));
  });
  db.close();
  return records;
}

async function removeAudioRecord(id) {
  const db = await openAudioDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('audio', 'readwrite');
    transaction.objectStore('audio').delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Could not delete audio.'));
  });
  db.close();
}

async function renderAudioLibrary() {
  libraryObjectUrls.forEach(url => URL.revokeObjectURL(url));
  libraryObjectUrls.clear();
  libraryList.replaceChildren();
  try {
    const records = (await readAudioRecords()).sort((a, b) => b.createdAt - a.createdAt);
    libraryCount.textContent = t('libraryCount', {count: records.length.toLocaleString(currentLanguage)});
    libraryEmpty.classList.toggle('hidden', records.length > 0);
    records.forEach(record => {
      const item = document.createElement('article');
      item.className = 'library-item';

      const info = document.createElement('div');
      info.className = 'library-item-info';
      const title = document.createElement('strong');
      title.textContent = record.voiceLabel || record.voiceId || 'VozKovo audio';
      const details = document.createElement('span');
      details.textContent = `${record.locale || ''} · ${t('savedAt', {date: new Date(record.createdAt).toLocaleString(currentLanguage)})}`;
      info.append(title, details);

      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      const audioUrl = URL.createObjectURL(record.blob);
      libraryObjectUrls.add(audioUrl);
      audio.src = audioUrl;

      const actions = document.createElement('div');
      actions.className = 'library-item-actions';
      const download = document.createElement('a');
      download.href = audioUrl;
      download.download = record.fileName || 'vozkovo-audio.mp3';
      download.textContent = t('downloadSaved');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.dataset.deleteId = record.id;
      remove.textContent = t('deleteSaved');
      remove.setAttribute('aria-label', `${t('deleteSaved')} ${record.voiceLabel || ''}`);
      actions.append(download, remove);
      item.append(info, actions, audio);
      libraryList.appendChild(item);
    });
    libraryStatus.textContent = '';
  } catch (_) {
    libraryCount.textContent = '—';
    libraryEmpty.classList.remove('hidden');
  }
}

async function saveGeneratedAudio(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('The MP3 could not be downloaded for browser storage.');
    const blob = await response.blob();
    const selected = allVoices.find(voice => voice.id === voiceSelect.value);
    const createdAt = Date.now();
    const stamp = new Date(createdAt).toISOString().replace(/[:.]/g, '-');
    await storeAudioRecord({
      id: (globalThis.crypto?.randomUUID?.() || `${createdAt}-${Math.random().toString(16).slice(2)}`),
      blob,
      voiceId: selected?.id || voiceSelect.value,
      voiceLabel: selected ? displayVoiceName(selected) : voiceSelect.value,
      locale: selected?.locale || '',
      createdAt,
      fileName: `vozkovo-${stamp}.mp3`
    });
    await renderAudioLibrary();
  } catch (_) {
    libraryStatus.textContent = t('saveFailed');
  }
}

async function loadVoices() {
  const cached = readVoiceCatalogueCache();
  if (cached) {
    allVoices = cached.voices;
    renderVoices();
  } else {
    voiceCount.textContent = t('loadingVoices');
  }
  try {
    const response = await fetch(apiUrl('/api/voices'));
    if (!response.ok) throw new Error(t('voiceLoadFailed'));
    const data = await response.json();
    allVoices = data.voices || [];
    populateLanguageFilter();
    if (!allVoices.length) throw new Error(t('emptyCatalog'));
    cacheVoiceCatalogue(data);
    renderVoices();
    const defaultVoice = allVoices.find(voice => voice.id === data.default);
    let savedVoice = null;
    try { savedVoice = localStorage.getItem(selectedVoiceKey); } catch (_) { /* Ignore unavailable storage. */ }
    const preferredVoice = currentLanguage === 'es' ? defaultVoice :
      allVoices.find(voice => voice.locale.toLowerCase().startsWith(`${currentLanguage}-`));
    const chosenVoice = allVoices.find(voice => voice.id === savedVoice) || preferredVoice || defaultVoice || allVoices[0];
    if (chosenVoice && [...voiceSelect.options].some(option => option.value === chosenVoice.id)) {
      voiceSelect.value = chosenVoice.id;
    }
    updateVoiceNote();
  } catch (error) {
    if (!cached) {
      voiceCount.textContent = t('voicesUnavailable');
      showError(error.message || t('voiceLoadFailed'));
    }
  }
}

function localizeServerError(message) {
  const known = {
    'Escribe o pega un texto antes de generar la voz.': 'emptyText',
    'Escribe un texto antes de generar la voz.': 'emptyText',
    'La voz seleccionada no está disponible. Actualiza la lista de voces.': 'selectVoice',
    'No se pudo cargar el catálogo de voces. Comprueba la conexión del servidor e inténtalo de nuevo.': 'voiceLoadFailed',
    'El servicio de voces no está disponible ahora mismo.': 'voiceLoadFailed',
    'El servicio de voz devolvió un fragmento vacío.': 'generateFailed',
    'No se pudieron unir los fragmentos de audio.': 'generateFailed',
    'No se pudo crear el archivo MP3.': 'generateFailed',
    'La tarea no existe o ha caducado.': 'progressFailed',
    'El MP3 todavía no está listo o la tarea ha caducado.': 'generateFailed',
    'El archivo MP3 ya no está disponible.': 'generateFailed',
    'No se pudo generar el audio.': 'generateFailed'
  };
  return known[message] ? t(known[message]) : message;
}

function showError(message) {
  errorBox.textContent = localizeServerError(message);
  errorBox.classList.remove('hidden');
}
function hideError() { errorBox.classList.add('hidden'); errorBox.textContent = ''; }
function stopPolling() { if (pollTimer) clearTimeout(pollTimer); pollTimer = null; }
function resetOutput() {
  stopPolling();
  progressPanel.classList.add('hidden');
  resultPanel.classList.add('hidden');
  hideError();
  audioPlayer.removeAttribute('src');
  audioPlayer.load();
}
function updateGenerateLabel() {
  generateLabel.textContent = generateBtn.disabled ? t('generating') : t('generate');
}
function setBusy(busy) {
  generateBtn.disabled = busy;
  updateGenerateLabel();
}
function updateSpeedLabel() {
  const speed = Number(speedRange.value);
  speedValue.textContent = speed === 0 ? `${t('normal')} · 0%` : `${speed > 0 ? '+' : ''}${speed}%`;
}

async function startGeneration() {
  hideError();
  const text = textInput.value.trim();
  if (!text) {
    showError(t('emptyText'));
    textInput.focus();
    return;
  }
  if (!voiceSelect.value) {
    showError(t('selectVoice'));
    return;
  }
  resetOutput();
  setBusy(true);
  progressPanel.classList.remove('hidden');
  progressText.textContent = t('preparing');
  progressPercent.textContent = '0%';
  progressBar.style.width = '0%';
  progressDetail.textContent = t('sending');

  try {
    const response = await fetch(apiUrl('/api/generate'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text, voice: voiceSelect.value, rate: Number(speedRange.value)})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || t('startFailed'));
    pollJob(data.job_id);
  } catch (error) {
    progressPanel.classList.add('hidden');
    setBusy(false);
    showError(error.message || t('connectionError'));
  }
}

async function pollJob(jobId) {
  try {
    const response = await fetch(apiUrl(`/api/jobs/${encodeURIComponent(jobId)}`));
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || t('progressFailed'));

    progressPercent.textContent = `${data.progress || 0}%`;
    progressBar.style.width = `${data.progress || 0}%`;
    if (data.status === 'queued') {
      progressText.textContent = t('queued');
      progressDetail.textContent = t('queuedDetail');
    } else if (data.status === 'processing') {
      progressText.textContent = t('processing');
      const total = data.total_chunks || 0;
      progressDetail.textContent = total ? t('chunk', {done: data.completed_chunks, total}) : t('chunksPreparing');
    } else if (data.status === 'done') {
      progressPanel.classList.add('hidden');
      await showResult(jobId);
      setBusy(false);
      return;
    } else if (data.status === 'error') {
      throw new Error(data.error || t('generateFailed'));
    }
    pollTimer = setTimeout(() => pollJob(jobId), 1000);
  } catch (error) {
    progressPanel.classList.add('hidden');
    setBusy(false);
    showError(error.message || t('generateFailed'));
  }
}

async function showResult(jobId) {
  const url = apiUrl(`/api/jobs/${encodeURIComponent(jobId)}/download`);
  audioPlayer.src = url;
  downloadBtn.href = url;
  downloadBtn.download = `voz-kovo-${new Date().toISOString().slice(0, 10)}.mp3`;
  resultPanel.classList.remove('hidden');
  saveGeneratedAudio(url);
  resultPanel.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

uiLanguage.addEventListener('change', () => setLanguage(uiLanguage.value));
textInput.addEventListener('input', updateCount);
document.getElementById('clearText').addEventListener('click', () => { textInput.value = ''; updateCount(); textInput.focus(); });
voiceSearch.addEventListener('input', renderVoices);
languageFilter.addEventListener('change', renderVoices);
voiceSelect.addEventListener('change', () => {
  try { localStorage.setItem(selectedVoiceKey, voiceSelect.value); } catch (_) { /* Keep the selection for this session. */ }
  updateVoiceNote();
});
libraryList.addEventListener('click', async event => {
  const button = event.target.closest('button[data-delete-id]');
  if (!button) return;
  button.disabled = true;
  try {
    await removeAudioRecord(button.dataset.deleteId);
    await renderAudioLibrary();
  } catch (_) {
    button.disabled = false;
    libraryStatus.textContent = t('saveFailed');
  }
});
speedRange.addEventListener('input', updateSpeedLabel);
generateBtn.addEventListener('click', startGeneration);

setLanguage(currentLanguage, false);
loadVoices();
