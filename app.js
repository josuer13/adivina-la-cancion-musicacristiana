const fallbackSongs = [
  {
    "artist": "Hillsong UNITED",
    "title": "Oceans (Where Feet May Fail)",
    "album": "Zion",
    "year": 2013,
    "url": "https://music.youtube.com/search?q=Oceans+Where+Feet+May+Fail+Hillsong+UNITED"
  },
  {
    "artist": "Cory Asbury",
    "title": "Reckless Love",
    "album": "Reckless Love",
    "year": 2018,
    "url": "https://music.youtube.com/search?q=Reckless+Love+Cory+Asbury"
  },
  {
    "artist": "Matt Redman",
    "title": "10,000 Reasons (Bless the Lord)",
    "album": "10,000 Reasons",
    "year": 2011,
    "url": "https://music.youtube.com/search?q=10000+Reasons+Matt+Redman"
  },
  {
    "artist": "Chris Tomlin",
    "title": "How Great Is Our God",
    "album": "Arriving",
    "year": 2004,
    "url": "https://music.youtube.com/search?q=How+Great+Is+Our+God+Chris+Tomlin"
  },
  {
    "artist": "Matt Redman",
    "title": "Blessed Be Your Name",
    "album": "Where Angels Fear to Tread",
    "year": 2002,
    "url": "https://music.youtube.com/search?q=Blessed+Be+Your+Name+Matt+Redman"
  },
  {
    "artist": "Chris Tomlin",
    "title": "Good Good Father",
    "album": "Never Lose Sight",
    "year": 2016,
    "url": "https://music.youtube.com/search?q=Good+Good+Father+Chris+Tomlin"
  },
  {
    "artist": "Hillsong Worship",
    "title": "What A Beautiful Name",
    "album": "Let There Be Light",
    "year": 2016,
    "url": "https://music.youtube.com/search?q=What+A+Beautiful+Name+Hillsong+Worship"
  },
  {
    "artist": "MercyMe",
    "title": "I Can Only Imagine",
    "album": "Almost There",
    "year": 2001,
    "url": "https://music.youtube.com/search?q=I+Can+Only+Imagine+MercyMe"
  },
  {
    "artist": "Kari Jobe",
    "title": "Holy Spirit",
    "album": "Majestic",
    "year": 2014,
    "url": "https://music.youtube.com/search?q=Holy+Spirit+Kari+Jobe"
  },
  {
    "artist": "Chris Tomlin",
    "title": "Amazing Grace (My Chains Are Gone)",
    "album": "See the Morning",
    "year": 2006,
    "url": "https://music.youtube.com/search?q=Amazing+Grace+My+Chains+Are+Gone+Chris+Tomlin"
  },
  {
    "artist": "Matt Maher",
    "title": "Lord, I Need You",
    "album": "Alive Again",
    "year": 2009,
    "url": "https://music.youtube.com/search?q=Lord+I+Need+You+Matt+Maher"
  },
  {
    "artist": "All Sons & Daughters",
    "title": "Great Are You Lord",
    "album": "Live",
    "year": 2013,
    "url": "https://music.youtube.com/search?q=Great+Are+You+Lord+All+Sons+%26+Daughters"
  },
  {
    "artist": "Zach Williams",
    "title": "Chain Breaker",
    "album": "Chain Breaker",
    "year": 2016,
    "url": "https://music.youtube.com/search?q=Chain+Breaker+Zach+Williams"
  },
  {
    "artist": "Lauren Daigle",
    "title": "You Say",
    "album": "Look Up Child",
    "year": 2018,
    "url": "https://music.youtube.com/search?q=You+Say+Lauren+Daigle"
  },
  {
    "artist": "Bethel Music",
    "title": "Raise a Hallelujah",
    "album": "Victory",
    "year": 2019,
    "url": "https://music.youtube.com/search?q=Raise+a+Hallelujah+Bethel+Music"
  },
  {
    "artist": "Bethel Music",
    "title": "Goodness of God",
    "album": "Victory",
    "year": 2019,
    "url": "https://music.youtube.com/search?q=Goodness+of+God+Bethel+Music"
  },
  {
    "artist": "Bethel Music",
    "title": "Ever Be",
    "album": "We Will Not Be Shaken",
    "year": 2015,
    "url": "https://music.youtube.com/search?q=Ever+Be+Bethel+Music"
  },
  {
    "artist": "Lauren Daigle",
    "title": "Rescue",
    "album": "Look Up Child",
    "year": 2018,
    "url": "https://music.youtube.com/search?q=Rescue+Lauren+Daigle"
  },
  {
    "artist": "Casting Crowns",
    "title": "Who Am I",
    "album": "The Altar and the Door",
    "year": 2007,
    "url": "https://music.youtube.com/search?q=Who+Am+I+Casting+Crowns"
  },
  {
    "artist": "Hillsong Worship",
    "title": "Mighty to Save",
    "album": "Mighty to Save",
    "year": 2006,
    "url": "https://music.youtube.com/search?q=Mighty+to+Save+Hillsong+Worship"
  }
];

