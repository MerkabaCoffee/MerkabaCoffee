// Initial state
let currentLanguage = localStorage.getItem('merkaba-lang') || 'hu';

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const id = this.getAttribute('href').slice(1);

            // On mobile, if this is gallery toggle, don't scroll
            if (window.innerWidth <= 1150 && this.id === 'nav-gallery') return;

            if (id) {
                scrollToId(id);
                // Also close mobile menu if open
                if (document.body.classList.contains('mobile-active')) {
                    document.getElementById('mobile-toggle')?.classList.remove('active');
                    document.querySelector('.main-nav')?.classList.remove('active');
                    document.body.classList.remove('mobile-active');
                }
            }
        });
    });

    // Language init
    initLanguage();
    initializeMap();
    initLightbox();
    initMobileMenu();
    initGlobalSearch();
    initKeyboardNav();
    initAudioPlayer();

    // Proactive gallery preloading for all first sets
    preloadInitialGalleryImages();
});

// Audio Player Logic
function initAudioPlayer() {
    const audio = document.getElementById('bg-music');
    const muteOffIcons = document.querySelectorAll('.mute-off-icon');
    const muteOnIcons = document.querySelectorAll('.mute-on-icon');
    const allMuteBtns = document.querySelectorAll('#global-mute-btn, #floating-mute-btn');

    if (!audio) return;

    // Setting initial low volume as requested
    audio.volume = 0.25;

    const updateMuteIcons = (isMuted) => {
        muteOffIcons.forEach(icon => icon.style.display = isMuted ? 'none' : 'block');
        muteOnIcons.forEach(icon => icon.style.display = isMuted ? 'block' : 'none');
    };

    const playAudio = () => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Success
            }).catch(err => {
                console.log("Autoplay blocked - waiting for interaction", err);
            });
        }
    };

    // Autoplay on first interaction
    const handleFirstInteraction = () => {
        playAudio();
    };

    ['click', 'touchstart', 'mousedown'].forEach(evt => {
        document.addEventListener(evt, handleFirstInteraction, { once: true });
    });

    allMuteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.muted = !audio.muted;
            updateMuteIcons(audio.muted);

            // If it was paused by browser block, try playing now
            if (audio.paused) playAudio();
        });
    });

    // Secondary restart functionality
    document.querySelectorAll('.audio-restart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.currentTime = 0;
            if (audio.paused) playAudio();
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.querySelector('.main-nav');
    const closeBtn = document.getElementById('menu-close');
    const galleryToggle = document.getElementById('nav-gallery');
    const dropdownMenu = nav ? nav.querySelector('.dropdown-menu') : null;

    const closeAll = () => {
        if (toggle) toggle.classList.remove('active');
        if (nav) nav.classList.remove('active');
        document.body.classList.remove('mobile-active');
    };

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('mobile-active');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeAll);
        }

        // Gallery Dropdown Toggle in Mobile
        if (galleryToggle && dropdownMenu) {
            galleryToggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1150) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('active');
                    galleryToggle.textContent = dropdownMenu.classList.contains('active') ?
                        (currentLanguage === 'hu' ? 'Galéria ▴' : 'Gallery ▴') :
                        (currentLanguage === 'hu' ? 'Galéria ▾' : 'Gallery ▾');
                }
            });
        }

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close if it's the gallery toggle on mobile
                if (window.innerWidth <= 1150 && link.id === 'nav-gallery') return;

                closeAll();
            });
        });
    }
}

