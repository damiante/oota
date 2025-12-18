# Intro
Today you'll be creating a web app that supports playing the game of Magic: the Gathering by virtualising the game state on a webpage which manages the zones of the game.

I'll start by giving an outline of the purpose of the tool and what you have access to at present. Then I'll describe the behaviour of each zone I want to have implemented. Finally I'll go through some additional functionality and how I want it to be managed. After that you should proceed to build the application.

As you build the application, generate and populate a CLAUDE.md file that describes what you've done and how it works so that future prompts have access to understanding the application.

# Tool outline

The tool is designed to manage a paper game using the card "Oracle of the Alpha". This is a digital-only card which, when it enters the battlefield, shuffles a copy of each of the Power 9 (Black Lotus, Time Walk, Timetwister, Ancestral Recall, Mox Pearl, Mox Sapphire, Mox Jet, Mox Ruby, and Mox Emerald) into its owner's library.

Under normal gameplay circumstances this would be impossible as you can't shuffle generated cards into the library. The tool will enable us to manage this in a paper game, even if the size of the zones becomes unwieldy. Thus the primary use of the tool is to manage, for each zone, how many of each copy of the above cards it has, as well as whether the cards are one of the above cards (and which one) or a card that was originally in the deck (represented by the "placeholder" image in the /static/ directory).

The app will also enable common game actions which will be replicated in real life by the player using the tool. The tool will be primarily used on mobile, so in all implementation decisions consider mobile support as primarily important and use on a PC as secondary.

Firstly, look in the /static/ directory. It contains images which we'll use to build the app. There's one image for each of the power 9 cards listed, as well as a "card-back" and "placeholder" card. I'll describe how we'll use these later.

Next, look at the file "UI.png" for an example of how I want the UI to be laid out. Interpret this only for the positions of each described UI element and not for informing how the app should actually look. Instead, give the UI a modern but simple look and feel to focus on the functionality.

# Zones

In all zones, whenever a card is visible in that zone (either in the main UX or a popover box), duplicates of the same card should be shown with a count representing the number of repeated instances of that card.

The most common action will be moving cards between zones, so ensure each zone supports tapping and dragging of cards between zones. In touching a card, the card should be picked up and moveable around the screen, and when it's released, the card should enter the zone it was released into. For zones where each card is visible, this should be the touched card; for zones where only a single card is visible, it should be an instance of the top card of that zone. Moving a card out of a zone removes it from the count of cards for that zone and similarly adding a card to a zone adds it to the instances of that card in that zone.

## Library
This zone should be represented by a single face-down card (ie it is rendered using the card-back image) in the lower right portion of the UX. It should display the count of cards in the deck. The library is ordered, so any operations which use it must consider the order of the cards contained. Anywhere "shuffling" is referenced, it means "randomly reorder the library". Picking a card up from the library takes it from the first card in the order, and the card should be displayed face-up when it's picked. Cards placed onto the library should be placed face-down and first in the order. You might like to implement it with a stack (although consider that it will need random reordering). When the library is viewed in its totality, it's okay to visually group the cards in it if there are duplicates, but ensure the order is actually retained.

## Hand & Battlefield
These zones should be in the centre of the screen. They are more horizontal and represent multiple cards, so show each unique card lined up along the full width of the zone. It's okay if they overlap to fit the size of the zone to the screen.

## Graveyard & Exile
These zones should be on the left side of the UX, Graveyard on the bottom and Exile on the top. Each is represented by a single face-up image of the most recent card to enter that zone.

## Overflow button
This should be a button allowing access to other functionality in a popover menu. The popover menu launched by this button will be described in the next section.

# Overflow functionality

When the overflow button is clicked/tapped, a popover menu should be displayed. This menu will house additional or complex functionality. Each piece of functionality should be represented by its own menu item. The menu should be scrollable as the number of available features should be unbounded. Implement the menu items in a configurable way such as a YAML file that will allow me to reorder the items. Implementations for these items should be done in a way that enables future extension, as I expect to add to the overflow functionality over time.

I'll describe each menu item I want implemented and what it should do next.

1. Oracle ETB effect
This button should add 1 of each copy of the Power 9 into the library, then shuffle the library.

2. View all
For each zone represented by a single card (graveyard, library, exile), there should be a menu item to view that zone in its entirety. Place the pop-over in such a way that cards can be dragged out of it and into other zones (this may require popping the exile/graveyard zones over the left side of the screen and the library zone over the right).

3. Timetwister
Each card in the hand and graveyard zones should be moved to the library zone, then the library should be shuffled. After shuffling, put the top 7 cards from the library into the hand.

4. Scry
On push, the UX should request a number and display a submit button. When submitted, the top N cards of the library should be displayed, where N was the number submitted. Two card placement areas should be displayed, representing the top and bottom of the library. The user should be able to freely reorder cards in both of these areas. A submit button should also be shown; on press, the UX should read the cards moved to the top and bottom placement areas and move the cards selected from the library to mirror this choice (ensuring order is preserved).

5. Surveil
Same as Scry except instead of the "bottom of the library", there is a placement area representing the graveyard. On submission, cards placed on the library placement area are returned in the order selected through the popover and cards in the graveyard placement area are moved to the graveyard zone.


6. Draw X
On push, the UX should request a number and display a submit button (as for Scry). When submitted, move the top X cards from the library to the hand.

7. Exile graveyard
Moves all cards in the graveyard zone to the exile zone.