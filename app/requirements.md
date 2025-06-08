The tool is a website that supports playing the game of Magic: the Gathering by virtualising the game state on a webpage.
The tool simulates one player's game state only
- A decklist is provided in the path "./deck/decklist.txt"
    - The decklist is formatted as follows: <formatting>
    - Each line in the decklist.txt file represents a card image available in the "./deck/static" directory
- The website must visually track the following zones:
    - Library (or deck)
    - Hand
    - Battlefield (or active zone)
    - Graveyard
    - Exile

- The following terminology applies throughout this document:
    - "Shuffle" means "randomly order the contents of the Library"
    - "Draw" means "zone transition the top card of the Library to the Hand"


The purpose of the tool is to manage the state of the game as it is played on paper. The tool will manage which cards are in which zones and enable common game actions which will be replicated in real life by the player using the tool.

The tool should visualise the cards in each zone in the way described below for that zone. The cards should be displayed by rendering the image from the "./deck/static" directory that corresponds to the name of the card in the decklist. In general, any time a card is visible, it can be selected and a zone transition performed. A card can be zone transitioned to any zone from any zone by the tool.
In some circumstances, a pop-over displaying cards may be needed. When this happens, clicking outside of the pop-over or clicking a "close" button on the pop-over should dismiss it with no further effects other than zone transitions applied to the cards in the pop-over.
Each zone should have a visual indicator to distinguish it from other zones. <colour palatte>


The zones behave as follows:
### Library
The Library is a deck of cards - it is implemented as a stack where order is preserved. The Library is visually presented as a single card back (the asset is available in the "./deck/static" directory) with a numeric count of the number of cards remaining in the Library.
When the page is loaded, the Library is prefilled with the contents of the deck, represented by "./deck/decklist.txt", and the Library is shuffled so that the order is random. The Library has an order, it's just not usually displayed to the player. The order can be viewed in some circumstances, usually only partly (eg the top N cards). If the entire Library is being viewed, the order does not matter.
The Library has special options for zone transitions. Instead of simply transitioning a card to the Library, it is either "Put on top", "Put on bottom", or "Shuffled in" to the Library. The first two options here refer to the first and last positions of the Library and the final option means to put the card in any position and then randomise the order of the Library.

#### Interaction methods:
Selecting the Library should offer the following options for interaction:
- View the top cards of the library (a numeric selection of cards is needed)
    - This should create a pop-over where the selected number of cards from the top of the Library are displayed; cards may be selected from the pop-over may be zone transitioned (including to the top or bottom of the Library)
- Search the Library
    - This should display a pop-over that shows the full contents of the Library (with considerations for space limitations of the webpage such as page width). Additionally a text search field should be available in which the user can type - a plaintext match of a card name should highlight the relevant card in the pop-over.


### Hand
The Hand displays card images for the cards in the zone. The Hand is not ordered. All cards in the Hand are visible to the user simultaneously (with considerations for space limitations of the webpage such as page width, eg scrolling may be needed).


### Battlefield
The Battlefield displays card images for the cards in the zone. The Battlefield is not ordered. All cards in the Battlefield are visible to the user simultaneously (with considerations for space limitations of the webpage such as page width, eg scrolling may be needed).


### Graveyard
The Graveyard displays the image of the card most recently transitioned to that zone and a count of the number of cards in the Graveyard. The Graveyard is ordered.

### Interaction methods:
Selecting the Graveyard should display a pop-over that shows the full contents of the Graveyard. The Graveyard contents pop-over should behave identically to that of the Library - all cards are displayed with considerations for page size, a text search is available to highlight particular cards for selection/zone transition, etc.

### Exile
The Exile zone behaves identically to the Graveyard zone.


- When viewing any card in any zone, clicking the card should select it. When a card is selected, it can be transitioned to any other zone.
- The following buttons are supported with the following functionality:
    - Draw 1
        - Draws 1 card
    - Draw 3
        - Draws 3 cards
    - Search Library
        - Views the current library state and allows for selection and zone transition of individual cards as described above
    - Timetwister
        - The contents of the hand and graveyard zones are added to the library, then the library is shuffled, then draw 7 cards
    - 
