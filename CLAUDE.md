# Oracle of the Alpha - Implementation Documentation

## Overview

This is a web-based game state manager for Magic: the Gathering games that use the card "Oracle of the Alpha". The application is designed to track the Power 9 cards that Oracle generates and manage them across different game zones, even when the physical game becomes unwieldy.

## Architecture

The application is built as a single-page application (SPA) using vanilla JavaScript, HTML5, and CSS3. It's designed to be deployed as static content on GitHub Pages.

### File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js              # Game logic and state management
├── menu-config.yaml    # Configurable overflow menu items
├── static/             # Card images
│   ├── black-lotus.webp
│   ├── time-walk.webp
│   ├── timetwister.webp
│   ├── ancestral-recall.webp
│   ├── mox-pearl.webp
│   ├── mox-sapphire.webp
│   ├── mox-jet.webp
│   ├── mox-ruby.webp
│   ├── mox-emerald.webp
│   ├── placeholder.webp
│   └── card-back.webp
└── README.md           # User documentation
```

## Key Components

### 1. Game State Management

The game state is managed through a central `gameState` object that tracks cards in each zone:

```javascript
const gameState = {
    library: [],      // Ordered array of cards
    hand: [],         // Cards in hand
    battlefield: [],  // Cards on battlefield
    graveyard: [],    // Cards in graveyard
    exile: []         // Exiled cards
};
```

Each card is represented by a `Card` class instance that stores:
- Card ID (e.g., 'black-lotus', 'mox-sapphire')
- Card data (name and image path)

### 2. Zone Types

The application handles two types of zones:

**Single Card Zones** (Library, Graveyard, Exile):
- Display only the top card (library shows card back)
- Show total card count
- Cards can be dragged from these zones

**Multi Card Zones** (Hand, Battlefield):
- Display all unique cards with count badges
- Cards are grouped by type and shown in a horizontal grid
- Support for overlapping to fit mobile screens

### 3. Drag and Drop System

The application implements both desktop and mobile drag-and-drop:

**Desktop (Mouse)**:
- Uses HTML5 Drag and Drop API
- Cards set data transfer with source zone and index
- Zones handle dragover, drop, and dragleave events
- Visual feedback with `drag-over` class

**Mobile (Touch)**:
- Custom touch event handlers (touchstart, touchmove, touchend)
- Displays a floating preview element during drag
- Detects drop zone using `elementFromPoint`
- Full touch support for all game actions

### 4. Card Movement

Cards are moved between zones using these core operations:

- `addCardToZone(zone, cardId, position)` - Add a card to a zone
- `removeCardFromZone(zone, index)` - Remove and return a card
- `moveCard(fromZone, fromIndex, toZone, toPosition)` - Move between zones
- `shuffleZone(zone)` - Randomly reorder a zone (Fisher-Yates shuffle)

### 5. Overflow Menu System

The overflow menu is configurable via `menu-config.yaml`. Menu items are:

1. **Oracle ETB Effect** - Adds one of each Power 9 to library and shuffles
2. **View Library/Graveyard/Exile** - Opens modal to view full zone contents
3. **Timetwister** - Moves hand and graveyard to library, shuffles, draws 7
4. **Scry X** - Look at top X cards, put them on top or bottom
5. **Surveil X** - Look at top X cards, put them on top or in graveyard
6. **Draw X** - Draw X cards from library to hand
7. **Exile Graveyard** - Move all graveyard cards to exile

Menu configuration uses a simple YAML format:
```yaml
- id: unique-id
  label: Display Label
  action: functionName
