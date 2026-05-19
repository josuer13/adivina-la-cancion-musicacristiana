const fallbackSongs = [
    {
        "title": "Canción de Prueba",
        "artist": "Artista de Prueba",
        "album": "Álbum de Prueba",
        "year": 2026,
        "url": "https://youtube.com"
    }
];

let songs = [];
let lastSong = null;
let currentSong = null;
let isFlipping = false;
let selectedArtists = new Set();
let groupNames = [];
let groupScores = [];

let currentRound = 1;
let totalRounds = 5; 
let groupCount = 2; 
let cardsGeneratedInRound = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Iniciando componentes...");

    // ==========================================
    // SELECCIÓN DE ELEMENTOS DEL DOM
    // ==========================================
    const setupWizard = document.getElementById('setupWizard');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    const toStep2 = document.getElementById('toStep2');
    const toStep3 = document.getElementById('toStep3');
    const backToStep1 = document.getElementById('backToStep1');
    const backToStep2 = document.getElementById('backToStep2');
    const startGameButton = document.getElementById('startGameButton');

    const roundsInput = document.getElementById('roundsInput');
    const groupCountInput = document.getElementById('groupCountInput');
    const groupInputsContainer = document.getElementById('groupInputsContainer');

    const card = document.querySelector('.card');
    const generateButton = document.getElementById('generateBtn');
    const flipButton = document.getElementById('flipCardBtn');
    const saveButton = document.getElementById('saveConfigBtn');

    const gameModal = document.getElementById("gameModal");
    const closeGameModalBtn = document.getElementById("closeGameModalBtn");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const teamButtonsContainer = document.getElementById("teamButtons");

    const messageEl = document.getElementById('configMessage');
    const yearSelect = document.getElementById('yearSelect');
    const yearRange = document.getElementById('yearRange');
    const fromInput = document.getElementById('yearFrom');
    const toInput = document.getElementById('yearTo');
    const artistsContainer = document.getElementById('artistTags');

    // Inicialización segura de la interfaz
    if (card) card.classList.add('hidden');
    if (flipButton) flipButton.disabled = true;

    // Ocultar los 10 paneles de grupos del marcador al iniciar
    for (let i = 1; i <= 10; i++) {
        const groupEl = document.getElementById(`group${i}`);
        if (groupEl) groupEl.style.display = 'none';
    }

    // Cargar canciones inmediatamente
    loadSongs();

    // ==========================================
    // NAVEGACIÓN DEL WIZARD (PASOS)
    // ==========================================
    toStep2?.addEventListener('click', () => {
        step1?.classList.remove('active-step');
        step2?.classList.add('active-step');
    });

    toStep3?.addEventListener('click', () => {
        step2?.classList.remove('active-step');
        step3?.classList.add('active-step');
    });

    backToStep1?.addEventListener('click', () => {
        step2?.classList.remove('active-step');
        step1?.classList.add('active-step');
    });

    backToStep2?.addEventListener('click', () => {
        step3?.classList.remove('active-step');
        step2?.classList.add('active-step');
    });

    // Generar inputs dinámicos para los nombres de los grupos
    groupCountInput?.addEventListener('input', () => {
        const amount = Math.min(parseInt(groupCountInput.value) || 0, 10);
        if (groupInputsContainer) groupInputsContainer.innerHTML = '';

        for (let i = 1; i <= amount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre del grupo ${i}`;
            input.className = 'setup-input';
            groupInputsContainer?.appendChild(input);
        }
    });

    // ==========================================
    // BOTÓN EMPEZAR JUEGO (ARRANQUE DE PARTIDA)
    // ==========================================
    startGameButton?.addEventListener("click", () => {
        totalRounds = parseInt(roundsInput?.value, 10) || 5;
        groupCount = parseInt(groupCountInput?.value, 10) || 2;
        currentRound = 1;
        cardsGeneratedInRound = 0;

        // Recuperar nombres de los grupos
        const inputs = groupInputsContainer ? groupInputsContainer.querySelectorAll('input') : [];
        groupNames = Array.from(inputs).map((i, index) => i.value || `Grupo ${index + 1}`);
        if (groupNames.length === 0) {
            groupNames = Array.from({length: groupCount}, (_, i) => `Grupo ${i + 1}`);
        }
        groupScores = new Array(groupNames.length).fill(0);
        
        // Limpiar botones previos del modal
        if (teamButtonsContainer) teamButtonsContainer.innerHTML = '';

        // Configurar panel lateral de puntajes y botones de anotación
        for (let i = 1; i <= 10; i++) {
            const groupEl = document.getElementById(`group${i}`);
            if (i <= groupNames.length) {
                if (groupEl) groupEl.style.display = 'flex';
                
                const nameEl = document.getElementById(`group_${i}_name`);
                const scoreEl = document.getElementById(`group_${i}_score`);
                
                if (nameEl) nameEl.textContent = groupNames[i - 1];
                if (scoreEl) scoreEl.textContent = "0 pts";

                // Crear botones dentro del modal de puntuación
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'primary-button';
                btn.style.margin = '5px';
                btn.textContent = `+1 a ${groupNames[i - 1]}`;
                btn.addEventListener('click', () => sumarPunto(i - 1));
                teamButtonsContainer?.appendChild(btn);
            } else {
                if (groupEl) groupEl.style.display = 'none';
            }
        }

        actualizarVisualizadorRondas();
        if (setupWizard) setupWizard.style.display = "none";
    });

    function actualizarVisualizadorRondas() {
        const el = document.getElementById("roundCounter");
        if (el) el.textContent = `Ronda: ${currentRound}/${totalRounds}`;
    }

    function sumarPunto(indexGrupo) {
        groupScores[indexGrupo] += 1;
        const scoreEl = document.getElementById(`group_${indexGrupo + 1}_score`);
        if (scoreEl) scoreEl.textContent = `${groupScores[indexGrupo]} pts`;
        gameModal?.classList.add("hidden");
    }

    // ==========================================
    // BOTÓN NUEVA CARTA (MECÁNICA ADAPTADA)
    // ==========================================
    generateButton?.addEventListener('click', () => {
        console.log("Click en Nueva Carta detectado.");

        if (songs.length === 0) {
            alert("Las canciones aún no han cargado o el archivo songs.json está vacío.");
            return;
        }

        let filteredSongs = [...songs];

        // Filtro por Artistas
        if (selectedArtists.size > 0) {
            filteredSongs = filteredSongs.filter(song => selectedArtists.has(song.artist));
        }

        // Filtro por Rango de Años
        if (yearSelect?.value === 'range') {
            const from = parseInt(fromInput?.value) || 0;
            const to = parseInt(toInput?.value) || 9999;
            filteredSongs = filteredSongs.filter(song => song.year >= from && song.year <= to);
        }

        // Evitar que salga la misma de forma consecutiva
        if (filteredSongs.length > 1) {
            filteredSongs = filteredSongs.filter(song => song !== lastSong);
        }

        if (!filteredSongs.length) {
            alert('No hay canciones disponibles con los filtros seleccionados.');
            return;
        }

        const randomSong = filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
        currentSong = randomSong;
        lastSong = randomSong;

        // Renderizar los datos dentro de la carta
        try {
            document.getElementById('songTitle').textContent = randomSong.title;
            document.getElementById('songAlbum').textContent = randomSong.album;
            document.getElementById('songYear').textContent = randomSong.year;
            document.getElementById('songArtist').textContent = randomSong.artist;
            
            const urlElement = document.querySelector('.song-url');
            if (urlElement) {
                urlElement.href = randomSong.url;
                urlElement.target = "_blank";
            }

            // Inyectar código QR
            const qrContainer = document.getElementById('qrcode');
            if (qrContainer) {
                qrContainer.innerHTML = '';
                if (typeof QRCode !== 'undefined') {
                    new QRCode(qrContainer, { text: randomSong.url, width: 200, height: 200 });
                }
            }
        } catch (err) {
            console.error("Error al renderizar los datos de la tarjeta:", err);
        }

        // Devolver la carta al frente (QR) y mostrarla si estaba oculta
        if (card) {
            card.classList.remove('hidden');
            const songCardElement = document.getElementById("songCard");
            if (songCardElement) songCardElement.classList.remove('flipped');
        }
        cardState = "front";
        if (flipButton) flipButton.disabled = false;

        // ------------------------------------------
        // SISTEMA DE TURNOS Y RONDAS (groupCount + 1)
        // ------------------------------------------
        cardsGeneratedInRound++; // Añadimos el turno actual

        // Cuando pasamos el límite de grupos (es decir, el Grupo 1 pide su segunda carta)
        if (cardsGeneratedInRound > groupCount) { 
            if (currentRound < totalRounds) {
                currentRound++;                 // Sube la ronda visualmente en este clic
                cardsGeneratedInRound = 1;      // Se setea en 1 porque ya es la carta del primer equipo
                actualizarVisualizadorRondas();  
                console.log("--- ¡Nueva Ronda! --- Turno actual:", currentRound);
            } else {
                // Alerta cuando se completó la última ronda física y se intenta pedir de más
                setTimeout(() => { 
                    alert("¡Partida terminada! Ya completaron todas las rondas configuradas."); 
                }, 100);
                return;
            }
        }
    });

    // ==========================================
    // MECÁNICA DE GIRO (FLIP CARD)
    // ==========================================
    flipButton?.addEventListener('click', () => {
        if (isFlipping) return;
        isFlipping = true;

        const songCardElement = document.getElementById("songCard");
        if (songCardElement) {
            songCardElement.classList.toggle('flipped');
            cardState = songCardElement.classList.contains('flipped') ? "back" : "front";

            // Si se revela el reverso, se abre automáticamente el modal de puntuación
            if (cardState === "back") {
                setTimeout(() => { gameModal?.classList.remove("hidden"); }, 700);
            }
        }
        setTimeout(() => { isFlipping = false; }, 600);
    });

    // ==========================================
    // MENÚS DE CONFIGURACIÓN Y LOCALSTORAGE
    // ==========================================
    yearSelect?.addEventListener('change', () => {
        if (yearSelect.value === 'range') {
            yearRange?.classList.remove('hidden');
        } else {
            yearRange?.classList.add('hidden');
        }
    });

    saveButton?.addEventListener('click', () => {
        const config = {
            yearMode: yearSelect?.value,
            from: fromInput?.value,
            to: toInput?.value,
            artists: [...selectedArtists]
        };
        localStorage.setItem('musicAppConfig', JSON.stringify(config));
        alert('Configuración guardada localmente.');
    });

    // Botones funcionales para interactuar con modales
    closeGameModalBtn?.addEventListener("click", () => gameModal?.classList.add("hidden"));
    playAgainBtn?.addEventListener("click", () => { location.reload(); });

    // ==========================================
    // GESTIÓN DE CONTROLADORES DE ARCHIVOS LOCALES
    // ==========================================
    function loadSongs() {
        fetch('./songs.json')
            .then(response => {
                if (!response.ok) throw new Error('No se pudo encontrar el archivo songs.json');
                return response.json();
            })
            .then(data => {
                songs = data;
                populateArtists();
            })
            .catch(error => {
                console.warn("Cargando array de respaldo (fallbackSongs).", error);
                songs = fallbackSongs;
                populateArtists();
            });
    }

    function populateArtists() {
        if (!artistsContainer) return;
        artistsContainer.innerHTML = '';
        selectedArtists.clear();

        const artists = [...new Set(songs.map(song => song.artist))];
        artists.forEach(artist => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = artist;
            tag.addEventListener('click', () => {
                if (selectedArtists.has(artist)) {
                    selectedArtists.delete(artist);
                    tag.classList.remove('selected');
                } else {
                    selectedArtists.add(artist);
                    tag.classList.add('selected');
                }
            });
            artistsContainer.appendChild(tag);
        });
    }
});