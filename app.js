// Card definitions
const CARDS = {
    'black-lotus': { name: 'Black Lotus', image: 'static/black-lotus.webp' },
    'time-walk': { name: 'Time Walk', image: 'static/time-walk.webp' },
    'timetwister': { name: 'Timetwister', image: 'static/timetwister.webp' },
    'ancestral-recall': { name: 'Ancestral Recall', image: 'static/ancestral-recall.webp' },
    'mox-pearl': { name: 'Mox Pearl', image: 'static/mox-pearl.webp' },
    'mox-sapphire': { name: 'Mox Sapphire', image: 'static/mox-sapphire.webp' },
    'mox-jet': { name: 'Mox Jet', image: 'static/mox-jet.webp' },
    'mox-ruby': { name: 'Mox Ruby', image: 'static/mox-ruby.webp' },
    'mox-emerald': { name: 'Mox Emerald', image: 'static/mox-emerald.webp' },
    'placeholder': { name: 'Placeholder', image: 'static/placeholder.webp' },
    'card-back': { name: 'Card Back', image: 'static/card-back.webp' }
};

const POWER_9 = [
    'black-lotus',
    'time-walk',
    'timetwister',
    'ancestral-recall',
    'mox-pearl',
    'mox-sapphire',
    'mox-jet',
    'mox-ruby',
    'mox-emerald'
];

// Game state
const gameState = {
    library: [],
    hand: [],
    battlefield: [],
    graveyard: [],
    exile: []
};

// Menu configuration
let menuConfig = [];

// Drag state
let dragState = {
    active: false,
    cardId: null,
    sourceZone: null,
    sourceIndex: null,
    startX: 0,
    startY: 0
};

// Initialize game state with 99 placeholder cards
function initializeGameState() {
    // Clear all zones
    gameState.library = [];
    gameState.hand = [];
    gameState.battlefield = [];
    gameState.graveyard = [];
    gameState.exile = [];

    // Add 99 placeholder cards to library
    for (let i = 0; i < 99; i++) {
        gameState.library.push(new Card('placeholder'));
    }

    renderAllZones();
    saveGameState();
}

// Restart game - reset to initial state
function restartGame() {
    if (confirm('Restart game? This will reset all zones and add 99 placeholder cards to the library.')) {
        localStorage.removeItem('mtg-game-state');
        initializeGameState();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadMenuConfig();
    initializeEventListeners();

    // Try to load saved state, otherwise initialize fresh
    const savedState = localStorage.getItem('mtg-game-state');
    if (savedState) {
        loadGameState();
    } else {
        initializeGameState();
    }

    // Prevent context menu on all images to avoid mobile browser save dialogs
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
});

// Load menu configuration from YAML
async function loadMenuConfig() {
    try {
        const response = await fetch('menu-config.yaml');
        const yamlText = await response.text();
        menuConfig = parseYAML(yamlText);
        renderMenuItems();
    } catch (error) {
        console.error('Error loading menu config:', error);
        // Fallback to hardcoded menu
        menuConfig = getDefaultMenuConfig();
        renderMenuItems();
    }
}

// Simple YAML parser for our menu config
function parseYAML(yamlText) {
    const items = [];
    const lines = yamlText.split('\n');
    let currentItem = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- id:')) {
            if (currentItem) items.push(currentItem);
            currentItem = { id: trimmed.replace('- id:', '').trim() };
        } else if (trimmed.startsWith('label:') && currentItem) {
            currentItem.label = trimmed.replace('label:', '').trim().replace(/['"]/g, '');
        } else if (trimmed.startsWith('action:') && currentItem) {
            currentItem.action = trimmed.replace('action:', '').trim();
        }
    }
    if (currentItem) items.push(currentItem);
    return items;
}

// Default menu configuration
function getDefaultMenuConfig() {
    return [
        { id: 'restart', label: 'Restart Game', action: 'restart' },
        { id: 'oracle-etb', label: 'Oracle ETB Effect', action: 'oracleETB' },
        { id: 'shuffle-library', label: 'Shuffle Library', action: 'shuffleLibrary' },
        { id: 'timetwister', label: 'Timetwister', action: 'timetwister' },
        { id: 'scry', label: 'Scry X', action: 'scry' },
        { id: 'surveil', label: 'Surveil X', action: 'surveil' },
        { id: 'draw', label: 'Draw X', action: 'draw' },
        { id: 'exile-graveyard', label: 'Exile Graveyard', action: 'exileGraveyard' }
    ];
}