// Global Search Logic
function initGlobalSearch() {
    const triggerBtn = document.getElementById('search-trigger-btn');
    const headerSearchInput = document.getElementById('header-search-input');
    const resultsDropdown = document.getElementById('header-search-results');
    const mobileSearchInput = document.getElementById('mobile-nav-search');

    if (!headerSearchInput || !resultsDropdown) return;

    const handleSearchInput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const isMobile = e.target.id === 'mobile-nav-search';
        const currentResults = isMobile ? document.getElementById('mobile-search-results') : resultsDropdown;

        if (!currentResults) return;

        if (query.length < 2) {
            currentResults.classList.remove('open');
            return;
        }

        const matches = [];
        const searchNodes = [
            { id: 'about', title: currentLanguage === 'hu' ? 'Rólunk' : 'About Us' },
            { id: 'summer-section', title: currentLanguage === 'hu' ? 'Nyári Galéria' : 'Summer Gallery' },
            { id: 'winter-section', title: currentLanguage === 'hu' ? 'Téli Galéria' : 'Winter Gallery' },
            { id: 'contact', title: currentLanguage === 'hu' ? 'Kapcsolat' : 'Contact Us' },
            { id: 'menu', title: currentLanguage === 'hu' ? 'Menü' : 'Menu' }
        ];

        searchNodes.forEach(node => {
            const el = document.getElementById(node.id);
            if (el && el.innerText.toLowerCase().includes(query)) {
                matches.push({ id: node.id, title: node.title });
            }
        });

        if (matches.length > 0) {
            currentResults.classList.add('open');
            currentResults.innerHTML = `
                <ul>
                    ${matches.map(m => `
                        <li onclick="scrollToId('${m.id}')"> ${m.title}</li>
                    `).join('')}
                </ul>
            `;
        } else {
            const noMatchText = currentLanguage === 'hu' ? 'Nincs találat...' : 'No results...';
            currentResults.innerHTML = `<p style="padding:0.5rem 1rem; font-size:0.8rem;">${noMatchText}</p>`;
            currentResults.classList.add('open');
        }
    };

    headerSearchInput.addEventListener('input', handleSearchInput);
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', handleSearchInput);
    }

    // Toggle search open/focus on icon click
    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => {
            headerSearchInput.classList.add('open');
            headerSearchInput.focus();
        });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!headerSearchInput.contains(e.target) && !resultsDropdown.contains(e.target) && (triggerBtn && !triggerBtn.contains(e.target))) {
            resultsDropdown.classList.remove('open');
        }
    });
}

function scrollToId(id) {
    const el = document.getElementById(id);
    const resultsDropdown = document.getElementById('header-search-results');
    const mobileResults = document.getElementById('mobile-search-results');

    if (el) {
        if (resultsDropdown) resultsDropdown.classList.remove('open');
        if (mobileResults) mobileResults.classList.remove('open');

        // Close mobile menu if open
        if (document.body.classList.contains('mobile-active')) {
            document.getElementById('mobile-toggle')?.classList.remove('active');
            document.querySelector('.main-nav')?.classList.remove('active');
            document.body.classList.remove('mobile-active');
        }

        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

// Global Keyboard Navigation
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('lightbox-modal');
        const isLightboxOpen = modal && (modal.style.display === "block");

        if (e.key === 'ArrowLeft') {
            if (isLightboxOpen) {
                navigateLightbox(-1);
            } else {
                document.querySelectorAll('.gallery-arrow.prev').forEach(arrow => arrow.click());
            }
        } else if (e.key === 'ArrowRight') {
            if (isLightboxOpen) {
                navigateLightbox(1);
            } else {
                document.querySelectorAll('.gallery-arrow.next').forEach(arrow => arrow.click());
            }
        } else if (e.key === 'Escape' && isLightboxOpen) {
            modal.style.display = "none";
        }
    });
}

// Initialize Interactive Map
let leafMap = null;
let mapMarkers = [];
const baseLocations = [
    { nameHu: 'Csobánkapuszta', nameEn: 'Csobánkapuszta', addressHu: 'Bér, Csobánkapuszta, 3045 Magyarország', addressEn: 'Bér, Csobánkapuszta, 3045 Hungary', lat: 47.8941557, lng: 19.4722282 },
    { nameHu: 'Lengyeltóti', nameEn: 'Lengyeltóti', addressHu: 'Lengyeltóti, 8693 Magyarország', addressEn: 'Lengyeltóti, 8693 Hungary', lat: 46.6668325, lng: 17.6434037 },
    { nameHu: 'Sóstó', nameEn: 'Sóstó', addressHu: 'Siófok, Sóstó, 8600 Magyarország', addressEn: 'Siófok, Sóstó, 8600 Hungary', lat: 46.9397229, lng: 18.1349589 },
    { nameHu: 'Balatonakali', nameEn: 'Balatonakali', addressHu: 'Balatonakali, 8243 Magyarország', addressEn: 'Balatonakali, 8243 Hungary', lat: 46.8821941, lng: 17.7464937 },
    { nameHu: 'Rétság', nameEn: 'Rétság', addressHu: 'Rétság, 2651 Magyarország', addressEn: 'Rétság, 2651 Hungary', lat: 47.9289938, lng: 19.1375281 },
    { nameHu: 'Galgaguta', nameEn: 'Galgaguta', addressHu: 'Galgaguta, 2686 Magyarország', addressEn: 'Galgaguta, 2686 Hungary', lat: 47.84928, lng: 19.3877658 }
];