let songs = [];
let lastSong = null;
let currentSong = null;
let isFlipping = false;
let selectedArtists = new Set();

document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const generateButton = document.querySelector('#generateBtn');
    const flipButton = document.querySelector('#flipCardBtn');
    const saveButton = document.querySelector('#saveConfigBtn');
    const messageEl = document.querySelector('#configMessage');
    const yearSelect = document.querySelector('#yearSelect');
    const yearRange = document.querySelector('#yearRange');
    const fromInput = document.querySelector('#yearFrom');
    const toInput = document.querySelector('#yearTo');
    const artistsContainer = document.querySelector('#artistTags');

    const savedConfig = loadSavedConfig();

    card.classList.add('hidden');
    if (flipButton) {
        flipButton.disabled = true;
    }

    loadSongs();

    function loadSavedConfig() {
        try {
            const raw = localStorage.getItem('musicAppConfig');
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('Error parsing saved config:', error);
            return null;
        }
    }

    function loadSongs() {
        fetch('./songs.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                songs = data;
                populateArtists();
            })
            .catch(error => {
                console.warn('Fetch failed, using fallback data:', error);
                songs = fallbackSongs;
                populateArtists();
            });
    }

    function populateArtists() {
        artistsContainer.innerHTML = '';
        selectedArtists.clear();

        const artists = [...new Set(songs.map(song => song.artist))];
        artists.forEach(artist => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = artist;
            if (selectedArtists.has(artist)) {
                tag.classList.add('selected');
            }
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

        validateSaveState();
    }

    yearSelect.addEventListener('change', () => {
        if (yearSelect.value === 'range') {
            yearRange.classList.remove('hidden');
        } else {
            yearRange.classList.add('hidden');
            clearMessage();
        }
        validateSaveState();
    });

    fromInput.addEventListener('input', () => {
        clearMessage();
        validateSaveState();
    });
    toInput.addEventListener('input', () => {
        clearMessage();
        validateSaveState();
    });

    saveButton?.addEventListener('click', saveConfig);

    generateButton.addEventListener('click', () => {
        if (card.classList.contains('hidden')) {
            if (!prepareNextSong()) {
                return;
            }

            showCardFront();
            card.classList.remove('hidden');
            flipButton.disabled = false;
            return;
        }

        card.classList.add('hidden');
        flipButton.disabled = true;
        currentSong = null;

        setTimeout(() => {
            if (!prepareNextSong()) {
                return;
            }

            showCardFront();
            card.classList.remove('hidden');
            flipButton.disabled = false;
        }, 250);
    });

    flipButton?.addEventListener('click', () => {
        if (card.classList.contains('hidden') || isFlipping) {
            return;
        }

        if (card.classList.contains('flipped')) {
            isFlipping = true;
            card.classList.remove('flipped');
            setTimeout(() => {
                isFlipping = false;
            }, 600);
            return;
        }

        if (!currentSong && !prepareNextSong()) {
            return;
        }

        updateCardBack();
        isFlipping = true;
        card.classList.add('flipped');
        setTimeout(() => {
            isFlipping = false;
        }, 600);
    });

    function saveConfig() {
        if (yearSelect.value === 'range') {
            const from = parseInt(fromInput.value, 10);
            const to = parseInt(toInput.value, 10);

            if (!fromInput.value || !toInput.value) {
                showMessage('Completa ambos campos de año antes de guardar.', 'error');
                return;
            }
            if (from > to) {
                showMessage('El año Desde no puede ser mayor que Hasta.', 'error');
                return;
            }
        }

        const config = {
        };

        try {
            localStorage.setItem('musicAppConfig', JSON.stringify(config));
            showMessage('Configuración guardada.', 'success');
        } catch (error) {
            console.error('Error saving config:', error);
            showMessage('No se pudo guardar la configuración.', 'error');
        }
    }

    function validateSaveState() {
        if (!saveButton) return;

        const invalidRange = yearSelect.value === 'range'
            && fromInput.value
            && toInput.value
            && parseInt(fromInput.value, 10) > parseInt(toInput.value, 10);

        saveButton.disabled = invalidRange;

        if (invalidRange) {
            showMessage('El año Desde no puede ser mayor que Hasta.', 'error');
        } else {
            clearMessage();
        }
    }

    function showMessage(text, type) {
        if (!messageEl) return;
        messageEl.textContent = text;
        messageEl.className = `message ${type || ''}`;
    }

    function clearMessage() {
        if (!messageEl) return;
        messageEl.textContent = '';
        messageEl.className = 'message';
    }

    function getYearRange() {
        const fromValue = fromInput.value.trim();
        const toValue = toInput.value.trim();

        if (yearSelect.value !== 'range') {
            return null;
        }

        const from = parseInt(fromValue, 10);
        const to = parseInt(toValue, 10);

        if (!fromValue || !toValue || Number.isNaN(from) || Number.isNaN(to)) {
            return null;
        }

        return { from, to };
    }

    function getFilteredSongs() {
        let filtered = songs;

        if (selectedArtists.size > 0) {
            filtered = filtered.filter(song => selectedArtists.has(song.artist));
        }

        const range = getYearRange();
        if (range) {
            filtered = filtered.filter(song => song.year >= range.from && song.year <= range.to);
        }

        return filtered;
    }

    function prepareNextSong() {
        if (yearSelect.value === 'range') {
            const range = getYearRange();
            if (!range) {
                showMessage('Completa los años Desde y Hasta para aplicar el filtro.', 'error');
                return false;
            }
            if (range.from > range.to) {
                showMessage('El año Desde no puede ser mayor que Hasta.', 'error');
                return false;
            }
        }

        const filtered = getFilteredSongs();
        if (filtered.length === 0) {
            alert('No hay canciones que coincidan con los filtros.');
            return false;
        }

        let randomSong;
        do {
            randomSong = filtered[Math.floor(Math.random() * filtered.length)];
        } while (filtered.length > 1 && randomSong === lastSong);

        currentSong = randomSong;
        lastSong = randomSong;
        return true;
    }

function showCardFront() {
    card.classList.remove('flipped');
    const front = card.querySelector('.card-front-content');
    if (!front) return;

    front.innerHTML = `
        <div id="qrcode"></div>

        <a href="${currentSong?.url || '#'}" target="_blank" class="song-url">
            Abrir en YouTube Music
        </a>

        <div class="play-icon"></div>
        <p>Escanea el QR o presiona el botón</p>
    `;

    const qrContainer = front.querySelector('#qrcode');
    if (!qrContainer || !currentSong) return;

    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
        text: currentSong.url,
        width: 225,
        height: 225
    });
}

    function updateCardBack() {
        if (!currentSong) return;
        const back = card.querySelector('.card-back');
        if (!back) return;
        const songInfo = back.querySelector('.song-info');
        if (!songInfo) return;
        
        songInfo.innerHTML = `
            <h2>${currentSong.title}</h2>
            <p>Álbum: ${currentSong.album}</p>
            <p class="year">${currentSong.year}</p>
            <p>Artista: ${currentSong.artist}</p>
        `;
    }
});