// Render menu items
function renderMenuItems() {
    const container = document.getElementById('menu-items');
    container.innerHTML = '';

    menuConfig.forEach(item => {
        const button = document.createElement('button');
        button.className = 'menu-item';
        button.textContent = item.label;
        button.onclick = () => executeMenuAction(item.action);
        container.appendChild(button);
    });
}

// Execute menu action
function executeMenuAction(action) {
    closeModal('overflow-menu');

    const actions = {
        restart: restartGame,
        oracleETB: oracleETB,
        shuffleLibrary: shuffleLibrary,
        viewLibrary: () => viewZone('library'),
        viewGraveyard: () => viewZone('graveyard'),
        viewExile: () => viewZone('exile'),
        timetwister: timetwisterAction,
        scry: () => openScryModal('scry'),
        surveil: () => openScryModal('surveil'),
        draw: openDrawModal,
        exileGraveyard: exileGraveyardAction
    };

    if (actions[action]) {
        actions[action]();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Overflow button
    document.getElementById('overflow-btn').addEventListener('click', () => {
        openModal('overflow-menu');
    });

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Modal backdrop clicks
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Scry modal
    document.getElementById('scry-submit').addEventListener('click', handleScrySubmit);
    document.getElementById('scry-confirm').addEventListener('click', handleScryConfirm);

    // Draw modal
    document.getElementById('draw-submit').addEventListener('click', handleDrawSubmit);

    // Zone drag and drop
    setupZoneDragAndDrop();
}

// Setup drag and drop for zones
function setupZoneDragAndDrop() {
    const zones = document.querySelectorAll('.zone');

    zones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.add('drag-over');
}

function handleDragLeave(e) {
    const zone = e.currentTarget;
    if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('drag-over');

    const targetZone = zone.dataset.zone;
    const data = e.dataTransfer.getData('text/plain');

    if (data) {
        const { cardId, sourceZone, sourceIndex } = JSON.parse(data);
        moveCard(sourceZone, sourceIndex, targetZone);
    }
}

// Card class for managing individual cards
class Card {
    constructor(cardId) {
        this.id = cardId;
        this.data = CARDS[cardId];
    }

    getImage() {
        return this.data.image;
    }

    getName() {
        return this.data.name;
    }
}

// Zone operations
function addCardToZone(zone, cardId, position = 'top') {
    const card = new Card(cardId);

    if (position === 'top') {
        gameState[zone].unshift(card);
    } else {
        gameState[zone].push(card);
    }

    renderZone(zone);
}

function removeCardFromZone(zone, index) {
    const card = gameState[zone][index];
    gameState[zone].splice(index, 1);
    renderZone(zone);
    return card;
}

function moveCard(fromZone, fromIndex, toZone, toPosition = 'top') {
    const card = removeCardFromZone(fromZone, fromIndex);

    if (toPosition === 'top') {
        gameState[toZone].unshift(card);
    } else {
        gameState[toZone].push(card);
    }

    renderZone(toZone);
    saveGameState();
}

function shuffleZone(zone) {
    const array = gameState[zone];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    renderZone(zone);
    saveGameState();
}

// Render functions
function renderAllZones() {
    ['library', 'hand', 'battlefield', 'graveyard', 'exile'].forEach(zone => {
        renderZone(zone);
    });
}

function renderZone(zoneName) {
    const zone = document.querySelector(`[data-zone="${zoneName}"]`);
    if (!zone) return;

    const cards = gameState[zoneName];

    if (zoneName === 'library') {
        renderLibrary(zone, cards);
    } else if (zoneName === 'graveyard' || zoneName === 'exile') {
        renderSingleCardZone(zone, cards);
    } else {
        renderMultiCardZone(zone, cards, zoneName);
    }
}

function renderLibrary(zone, cards) {
    const container = zone.querySelector('.card-container');
    const countElement = zone.querySelector('.card-count');

    container.innerHTML = '';
    countElement.textContent = cards.length;

    if (cards.length > 0) {
        const img = document.createElement('img');
        img.src = CARDS['card-back'].image;
        img.alt = 'Library';
        img.draggable = true;
        img.addEventListener('dragstart', (e) => handleCardDragStart(e, 'library', 0));

        // Touch support
        img.addEventListener('touchstart', (e) => handleTouchStart(e, 'library', 0));

        container.appendChild(img);
    }
}

function renderSingleCardZone(zone, cards) {
    const container = zone.querySelector('.card-container');
    const countElement = zone.querySelector('.card-count');
    const zoneName = zone.dataset.zone;

    container.innerHTML = '';
    countElement.textContent = cards.length;

    if (cards.length > 0) {
        const topCard = cards[0];
        const img = document.createElement('img');
        img.src = topCard.getImage();
        img.alt = topCard.getName();
        img.draggable = true;
        img.addEventListener('dragstart', (e) => handleCardDragStart(e, zoneName, 0));

        // Touch support
        img.addEventListener('touchstart', (e) => handleTouchStart(e, zoneName, 0));

        container.appendChild(img);
    }
}

function renderMultiCardZone(zone, cards, zoneName) {
    const grid = zone.querySelector('.card-grid');
    grid.innerHTML = '';

    // Group cards by ID
    const cardCounts = {};
    cards.forEach(card => {
        if (!cardCounts[card.id]) {
            cardCounts[card.id] = { card, count: 0, indices: [] };
        }
        cardCounts[card.id].count++;
        cardCounts[card.id].indices.push(cards.indexOf(card));
    });

    // Render each unique card with count
    Object.values(cardCounts).forEach(({ card, count, indices }) => {
        const stack = document.createElement('div');
        stack.className = 'card-stack';
        stack.draggable = true;

        const img = document.createElement('img');
        img.src = card.getImage();
        img.alt = card.getName();
        stack.appendChild(img);

        if (count > 1) {
            const badge = document.createElement('div');
            badge.className = 'card-badge';
            badge.textContent = count;
            stack.appendChild(badge);
        }

        stack.addEventListener('dragstart', (e) => handleCardDragStart(e, zoneName, indices[0]));

        // Touch support
        stack.addEventListener('touchstart', (e) => handleTouchStart(e, zoneName, indices[0]));

        grid.appendChild(stack);
    });
}

// Drag and drop handlers
function handleCardDragStart(e, zone, index) {
    const data = {
        cardId: gameState[zone][index].id,
        sourceZone: zone,
        sourceIndex: index
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
}

// Touch support for mobile
function handleTouchStart(e, zone, index) {
    // Allow two-finger scroll - don't prevent default or start drag
    if (e.touches.length > 1) {
        return;
    }

    e.preventDefault();

    const touch = e.touches[0];
    const card = gameState[zone][index];

    dragState = {
        active: true,
        cardId: card.id,
        sourceZone: zone,
        sourceIndex: index,
        startX: touch.clientX,
        startY: touch.clientY
    };

    // Show drag preview
    const preview = document.getElementById('drag-preview');
    preview.innerHTML = `<img src="${card.getImage()}" alt="${card.getName()}">`;
    preview.classList.remove('hidden');
    preview.style.left = touch.clientX + 'px';
    preview.style.top = touch.clientY + 'px';

    // Add touch move and end listeners
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
}

function handleTouchMove(e) {
    if (!dragState.active) return;

    // Allow two-finger scroll
    if (e.touches.length > 1) {
        return;
    }

    const touch = e.touches[0];
    const preview = document.getElementById('drag-preview');
    preview.style.left = touch.clientX + 'px';
    preview.style.top = touch.clientY + 'px';

    // Highlight zone under touch
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = element?.closest('.zone');

    document.querySelectorAll('.zone').forEach(z => z.classList.remove('drag-over'));
    if (zone) {
        zone.classList.add('drag-over');
    }
}

function handleTouchEnd(e) {
    if (!dragState.active) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = element?.closest('.zone');

    if (zone) {
        const targetZone = zone.dataset.zone;
        moveCard(dragState.sourceZone, dragState.sourceIndex, targetZone);
    }

    // Clean up
    document.querySelectorAll('.zone').forEach(z => z.classList.remove('drag-over'));
    const preview = document.getElementById('drag-preview');
    preview.classList.add('hidden');
    preview.innerHTML = '';

    dragState = { active: false, cardId: null, sourceZone: null, sourceIndex: null };

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
}

// View card touch support with tap-and-hold
let viewCardTouchState = {
    timeout: null,
    element: null,
    zone: null,
    index: null,
    startX: 0,
    startY: 0,
    isDragging: false
};

function handleViewCardTouchStart(e, zone, index) {
    // Allow two-finger scroll
    if (e.touches.length > 1) {
        return;
    }

    const touch = e.touches[0];
    const element = e.currentTarget;

    viewCardTouchState.element = element;
    viewCardTouchState.zone = zone;
    viewCardTouchState.index = index;
    viewCardTouchState.startX = touch.clientX;
    viewCardTouchState.startY = touch.clientY;
    viewCardTouchState.isDragging = false;

    // Start a timer for long press (250ms)
    viewCardTouchState.timeout = setTimeout(() => {
        // Long press detected - start drag
        e.preventDefault();
        viewCardTouchState.isDragging = true;

        const card = gameState[zone][index];

        dragState = {
            active: true,
            cardId: card.id,
            sourceZone: zone,
            sourceIndex: index,
            startX: touch.clientX,
            startY: touch.clientY
        };

        // Show drag preview
        const preview = document.getElementById('drag-preview');
        preview.innerHTML = `<img src="${card.getImage()}" alt="${card.getName()}">`;
        preview.classList.remove('hidden');
        preview.style.left = touch.clientX + 'px';
        preview.style.top = touch.clientY + 'px';

        // Add visual feedback
        element.style.opacity = '0.5';

        // Close the modal
        closeModal('view-zone-modal');
    }, 250);

    document.addEventListener('touchmove', handleViewCardTouchMove, { passive: false });
    document.addEventListener('touchend', handleViewCardTouchEnd);
}

function handleViewCardTouchMove(e) {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - viewCardTouchState.startX);
    const deltaY = Math.abs(touch.clientY - viewCardTouchState.startY);

    // If user moves finger significantly before long press completes, cancel it (allow scroll)
    if (!viewCardTouchState.isDragging && (deltaX > 10 || deltaY > 10)) {
        clearTimeout(viewCardTouchState.timeout);
        if (viewCardTouchState.element) {
            viewCardTouchState.element.style.opacity = '1';
        }
        return;
    }

    // If dragging has started, handle the drag
    if (viewCardTouchState.isDragging && dragState.active) {
        e.preventDefault();
        handleTouchMove(e);
    }
}

function handleViewCardTouchEnd(e) {
    // Clear the timeout
    clearTimeout(viewCardTouchState.timeout);

    // Reset opacity
    if (viewCardTouchState.element) {
        viewCardTouchState.element.style.opacity = '1';
    }

    // If dragging, handle the drop
    if (viewCardTouchState.isDragging && dragState.active) {
        handleTouchEnd(e);
    }

    // Clean up
    viewCardTouchState = {
        timeout: null,
        element: null,
        zone: null,
        index: null,
        startX: 0,
        startY: 0,
        isDragging: false
    };

    document.removeEventListener('touchmove', handleViewCardTouchMove);
    document.removeEventListener('touchend', handleViewCardTouchEnd);
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');

    // Reset scry input modal
    if (modalId === 'scry-input-modal') {
        document.getElementById('scry-number').value = '1';
    }

    // Reset scry arrange modal
    if (modalId === 'scry-arrange-modal') {
        document.getElementById('scry-cards').innerHTML = '';
        document.getElementById('scry-top').innerHTML = '';
        document.getElementById('scry-bottom').innerHTML = '';
    }
}

// Menu actions
function oracleETB() {
    POWER_9.forEach(cardId => {
        addCardToZone('library', cardId, 'bottom');
    });
    shuffleZone('library');
    // saveGameState is called by shuffleZone
}

function shuffleLibrary() {
    if (gameState.library.length === 0) {
        alert('Library is empty - nothing to shuffle.');
        return;
    }
    shuffleZone('library');
}

function viewZone(zoneName) {
    const modal = document.getElementById('view-zone-modal');
    const title = document.getElementById('view-zone-title');
    const container = document.getElementById('view-zone-cards');

    title.textContent = `View ${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)}`;
    container.innerHTML = '';

    const cards = gameState[zoneName];

    // Group cards
    const cardCounts = {};
    cards.forEach((card, index) => {
        if (!cardCounts[card.id]) {
            cardCounts[card.id] = { card, count: 0, indices: [] };
        }
        cardCounts[card.id].count++;
        cardCounts[card.id].indices.push(index);
    });

    // Render cards (showing library order if it's the library)
    if (zoneName === 'library') {
        cards.forEach((card, index) => {
            const cardDiv = createViewCardElement(card, zoneName, index, false);
            container.appendChild(cardDiv);
        });
    } else {
        Object.values(cardCounts).forEach(({ card, count, indices }) => {
            const cardDiv = createViewCardElement(card, zoneName, indices[0], count > 1 ? count : null);
            container.appendChild(cardDiv);
        });
    }

    openModal('view-zone-modal');
}

function createViewCardElement(card, zone, index, count) {
    const div = document.createElement('div');
    div.className = 'view-card-stack';
    div.draggable = true;

    const img = document.createElement('img');
    img.src = card.getImage();
    img.alt = card.getName();
    div.appendChild(img);

    if (count) {
        const badge = document.createElement('div');
        badge.className = 'view-card-badge';
        badge.textContent = `x${count}`;
        div.appendChild(badge);
    }

    div.addEventListener('dragstart', (e) => {
        handleCardDragStart(e, zone, index);
        // Set up listener to close modal when drag leaves modal bounds
        setupViewModalDragListener();
    });
    div.addEventListener('touchstart', (e) => handleViewCardTouchStart(e, zone, index));

    return div;
}

// Track if we're dragging from view modal
let viewModalDragListener = null;

function setupViewModalDragListener() {
    const modal = document.getElementById('view-zone-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Remove any existing listener
    if (viewModalDragListener) {
        document.removeEventListener('drag', viewModalDragListener);
    }

    viewModalDragListener = (e) => {
        // Check if drag position is outside modal content
        const rect = modalContent.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        // If coordinates are valid and outside modal, close it
        if (x !== 0 && y !== 0) {
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                closeModal('view-zone-modal');
                // Clean up listener
                document.removeEventListener('drag', viewModalDragListener);
                viewModalDragListener = null;
            }
        }
    };

    document.addEventListener('drag', viewModalDragListener);

    // Also listen for dragend to clean up
    const cleanupListener = () => {
        if (viewModalDragListener) {
            document.removeEventListener('drag', viewModalDragListener);
            viewModalDragListener = null;
        }
        document.removeEventListener('dragend', cleanupListener);
    };
    document.addEventListener('dragend', cleanupListener);
}

function timetwisterAction() {
    // Move hand to library
    while (gameState.hand.length > 0) {
        const card = gameState.hand.shift();
        gameState.library.push(card);
    }

    // Move graveyard to library
    while (gameState.graveyard.length > 0) {
        const card = gameState.graveyard.shift();
        gameState.library.push(card);
    }

    // Shuffle library
    shuffleZone('library');

    // Draw 7 cards
    for (let i = 0; i < 7 && gameState.library.length > 0; i++) {
        const card = gameState.library.shift();
        gameState.hand.push(card);
    }

    renderAllZones();
    saveGameState();
}

function openScryModal(type) {
    const modal = document.getElementById('scry-input-modal');
    const title = document.getElementById('scry-input-title');

    title.textContent = type === 'scry' ? 'Scry X' : 'Surveil X';

    modal.dataset.scryType = type;
    openModal('scry-input-modal');
}

function handleScrySubmit() {
    const number = parseInt(document.getElementById('scry-number').value);
    const type = document.getElementById('scry-input-modal').dataset.scryType;

    if (number < 1 || number > gameState.library.length) {
        alert(`Invalid number. Library has ${gameState.library.length} cards.`);
        return;
    }

    // Close input modal
    closeModal('scry-input-modal');

    // Get top N cards
    const cards = gameState.library.slice(0, number);

    // Set up arrange modal
    const arrangeModal = document.getElementById('scry-arrange-modal');
    const arrangeTitle = document.getElementById('scry-arrange-title');
    const bottomLabel = document.getElementById('scry-bottom-label');

    arrangeTitle.textContent = type === 'scry' ? 'Scry' : 'Surveil';
    bottomLabel.textContent = type === 'scry' ? 'Bottom of library' : 'Graveyard';
    arrangeModal.dataset.scryType = type;

    // Render cards
    const container = document.getElementById('scry-cards');
    container.innerHTML = '';
    container.dataset.scryCount = number;

    cards.forEach((card, index) => {
        const cardDiv = createScryCardElement(card, index);
        container.appendChild(cardDiv);
    });

    // Clear destination areas
    document.getElementById('scry-top').innerHTML = '';
    document.getElementById('scry-bottom').innerHTML = '';

    // Open arrange modal
    openModal('scry-arrange-modal');
}

function createScryCardElement(card, index) {
    const div = document.createElement('div');
    div.className = 'scry-card';
    div.draggable = true;
    div.dataset.cardIndex = index;

    const img = document.createElement('img');
    img.src = card.getImage();
    img.alt = card.getName();
    div.appendChild(img);

    div.addEventListener('dragstart', handleScryCardDragStart);
    div.addEventListener('dragover', handleScryCardDragOver);
    div.addEventListener('drop', handleScryCardDrop);

    // Touch support
    div.addEventListener('touchstart', handleScryTouchStart);

    return div;
}

let scryDragState = { element: null, placeholder: null };

function handleScryCardDragStart(e) {
    scryDragState.element = e.target.closest('.scry-card');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleScryCardDragOver(e) {
    e.preventDefault();
    const target = e.target.closest('.scry-card, .scry-destination');
    if (!target) return;

    if (target.classList.contains('scry-destination')) {
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleScryCardDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target.closest('.scry-destination');
    if (target && scryDragState.element) {
        target.appendChild(scryDragState.element);
    }
}

let scryTouchState = {
    element: null,
    startX: 0,
    startY: 0,
    clone: null,
    timeout: null,
    isDragging: false
};

function handleScryTouchStart(e) {
    const card = e.target.closest('.scry-card');
    if (!card) return;

    // Allow two-finger scroll - don't prevent default or start drag
    if (e.touches.length > 1) {
        return;
    }

    const touch = e.touches[0];
    scryTouchState.element = card;
    scryTouchState.startX = touch.clientX;
    scryTouchState.startY = touch.clientY;
    scryTouchState.isDragging = false;

    // Start a timer for long press (250ms)
    scryTouchState.timeout = setTimeout(() => {
        // Long press detected - start drag
        e.preventDefault();
        scryTouchState.isDragging = true;

        // Create a clone for visual feedback
        scryTouchState.clone = card.cloneNode(true);
        scryTouchState.clone.style.position = 'fixed';
        scryTouchState.clone.style.pointerEvents = 'none';
        scryTouchState.clone.style.opacity = '0.8';
        scryTouchState.clone.style.zIndex = '10000';
        scryTouchState.clone.style.left = touch.clientX - 40 + 'px';
        scryTouchState.clone.style.top = touch.clientY - 60 + 'px';
        scryTouchState.clone.style.width = '80px';
        document.body.appendChild(scryTouchState.clone);

        // Make original semi-transparent
        card.style.opacity = '0.3';
    }, 250);

    document.addEventListener('touchmove', handleScryTouchMove, { passive: false });
    document.addEventListener('touchend', handleScryTouchEnd);
}

function handleScryTouchMove(e) {
    if (!scryTouchState.element) return;

    // Allow two-finger scroll
    if (e.touches.length > 1) {
        return;
    }

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - scryTouchState.startX);
    const deltaY = Math.abs(touch.clientY - scryTouchState.startY);

    // If user moves finger significantly before long press completes, cancel it (allow scroll)
    if (!scryTouchState.isDragging && (deltaX > 10 || deltaY > 10)) {
        clearTimeout(scryTouchState.timeout);
        if (scryTouchState.element) {
            scryTouchState.element.style.opacity = '1';
        }
        return;
    }

    // If dragging has started, handle the drag
    if (scryTouchState.isDragging && scryTouchState.clone) {
        e.preventDefault();
        scryTouchState.clone.style.left = touch.clientX - 40 + 'px';
        scryTouchState.clone.style.top = touch.clientY - 60 + 'px';

        // Highlight destination under touch
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const destination = element?.closest('.scry-destination');

        document.querySelectorAll('.scry-destination').forEach(d => {
            d.style.background = '';
            d.style.borderColor = '';
        });

        if (destination) {
            destination.style.background = '#c8e6c9';
            destination.style.borderColor = '#4caf50';
        }
    }
}

function handleScryTouchEnd(e) {
    if (!scryTouchState.element) return;

    // Clear the timeout
    clearTimeout(scryTouchState.timeout);

    // Reset visual state
    scryTouchState.element.style.opacity = '1';

    // If dragging was active, handle the drop
    if (scryTouchState.isDragging) {
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const destination = element?.closest('.scry-destination, .scry-cards');

        if (destination) {
            destination.appendChild(scryTouchState.element);
        }
    }

    // Clean up
    if (scryTouchState.clone) {
        scryTouchState.clone.remove();
    }

    document.querySelectorAll('.scry-destination').forEach(d => {
        d.style.background = '';
        d.style.borderColor = '';
    });

    scryTouchState = {
        element: null,
        startX: 0,
        startY: 0,
        clone: null,
        timeout: null,
        isDragging: false
    };

    document.removeEventListener('touchmove', handleScryTouchMove);
    document.removeEventListener('touchend', handleScryTouchEnd);
}

// Setup drag and drop for scry destinations
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scry-destination').forEach(dest => {
        dest.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        dest.addEventListener('drop', (e) => {
            e.preventDefault();
            if (scryDragState.element) {
                dest.appendChild(scryDragState.element);
            }
        });
    });
});