```

### 6. Modal System

The application uses multiple modal dialogs:

**Overflow Menu Modal**:
- Lists all available actions
- Scrollable for unlimited menu items
- Click outside or close button to dismiss

**View Zone Modal**:
- Shows all cards in a zone
- Cards are draggable to other zones
- For library, maintains and displays order
- For other zones, groups duplicates

**Scry/Surveil Modal**:
- Two-step process: input number, then arrange cards
- Displays cards from library
- Drag cards to destination areas (top/bottom or top/graveyard)
- Maintains card order based on placement
- Confirms and updates game state

**Draw Modal**:
- Simple input for number of cards
- Validates against library size
- Immediately moves cards to hand

### 7. Rendering System

The rendering system uses a zone-based approach:

```javascript
renderZone(zoneName) → calls specific renderer
  ├── renderLibrary() - Shows card back with count
  ├── renderSingleCardZone() - Shows top card face-up
  └── renderMultiCardZone() - Shows all unique cards with badges
```

Cards are grouped by ID and displayed with count badges when duplicates exist. This reduces visual clutter while maintaining full game state.

### 8. Mobile-First Design

The CSS implements mobile-first responsive design:

- Grid layout that adapts to screen size
- Touch-friendly targets (minimum 44x44px)
- Prevents unwanted zoom and scrolling
- Landscape orientation support
- Reduced padding/gaps on smaller screens
- Overflow scrolling for zones with many cards

### 9. Visual Design

The UI features a modern, clean aesthetic:

- Gradient background (blue tones)
- Glassmorphism effects (backdrop-filter blur)
- Subtle shadows and borders
- Smooth transitions and hover effects
- Color-coded feedback (green for valid drop zones)
- Responsive typography

### 10. Future Enhancement Points

The codebase is designed for extension:

**Planned Features**:
- `saveGameState()` / `loadGameState()` functions (already implemented)
- Local storage persistence
- Undo/redo functionality
- Game history tracking
- Additional game actions via menu config

**Extension Pattern**:
To add a new menu action:
1. Add function to `app.js`
2. Add action mapping in `executeMenuAction()`
3. Add entry to `menu-config.yaml`

## Technical Decisions

### Why Vanilla JavaScript?
- No build process required
- Simple deployment to GitHub Pages
- Fast load times
- No dependencies to maintain
- Full control over mobile behavior

### Why YAML for Config?
- Human-readable
- Easy to reorder items
- Simple parsing for limited use case
- Falls back to hardcoded menu if file unavailable

### Why WebP for Images?
- Smaller file sizes
- Good browser support
- Faster loading on mobile

### Why Touch Events Instead of Pointer Events?
- More precise control for mobile dragging
- Better performance on iOS
- Easier to implement custom drag preview
- Compatible with all mobile browsers

## Performance Considerations

- Cards are rendered on-demand per zone
- Efficient array operations (unshift/shift for top, push/pop for bottom)
- Event delegation where possible
- CSS transitions for smooth animations
- Minimal DOM manipulation
- Images preloaded by browser

## Browser Compatibility

Tested and working on:
- iOS Safari (primary target)
- Chrome Mobile
- Firefox Mobile
- Desktop browsers (Chrome, Firefox, Safari, Edge)

Minimum requirements:
- ES6 JavaScript support
- CSS Grid and Flexbox
- HTML5 Drag and Drop API
- Touch Events API
- CSS backdrop-filter (graceful degradation)

## Known Limitations

1. Library order is not visually intuitive in the view modal (shows as list)
2. No undo functionality
3. No game state persistence (refresh loses state)
4. No multiplayer support
5. Scry/Surveil drag-and-drop on mobile uses confirmation dialogs
6. No accessibility features (ARIA labels, keyboard navigation)

## Code Organization

The JavaScript is organized into logical sections:

1. **Constants & State** - Card definitions, game state, drag state
2. **Initialization** - DOMContentLoaded, event setup
3. **Config Loading** - YAML parsing, menu rendering
4. **Core Operations** - Card movement, zone manipulation
5. **Rendering** - Zone-specific render functions
6. **Drag & Drop** - Mouse and touch handlers
7. **Modal Management** - Open/close, content updates
8. **Game Actions** - Oracle ETB, Timetwister, Scry, etc.
9. **Utilities** - Save/load (for future use)

This organization makes it easy to find and modify specific functionality.

## Deployment

The application is designed for GitHub Pages deployment:

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source
4. Access via `https://username.github.io/repository-name`

No build step or server-side code required.