function updateMapLanguage() {
    const listEl = document.getElementById('location-list');
    if (listEl) {
        listEl.innerHTML = '';
        baseLocations.forEach((loc, i) => {
            const name = currentLanguage === 'hu' ? loc.nameHu : loc.nameEn;
            const item = document.createElement('div');
            item.className = 'location-item';
            item.dataset.index = i;
            item.innerHTML = `
                <div class="location-icon">
                    <img src="assets/PAPER_cup.png" alt="cup" />
                </div>
                <span class="location-name">${name}</span>
            `;
            item.addEventListener('click', () => {
                leafMap.flyTo([loc.lat, loc.lng], 12, { duration: 1 });
                mapMarkers[i].openPopup();
                document.querySelectorAll('.location-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });
            listEl.appendChild(item);
        });
    }

    if (mapMarkers.length > 0) {
        mapMarkers.forEach((marker, i) => {
            const loc = baseLocations[i];
            const name = currentLanguage === 'hu' ? loc.nameHu : loc.nameEn;
            const address = currentLanguage === 'hu' ? loc.addressHu : loc.addressEn;
            marker.setPopupContent(`<div class="popup-name">${name}</div><div class="popup-address">${address}</div>`);
        });
    }
}

function initializeMap() {
    const mapDisplayEl = document.getElementById('map-display');
    if (!mapDisplayEl) return;

    leafMap = L.map('map-display', {
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false
    }).setView([47.3, 18.5], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
    }).addTo(leafMap);

    mapDisplayEl.addEventListener('click', () => {
        leafMap.dragging.enable();
        leafMap.scrollWheelZoom.enable();
        leafMap.doubleClickZoom.enable();
        leafMap.touchZoom.enable();
        mapDisplayEl.style.cursor = 'default';
    });

    mapDisplayEl.style.cursor = 'pointer';
    mapDisplayEl.title = currentLanguage === 'hu' ? 'Kattints a térkép aktiválásához' : 'Click to activate map';

    const cupIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin"><img src="assets/PAPER_cup.png" alt="Merkaba" /></div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
    });

    mapMarkers = [];
    baseLocations.forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng], { icon: cupIcon })
            .addTo(leafMap);
        mapMarkers.push(marker);
    });

    updateMapLanguage();
}