function handleScryConfirm() {
    const type = document.getElementById('scry-arrange-modal').dataset.scryType;
    const count = parseInt(document.getElementById('scry-cards').dataset.scryCount);

    // Store the cards temporarily before removing from library
    const scryCards = [];
    for (let i = 0; i < count; i++) {
        scryCards.push(gameState.library.shift());
    }

    // Get cards from destinations
    const topCards = Array.from(document.getElementById('scry-top').querySelectorAll('.scry-card'));
    const bottomCards = Array.from(document.getElementById('scry-bottom').querySelectorAll('.scry-card'));
    const remainingCards = Array.from(document.getElementById('scry-cards').querySelectorAll('.scry-card'));

    // Re-add based on destinations
    // Top cards go back to top of library in reverse order (last added = top)
    topCards.reverse().forEach(cardDiv => {
        const index = parseInt(cardDiv.dataset.cardIndex);
        gameState.library.unshift(scryCards[index]);
    });

    if (type === 'scry') {
        // Bottom cards go to bottom of library
        bottomCards.forEach(cardDiv => {
            const index = parseInt(cardDiv.dataset.cardIndex);
            gameState.library.push(scryCards[index]);
        });
        // Remaining cards also go to bottom
        remainingCards.forEach(cardDiv => {
            const index = parseInt(cardDiv.dataset.cardIndex);
            gameState.library.push(scryCards[index]);
        });
    } else {
        // Surveil: bottom cards and remaining go to graveyard
        bottomCards.forEach(cardDiv => {
            const index = parseInt(cardDiv.dataset.cardIndex);
            gameState.graveyard.unshift(scryCards[index]);
        });
        remainingCards.forEach(cardDiv => {
            const index = parseInt(cardDiv.dataset.cardIndex);
            gameState.graveyard.unshift(scryCards[index]);
        });
    }

    renderAllZones();
    saveGameState();
    closeModal('scry-arrange-modal');
}