// Translations and other logic
const translations = {
    hu: {
        'nav-home': 'Kezdőlap',
        'nav-about': 'Rólunk',
        'nav-gallery': 'Galéria ▾',
        'nav-summer': 'Nyár',
        'nav-winter': 'Tél',
        'nav-contact': 'Kapcsolat',
        'hero-title': 'MERKABA COFFEE',
        'hero-subtitle': 'Mobil kávézó • Vintage La Cimbali • Piaggio Ape',
        'title-about': 'Rólunk',
        'about-para-1': 'Kis mobil kávézónk, a Merkaba Coffee, 2025. június 30-án indult kalandos útjára a SUN Festivalon. Azóta megfordult a Manason, a Microasison, az Everness Indián Nyáron, Balatonakalin - a helyi Mandula Festivalon és Rétságon, a Termelői piacon.',
        'about-para-2': 'Jelenleg Galgagután, a posta és a templom közötti hangulatos parkban találod meg a kis Piaggio-t, a Merkaba Coffee-t.',
        'about-para-3': 'A Merkaba ősi, egyiptomi szent szimbólum, a test, lélek és szellem tökéletes harmóniáját jelképezi – egy csillagfényű "jármű", ami spirituális utazásra hív. Mi ezt a varázst látjuk egy csésze kávéban.',
        'about-para-4': 'A kávénk titka a vintage kétkaros La Cimbali gépünkben rejlik – egy igazi 80-as évekbeli analóg ikon, ami szenvedéllyel átitatva főzi a krémes espresso-t, cappuccino-t és egyéb finomságokat.',
        'about-para-5': 'Célunk, hogy szívmelengető pillanatokat szerezhessünk vendégeinknek egy finom meleg kávé, tea vagy forró csoki mellett.',
        'about-para-6': 'Keress minket bátran elérhetőségeinken, ha felkeltettük érdeklődésedet, vagy nézz el hozzánk egy jó kávéra Galgagután.',
        'gallery-intro': 'Kalandjaink',
        'summer-title': 'Nyár 2025',
        'summer-desc': 'A nyár a szabadság és a végtelen utak ideje volt számunkra. A napsütötte fesztiválok és a természet lágy ölelése adta a hátteret a kávézás élményéhez.',
        'winter-title': 'Tél 2025',
        'winter-desc': 'A tél a meghittség időszaka. Havas dombok között, forró kávé mellett osztjuk meg vendégeinkkel a téli melegség varázsát.',
        'title-menu': 'Menü',
        'title-contact': 'Kapcsolat',
        'contact-subtitle': 'Kalandok helyszíne',
        'contact-location': 'Jelenleg <strong>Galgagután</strong>',
        'fest-sun': 'S.U.N. Festival',
        'caption-sun': 'S.U.N.',
        'fest-manas': 'Manas Festival',
        'fest-microasis': 'Microasis Festival',
        'fest-indian': 'Everness Indián Nyár',
        'caption-indian': 'Everness Indian Summer',
        'fest-mandula': 'Mandula Festival',
        'caption-mandula': 'Mandula Festival',
        'fest-advent': 'Adventi Vásár',
        'caption-advent': 'Advent',
        'badge-coming': 'Hamarosan',
        'fest-galgaguta': 'Galgaguta',
        'caption-galgaguta': 'Galgaguta',
        'map-title': 'Kalandok',
        'map-instruct': 'Kattints a térkép aktiválásához',
        'impressum-label': 'IMPRESSZUM',
        'impressum-owner-label': 'Üzemeltető adatai:',
        'label-name': 'Név',
        'label-address': 'Székhely',
        'label-hosting': 'Tárhelyszolgáltató',
        'label-copyright-title': 'Szerzői jogok:',
        'impressum-copyright-text': 'A weboldalon megjelenő minden tartalom (szöveg, kép, zene, grafika, logó) a Merkaba Coffee szellemi tulajdona. Minden jog fenntartva. Az oldal tartalmának másolása vagy felhasználása csak előzetes írásbeli engedéllyel lehetséges.',
        'footer-rights': '© 2025 Merkaba Coffee. Minden jog fenntartva.',
        'gal-sun': 'S.U.N. Fesztivál',
        'gal-manas': 'Manas Fesztivál',
        'gal-microasis': 'Microasis Fesztivál',
        'gal-indian': 'Everness Indián Nyár',
        'gal-mandula': 'Mandula Fesztivál',
        'gal-advent': 'Adventi Vásár',
        'gal-galgaguta': 'Galgaguta'
    },
    en: {
        'nav-home': 'Home',
        'nav-about': 'About Us',
        'nav-gallery': 'Gallery ▾',
        'nav-summer': 'Summer',
        'nav-winter': 'Winter',
        'nav-contact': 'Contact Us',
        'hero-title': 'MERKABA COFFEE',
        'hero-subtitle': 'Mobile Coffee • Vintage La Cimbali • Piaggio Ape',
        'title-about': 'About Us',
        'about-para-1': 'Our little mobile café, Merkaba Coffee, began its adventurous journey on June 30, 2025, at the SUN Festival. Since then, we\'ve traveled to Manas, Microasis, Everness Indian Summer, Balatonakali - at the local Almond Festival, and Rétság at the Farmers\' Market.',
        'about-para-2': 'Currently, you can find our cozy little Piaggio, Merkaba Coffee, in the charming park between the post office and the church in Galgaguta.',
        'about-para-3': 'Merkaba is an ancient Egyptian sacred symbol representing the perfect harmony of body, mind, and spirit – a starlight "vehicle" that invites you on a spiritual journey. We see this magic in every cup of coffee.',
        'about-para-4': 'The secret to our coffee lies in our vintage two-handled La Cimbali machine – a true 1980s analog icon that passionately brews creamy espresso, cappuccino, and other delights.',
        'about-para-5': 'Our goal is to bring warmhearted moments to our guests with a delicious hot coffee, tea, or hot chocolate.',
        'about-para-6': 'Feel free to contact us if we\'ve sparked your interest, or visit us for a great coffee in Galgaguta.',
        'gallery-intro': 'Our Adventures',
        'summer-title': 'Summer 2025',
        'summer-desc': 'Summer was a time of freedom and endless roads for us. Sunny festivals and nature\'s embrace provided the backdrop for our coffee experiences.',
        'winter-title': 'Winter 2025',
        'winter-desc': 'Winter is a time of coziness. Among snowy hills, over hot coffee, we share the magic of winter warmth with our guests.',
        'title-menu': 'The Menu',
        'title-contact': 'Contact Us',
        'contact-subtitle': 'Adventure Locations',
        'contact-location': 'Currently in <strong>Galgaguta</strong>',
        'fest-sun': 'S.U.N. Festival',
        'caption-sun': 'S.U.N.',
        'fest-manas': 'Manas Festival',
        'fest-microasis': 'Microasis Festival',
        'fest-indian': 'Everness Indian Summer Festival',
        'caption-indian': 'Everness Indian Summer',
        'fest-mandula': 'Mandula Festival',
        'caption-mandula': 'Mandula Festival',
        'fest-advent': 'Advent Market',
        'caption-advent': 'Advent',
        'badge-coming': 'Coming Soon',
        'fest-galgaguta': 'Galgaguta',
        'caption-galgaguta': 'Galgaguta',
        'map-title': 'Adventures',
        'map-instruct': 'Click to activate map',
        'impressum-label': 'IMPRESSUM',
        'impressum-owner-label': 'Operator Details:',
        'label-name': 'Name',
        'label-address': 'Address',
        'label-hosting': 'Hosting',
        'label-copyright-title': 'Copyright:',
        'impressum-copyright-text': 'All content appearing on the website (text, images, music, graphics, logo) is the intellectual property of Merkaba Coffee. All rights reserved. Copying or using the content of the site is only possible with prior written permission.',
        'footer-rights': '© 2025 Merkaba Coffee. All rights reserved.',
        'gal-sun': 'S.U.N. Festival',
        'gal-manas': 'Manas Festival',
        'gal-microasis': 'Microasis Festival',
        'gal-indian': 'Everness Indian Summer',
        'gal-mandula': 'Mandula Festival',
        'gal-advent': 'Advent Market',
        'gal-galgaguta': 'Galgaguta'
    }
};

function initLanguage() {
    const savedLang = localStorage.getItem('merkaba-lang') || 'hu';
    setLanguage(savedLang);
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('merkaba-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`.lang-btn-${lang}`).forEach(btn => btn.classList.add('active'));

    if (!translations[lang]) return;
    for (const [id, text] of Object.entries(translations[lang])) {
        const elements = document.querySelectorAll(`[id="${id}"]`);
        elements.forEach(el => {
            el.innerHTML = text;
        });
    }

    // Update map if initialized
    if (leafMap) updateMapLanguage();

    // Update active gallery captions if they are visible
    updateVisibleGalleryCaptions();
}

function updateVisibleGalleryCaptions() {
    const lang = currentLanguage;
    Object.keys(galleries).forEach(galleryId => {
        const galleryElement = document.getElementById(`${galleryId}-gallery`);
        if (galleryElement) {
            const polaroidCaptions = galleryElement.querySelectorAll('.festival-name');
            const translationKey = `gal-${galleryId}`;
            const translatedText = translations[lang][translationKey] || galleryId;

            polaroidCaptions.forEach(cap => {
                cap.textContent = translatedText;
            });
        }
    });

    // Update lightbox if open
    if (document.getElementById('lightbox-modal').style.display === "block") {
        updateLightboxContent();
    }
}

// Gallery Data
const galleries = {
    sun: { images: ['assets/gallery/S.U.N./1.jpg', 'assets/gallery/S.U.N./2.jpg', 'assets/gallery/S.U.N./3.jpg', 'assets/gallery/S.U.N./4.jpg', 'assets/gallery/S.U.N./5.jpg', 'assets/gallery/S.U.N./6.jpg', 'assets/gallery/S.U.N./7.jpg', 'assets/gallery/S.U.N./8.JPG'], currentIndex: 0 },
    manas: { images: ['assets/gallery/Manas/1.jpeg', 'assets/gallery/Manas/2.JPG', 'assets/gallery/Manas/3.jpeg', 'assets/gallery/Manas/4.JPG', 'assets/gallery/Manas/5.JPG', 'assets/gallery/Manas/6.JPG', 'assets/gallery/Manas/7.JPG'], currentIndex: 0 },
    microasis: { images: ['assets/gallery/Microasis/1.jpg', 'assets/gallery/Microasis/2.JPG', 'assets/gallery/Microasis/3.JPG', 'assets/gallery/Microasis/4.JPG', 'assets/gallery/Microasis/5.JPG', 'assets/gallery/Microasis/6.jpg', 'assets/gallery/Microasis/7.JPG', 'assets/gallery/Microasis/8.JPG', 'assets/gallery/Microasis/9.JPG', 'assets/gallery/Microasis/10.JPG'], currentIndex: 0 },
    indian: { images: ['assets/gallery/Indian Summer/1.jpeg', 'assets/gallery/Indian Summer/2.jpeg', 'assets/gallery/Indian Summer/3.jpeg', 'assets/gallery/Indian Summer/4.jpeg', 'assets/gallery/Indian Summer/5.JPG', 'assets/gallery/Indian Summer/6.jpeg', 'assets/gallery/Indian Summer/7.jpeg', 'assets/gallery/Indian Summer/8.jpeg', 'assets/gallery/Indian Summer/9.jpeg', 'assets/gallery/Indian Summer/10.jpeg', 'assets/gallery/Indian Summer/10.1.jpeg', 'assets/gallery/Indian Summer/11.gif'], currentIndex: 0 },
    mandula: { images: ['assets/gallery/Mandula/1.jpeg', 'assets/gallery/Mandula/2.jpeg', 'assets/gallery/Mandula/7.JPG', 'assets/gallery/Mandula/8.jpeg'], currentIndex: 0 },
    advent: { images: ['assets/gallery/Advent/1.jpeg', 'assets/gallery/Advent/2.JPG', 'assets/gallery/Advent/3.JPG', 'assets/gallery/Advent/4.JPG'], currentIndex: 0 },
    galgaguta: { images: ['assets/gallery/Galgaguta/1.gif', 'assets/gallery/Galgaguta/2.JPG', 'assets/gallery/Galgaguta/3.JPG', 'assets/gallery/Galgaguta/5.JPG', 'assets/gallery/Galgaguta/6.JPG', 'assets/gallery/Galgaguta/7.1.JPG', 'assets/gallery/Galgaguta/8.JPG', 'assets/gallery/Galgaguta/9.JPG', 'assets/gallery/Galgaguta/10.JPG', 'assets/gallery/Galgaguta/11.JPG', 'assets/gallery/Galgaguta/12.JPG', 'assets/gallery/Galgaguta/13.JPG', 'assets/gallery/Galgaguta/14.JPG', 'assets/gallery/Galgaguta/15.JPG', 'assets/gallery/Galgaguta/16.JPG', 'assets/gallery/Galgaguta/17.JPG', 'assets/gallery/Galgaguta/18.JPG', 'assets/gallery/Galgaguta/19.JPG', 'assets/gallery/Galgaguta/20.JPG', 'assets/gallery/Galgaguta/21.JPG', 'assets/gallery/Galgaguta/22.JPG', 'assets/gallery/Galgaguta/23.JPG', 'assets/gallery/Galgaguta/24.JPG', 'assets/gallery/Galgaguta/25.JPG', 'assets/gallery/Galgaguta/26.JPG'], currentIndex: 0 }
};

let currentLightboxGallery = null;
let currentLightboxIndex = 0;

function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.getElementById('lb-prev');
    const nextBtn = document.getElementById('lb-next');

    document.querySelectorAll('.gallery-img').forEach((img) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            const container = e.target.closest('.polaroid-gallery-container');
            if (container) {
                const galleryId = container.id.split('-')[0];
                const gallery = galleries[galleryId];
                if (!gallery) return;

                const row = e.target.closest('.polaroids-row');
                const allImgsInRow = Array.from(row.querySelectorAll('.gallery-img'));
                const relativeIndex = allImgsInRow.indexOf(e.target);

                const realIndex = (gallery.currentIndex + relativeIndex) % gallery.images.length;
                openLightbox(galleryId, realIndex);
            }
        });
    });

    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }
    if (prevBtn) prevBtn.onclick = () => navigateLightbox(-1);
    if (nextBtn) nextBtn.onclick = () => navigateLightbox(1);

    // Touch Support for Mobile (Swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped Left -> Next Image
            navigateLightbox(1);
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped Right -> Previous Image
            navigateLightbox(-1);
        }
    }
}