function openDrawModal() {
    openModal('draw-modal');
}

function handleDrawSubmit() {
    const number = parseInt(document.getElementById('draw-number').value);

    if (number < 1) {
        alert('Please enter a valid number.');
        return;
    }

    if (number > gameState.library.length) {
        alert(`Cannot draw ${number} cards. Library has ${gameState.library.length} cards.`);
        return;
    }

    for (let i = 0; i < number; i++) {
        const card = gameState.library.shift();
        gameState.hand.push(card);
    }

    renderAllZones();
    saveGameState();
    closeModal('draw-modal');
}

function exileGraveyardAction() {
    while (gameState.graveyard.length > 0) {
        const card = gameState.graveyard.shift();
        gameState.exile.unshift(card);
    }
    renderAllZones();
    saveGameState();
}

// Save and load game state
function saveGameState() {
    const state = {
        library: gameState.library.map(c => c.id),
        hand: gameState.hand.map(c => c.id),
        battlefield: gameState.battlefield.map(c => c.id),
        graveyard: gameState.graveyard.map(c => c.id),
        exile: gameState.exile.map(c => c.id)
    };
    localStorage.setItem('mtg-game-state', JSON.stringify(state));
}

function loadGameState() {
    const saved = localStorage.getItem('mtg-game-state');
    if (saved) {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(zone => {
            gameState[zone] = state[zone].map(id => new Card(id));
        });
        renderAllZones();
    }
}