function openLightbox(galleryId, index = null) {
    const gallery = galleries[galleryId];
    if (!gallery) return;
    currentLightboxGallery = galleryId;
    currentLightboxIndex = index !== null ? index : gallery.currentIndex;
    updateLightboxContent();
    document.getElementById('lightbox-modal').style.display = "block";
}

function updateLightboxContent() {
    const modal = document.getElementById('lightbox-modal');
    const gallery = galleries[currentLightboxGallery];
    const imgElement = document.getElementById('lightbox-img');
    const captionElement = document.getElementById('lightbox-caption-text');
    if (!imgElement) return;

    modal.classList.add('lightbox-loading');
    const imgPath = gallery.images[currentLightboxIndex];

    const tempImg = new Image();
    tempImg.onload = () => {
        imgElement.src = imgPath;
        modal.classList.remove('lightbox-loading');
    };
    tempImg.onerror = () => {
        modal.classList.remove('lightbox-loading');
        console.error("Failed to load image: " + imgPath);
    };
    tempImg.src = imgPath;

    if (captionElement) {
        const lang = currentLanguage;
        const translationKey = `gal-${currentLightboxGallery}`;
        captionElement.textContent = translations[lang][translationKey] || currentLightboxGallery;
    }

    // Preload next image in current direction
    const nextIdx = (currentLightboxIndex + 1) % gallery.images.length;
    const preloader = new Image();
    preloader.src = gallery.images[nextIdx];
}

function navigateLightbox(dir) {
    const gallery = galleries[currentLightboxGallery];
    currentLightboxIndex = (currentLightboxIndex + dir + gallery.images.length) % gallery.images.length;
    updateLightboxContent();
}

/**
 * Optimized Gallery Change with Fading and Preloading
 */
function changeGallery(galleryId, direction) {
    const gallery = galleries[galleryId];
    if (!gallery) return;

    const galleryElement = document.getElementById(`${galleryId}-gallery`);
    if (!galleryElement) return;

    const polaroidImages = galleryElement.querySelectorAll('.gallery-img');
    const polaroidCaptions = galleryElement.querySelectorAll('.festival-name');

    // Update index
    gallery.currentIndex = (gallery.currentIndex + direction + gallery.images.length) % gallery.images.length;

    // Preload the images we are about to switch to
    const imagesToLoad = [];
    polaroidImages.forEach((img, i) => {
        const imgIndex = (gallery.currentIndex + i) % gallery.images.length;
        imagesToLoad.push(gallery.images[imgIndex]);
    });

    // Apply fade-out
    polaroidImages.forEach(img => img.style.opacity = '0.3');

    // Wait for all next images to be ready before showing
    let loadedCount = 0;
    imagesToLoad.forEach((src, i) => {
        const tempImg = new Image();
        tempImg.onload = () => {
            loadedCount++;
            if (loadedCount === imagesToLoad.length) {
                // All loaded, update real images
                polaroidImages.forEach((img, j) => {
                    const idx = (gallery.currentIndex + j) % gallery.images.length;
                    img.src = gallery.images[idx];
                    img.style.opacity = '1';

                    if (polaroidCaptions[j]) {
                        const translationKey = `gal-${galleryId}`;
                        polaroidCaptions[j].textContent = translations[currentLanguage][translationKey] || galleryId;
                    }
                });
            }
        };
        tempImg.src = src;
    });
}

/**
 * Preloads the first few images of all galleries on launch
 */
function preloadInitialGalleryImages() {
    Object.keys(galleries).forEach(gid => {
        const gal = galleries[gid];
        // Preload first 6 images for each category
        for (let i = 0; i < Math.min(gal.images.length, 6); i++) {
            const img = new Image();
            img.src = gal.images[i];
        }
    });
}

function toggleImpressum() {
    const content = document.getElementById('impressum-content');
    const toggle = document.getElementById('impressum-toggle');
    if (content) content.classList.toggle('open');
    if (toggle) toggle.classList.toggle('open');
}
