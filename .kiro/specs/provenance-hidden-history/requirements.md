# Requirements Document

## Introduction

"Provenance: The Hidden History" is a 2D web-based Hidden Object / Appraisal game for the Kelby Games portfolio (kelby.in). The player assumes the role of an Estate Appraiser who discovers, researches, restores, and auctions antique objects across a 25-minute core gameplay loop. The game is built with React, TypeScript, Tailwind CSS, and HTML5 Canvas (or Phaser 3), packaged as a Progressive Web App targeting Microsoft Store submission.

This document covers the MVP requirements for the four core gameplay phases (Scan, Research, Restoration, Auction), game session management, PWA configuration, and Microsoft Store compliance.

## Glossary

- **Game_Engine**: The HTML5 Canvas or Phaser 3 rendering layer responsible for drawing interactive game scenes
- **Scene_Renderer**: The component within Game_Engine that renders the hidden object scene, including background art and clickable antique objects
- **Object_Detector**: The input-handling subsystem that registers player clicks/taps on hidden objects within the scene
- **Trivia_Modal**: The React UI overlay that presents three historical claims about a discovered antique item
- **Restoration_Module**: The mini-game interaction component that applies a value multiplier to an appraised item through repeated player input (clicking or swiping)
- **Auction_Calculator**: The subsystem that computes the final score by summing the adjusted appraisal values of all curated inventory items
- **Inventory_Manager**: The state management component that tracks all discovered, appraised, and restored items during a game session
- **Session_Timer**: The countdown timer component that enforces the 25-minute session duration
- **PWA_Shell**: The Progressive Web App wrapper including the web app manifest, service worker, and offline caching layer
- **Score_Persistence**: The LocalStorage-based subsystem that saves and retrieves high scores and session data
- **Hint_System**: The optional assistance mechanism that highlights undiscovered objects for the player
- **Base_Appraisal_Value**: The starting monetary value assigned to each antique object before trivia and restoration modifiers
- **Trivia_Multiplier**: The value modifier applied when the player correctly identifies the false historical claim
- **Restoration_Multiplier**: The value modifier applied based on the player's performance in the restoration mini-game
- **Final_Appraisal_Value**: The computed value of an item after applying Trivia_Multiplier and Restoration_Multiplier to the Base_Appraisal_Value
- **Room**: A single hidden object scene (level) within a game session; a full 25-minute session consists of three sequential Rooms, each containing its own set of hidden antique objects
- **Level_Manifest**: A static local JSON configuration file that defines all data for a Room, including scene background asset paths, hidden object coordinates and hitboxes, Base_Appraisal_Values, and Trivia Data (two true claims and one false claim per object)
- **Canvas_Event_Bridge**: The communication interface between the HTML5 Canvas/Phaser rendering layer (Game_Engine) and the React UI layer; emits custom events or triggers callback functions to synchronize game state changes with React component state

## Requirements

### Requirement 1: Game Session Initialization

**User Story:** As a player, I want to start a new appraisal session consisting of three sequential Rooms, so that I can discover hidden antiques across multiple scenes within a structured 25-minute time limit.

#### Acceptance Criteria

1. WHEN the player selects "New Game", THE Game_Engine SHALL load the first of three sequential Rooms, where each Room is a hidden object scene containing between 10 and 15 clickable antique objects placed within the scene background
2. WHEN a new game session starts, THE Session_Timer SHALL initialize a single 25-minute countdown that spans across all three Rooms and display the remaining time in MM:SS format
3. WHEN a new game session starts, THE Inventory_Manager SHALL initialize an empty inventory with zero items and a cumulative appraisal value of zero
4. WHEN a new game session starts, THE Scene_Renderer SHALL render the first Room's scene background at the native resolution of the player's viewport while maintaining the original aspect ratio
5. IF the Game_Engine fails to load scene assets for any Room, THEN THE Game_Engine SHALL display an error message and offer the player an option to retry loading
6. WHEN the player discovers all hidden objects in the current Room and the current Room is not the third Room, THE Game_Engine SHALL transition the player to the next sequential Room within 3 seconds
7. WHEN the player completes the third Room by discovering all hidden objects, THE Game_Engine SHALL transition the player to the auction summary screen
8. WHILE the player transitions between Rooms, THE Inventory_Manager SHALL retain all previously discovered items and their appraisal values

### Requirement 2: Hidden Object Discovery (The Scan)

**User Story:** As a player, I want to scan a richly detailed scene and find hidden antique objects by clicking or tapping on them, so that I can build my appraisal inventory.

#### Acceptance Criteria

1. WHEN the player clicks or taps on a hidden antique object, THE Object_Detector SHALL register the interaction within a 10-pixel tolerance radius of the object's defined hit area
2. WHEN the Object_Detector registers a valid object interaction, THE Scene_Renderer SHALL play a discovery animation on the found object lasting no longer than 1 second
3. WHEN an object is discovered, THE Inventory_Manager SHALL add the object to the player's inventory with its assigned Base_Appraisal_Value
4. WHEN an object is discovered, THE Scene_Renderer SHALL visually distinguish the discovered object from undiscovered objects in the scene
5. WHEN the player clicks or taps on an area with no hidden object, THE Scene_Renderer SHALL provide brief visual feedback indicating no object was found
6. WHILE the Session_Timer is active, THE Object_Detector SHALL accept player click and tap inputs on the scene
7. WHEN the Session_Timer reaches zero, THE Object_Detector SHALL stop accepting new discovery inputs
8. THE Scene_Renderer SHALL render each hidden object with a defined bounding box that does not overlap with any other object's bounding box by more than 10 percent of either object's area
9. WHEN an object is discovered, THE Canvas_Event_Bridge SHALL emit a custom event or trigger a callback function containing the discovered object's unique ID from the Game_Engine Canvas/Phaser layer to the React UI layer
10. WHEN the Canvas_Event_Bridge emits a discovery event, THE Inventory_Manager in the React layer SHALL listen for the event and update the global inventory state with the discovered object's data

### Requirement 3: Historical Research (The Trivia)

**User Story:** As a player, I want to research each discovered antique by identifying a false historical claim from a set of three, so that I can increase the item's appraisal value through my knowledge.

#### Acceptance Criteria

1. WHEN the player selects a discovered object from the inventory, THE Trivia_Modal SHALL open and display the object's name, image, and three historical claims about the object
2. THE Trivia_Modal SHALL present exactly two true claims and one false claim for each object
3. WHEN the player selects the correct false claim, THE Trivia_Modal SHALL display a success message and apply a Trivia_Multiplier of 1.5x to the object's Base_Appraisal_Value
4. WHEN the player selects a true claim instead of the false claim, THE Trivia_Modal SHALL display the correct answer and apply a Trivia_Multiplier of 1.0x to the object's Base_Appraisal_Value
5. WHEN the player completes the trivia for an object, THE Inventory_Manager SHALL update the object's appraisal value to reflect the applied Trivia_Multiplier
6. WHEN the Trivia_Modal is open, THE Session_Timer SHALL continue counting down
7. THE Trivia_Modal SHALL trap keyboard focus within the modal and allow the player to close the modal by pressing the Escape key
8. WHEN the player closes the Trivia_Modal without selecting an answer, THE Inventory_Manager SHALL retain the object's Base_Appraisal_Value with a Trivia_Multiplier of 1.0x


### Requirement 4: Item Restoration (The Mini-Game)

**User Story:** As a player, I want to restore each appraised antique through a simple interactive mini-game, so that I can apply a final value multiplier before the auction.

#### Acceptance Criteria

1. WHEN the player selects "Restore" on a trivia-completed object, THE Restoration_Module SHALL present an interactive cleaning mini-game for that object
2. THE Restoration_Module SHALL require the player to perform repeated click or swipe interactions to fill a restoration progress bar from 0 to 100 percent
3. WHEN the restoration progress bar reaches 100 percent, THE Restoration_Module SHALL calculate a Restoration_Multiplier between 1.0x and 2.0x based on the speed of completion relative to a 15-second target time
4. WHEN the player completes restoration within 15 seconds, THE Restoration_Module SHALL assign a Restoration_Multiplier of 2.0x
5. WHEN the player completes restoration in more than 15 seconds, THE Restoration_Module SHALL assign a Restoration_Multiplier that decreases linearly from 2.0x to 1.0x over a 30-second window
6. WHEN restoration is complete, THE Inventory_Manager SHALL compute the Final_Appraisal_Value as Base_Appraisal_Value multiplied by Trivia_Multiplier multiplied by Restoration_Multiplier
7. WHEN the Restoration_Module is active, THE Session_Timer SHALL continue counting down
8. IF the Session_Timer reaches zero during restoration, THEN THE Restoration_Module SHALL auto-complete with the current progress percentage converted to a proportional Restoration_Multiplier

### Requirement 5: The Auction (Score Summary)

**User Story:** As a player, I want to see an auction summary screen that calculates my total earnings from all appraised and restored items across all three Rooms, so that I can see my final high score.

#### Acceptance Criteria

1. WHEN the player completes the third Room or the Session_Timer reaches zero, THE Auction_Calculator SHALL display the auction summary screen
2. THE Auction_Calculator SHALL list each item from all three Rooms in the inventory with its name, Base_Appraisal_Value, Trivia_Multiplier, Restoration_Multiplier, and Final_Appraisal_Value
3. THE Auction_Calculator SHALL compute and display the total auction score as the sum of all Final_Appraisal_Values across all three Rooms in the inventory
4. WHEN the auction summary is displayed, THE Auction_Calculator SHALL animate each item's sale with a sequential reveal lasting no more than 500 milliseconds per item
5. WHEN the total auction score exceeds the stored high score, THE Score_Persistence SHALL save the new high score to LocalStorage
6. WHEN the auction is complete, THE Auction_Calculator SHALL display options to start a new game or return to the main menu
7. THE Auction_Calculator SHALL display items that were not trivia-completed or restored with their Base_Appraisal_Value and multipliers of 1.0x
8. WHILE the player is in Room 1 or Room 2, THE Auction_Calculator SHALL remain inaccessible and the "Go to Auction" option SHALL be disabled

### Requirement 6: Session Timer Management

**User Story:** As a player, I want a visible countdown timer throughout the game session, so that I can manage my time across scanning, researching, and restoring items.

#### Acceptance Criteria

1. WHILE a game session is active, THE Session_Timer SHALL display the remaining time in MM:SS format in a persistent, non-obstructive location on the screen
2. WHEN the Session_Timer has 60 seconds remaining, THE Session_Timer SHALL change the timer display color to a warning color distinct from the default color
3. WHEN the Session_Timer has 10 seconds remaining, THE Session_Timer SHALL pulse the timer display to indicate urgency
4. WHEN the Session_Timer reaches zero, THE Game_Engine SHALL transition the player to the auction summary screen within 2 seconds
5. WHILE the Trivia_Modal or Restoration_Module is active, THE Session_Timer SHALL remain visible and continue counting down

### Requirement 7: Hint System

**User Story:** As a player, I want access to a limited hint system, so that I can get assistance finding hidden objects when I am stuck.

#### Acceptance Criteria

1. WHEN a new game session starts, THE Hint_System SHALL provide the player with 3 hints
2. WHEN the player activates a hint, THE Hint_System SHALL highlight one undiscovered object in the scene with a visual indicator for 3 seconds
3. WHEN a hint is used, THE Hint_System SHALL decrement the remaining hint count by 1
4. WHILE the player has zero remaining hints, THE Hint_System SHALL disable the hint activation control and display a "No hints remaining" message
5. THE Hint_System SHALL select the highlighted object randomly from the set of undiscovered objects in the scene

### Requirement 8: Inventory Management UI

**User Story:** As a player, I want to view and manage my discovered items in an inventory panel, so that I can choose which items to research and restore.

#### Acceptance Criteria

1. WHILE a game session is active, THE Inventory_Manager SHALL display an inventory panel showing all discovered items with their current appraisal status
2. THE Inventory_Manager SHALL display each item's status as one of: "Discovered", "Researched", or "Restored"
3. WHEN the player selects a "Discovered" item, THE Inventory_Manager SHALL offer the option to begin the trivia research phase for that item
4. WHEN the player selects a "Researched" item, THE Inventory_Manager SHALL offer the option to begin the restoration phase for that item
5. THE Inventory_Manager SHALL display the running total appraisal value of all items in the inventory
6. WHEN the Canvas_Event_Bridge emits an object discovery event, THE Inventory_Manager React component SHALL subscribe to the event and add the corresponding object to the inventory panel without requiring a full page re-render
7. WHEN the Canvas_Event_Bridge emits an event, THE Inventory_Manager SHALL reconcile the event payload with the global React state to maintain a single source of truth for inventory data

### Requirement 9: Game State Persistence

**User Story:** As a player, I want my high scores and game preferences to persist between sessions, so that I can track my progress over time.

#### Acceptance Criteria

1. WHEN a game session ends, THE Score_Persistence SHALL save the session's total auction score and date to LocalStorage
2. THE Score_Persistence SHALL maintain a leaderboard of the top 10 highest auction scores in LocalStorage
3. WHEN the player opens the game, THE Score_Persistence SHALL load and display the stored high score on the main menu
4. IF LocalStorage is unavailable, THEN THE Score_Persistence SHALL allow gameplay to continue without persistence and display a notification to the player


### Requirement 10: Progressive Web App Configuration

**User Story:** As a player, I want to install the game as a standalone app on my device and play offline, so that I can enjoy the game without a persistent internet connection.

#### Acceptance Criteria

1. THE PWA_Shell SHALL include a web app manifest with the application name "Provenance: The Hidden History", a short name "Provenance", display mode "standalone", theme color, background color, and icons in 192x192 and 512x512 pixel sizes
2. THE PWA_Shell SHALL register a service worker that caches all game assets (HTML, CSS, JavaScript, images, audio) on first load using a cache-first strategy
3. WHEN the player has no internet connection, THE PWA_Shell SHALL serve all cached game assets and allow full offline gameplay
4. WHEN the service worker detects updated assets on the server, THE PWA_Shell SHALL download the updated assets in the background and apply them on the next app launch
5. THE PWA_Shell SHALL include a maskable icon variant for adaptive icon display on Android devices
6. THE PWA_Shell SHALL set the manifest scope to the game's root directory to prevent navigation outside the game context

### Requirement 11: Microsoft Store PWA Submission Compliance

**User Story:** As the development team, we want the PWA to meet all Microsoft Store submission guidelines, so that the game can be published and distributed through the Microsoft Store.

#### Acceptance Criteria

1. THE PWA_Shell SHALL include a web app manifest that passes the Microsoft PWA Builder validation with zero errors
2. THE PWA_Shell SHALL provide icons in the following sizes: 44x44, 50x50, 150x150, 192x192, and 512x512 pixels in PNG format
3. THE PWA_Shell SHALL set the manifest "display" field to "standalone" or "fullscreen"
4. THE PWA_Shell SHALL include at least one screenshot in the manifest with dimensions between 320x320 and 3840x3840 pixels for Store listing
5. THE PWA_Shell SHALL serve all pages over HTTPS
6. THE PWA_Shell SHALL include a functional service worker that enables offline operation
7. THE Game_Engine SHALL render content that fills the application viewport without browser chrome when launched in standalone mode
8. THE PWA_Shell SHALL include the "categories" field in the manifest set to include "games" and "entertainment"

### Requirement 12: Responsive Layout and Cross-Platform Support

**User Story:** As a player, I want the game to work seamlessly on desktop, tablet, and mobile devices, so that I can play on any device I own.

#### Acceptance Criteria

1. THE Game_Engine SHALL render the game scene at a minimum supported viewport width of 320 pixels and scale up to 2560 pixels
2. WHEN the viewport width is below 768 pixels, THE Scene_Renderer SHALL switch to a mobile-optimized layout with larger touch targets of at least 44x44 pixels
3. THE Game_Engine SHALL support both mouse click and touch tap inputs for all interactive elements
4. WHEN the device orientation changes, THE Scene_Renderer SHALL re-render the scene to fit the new viewport dimensions within 500 milliseconds
5. THE Trivia_Modal SHALL be scrollable on viewports where the modal content exceeds the visible area

### Requirement 13: Audio and Visual Feedback

**User Story:** As a player, I want ambient audio and visual feedback during gameplay, so that the experience feels immersive and responsive.

#### Acceptance Criteria

1. WHEN a game session starts, THE Game_Engine SHALL play ambient background music in a loop at a default volume of 30 percent
2. WHEN the player discovers a hidden object, THE Game_Engine SHALL play a discovery sound effect
3. WHEN the player correctly identifies the false claim in trivia, THE Game_Engine SHALL play a success sound effect
4. WHEN the player completes a restoration, THE Game_Engine SHALL play a completion sound effect
5. THE Game_Engine SHALL provide a mute toggle control that silences all audio and persists the mute preference in LocalStorage
6. WHEN the mute toggle is active, THE Game_Engine SHALL suppress all audio output including background music and sound effects

### Requirement 14: Main Menu and Navigation

**User Story:** As a player, I want a main menu with clear navigation options, so that I can start a new game, view high scores, or adjust settings.

#### Acceptance Criteria

1. WHEN the player launches the game, THE Game_Engine SHALL display a main menu with options for "New Game", "High Scores", "Settings", and a link back to the Kelby Games portal
2. WHEN the player selects "High Scores", THE Score_Persistence SHALL display the top 10 stored auction scores with dates
3. WHEN the player selects "Settings", THE Game_Engine SHALL display options for audio mute toggle and a control to clear saved data
4. THE Game_Engine SHALL provide a navigation control during gameplay to return to the main menu, with a confirmation prompt to prevent accidental session abandonment
5. WHEN the player confirms abandoning a session, THE Game_Engine SHALL discard the current session state and return to the main menu

### Requirement 15: Accessibility

**User Story:** As a player with accessibility needs, I want the game to support keyboard navigation, screen readers, and sufficient color contrast, so that I can play the game effectively.

#### Acceptance Criteria

1. THE Game_Engine SHALL support full keyboard navigation for all menu screens, the Trivia_Modal, and the Auction_Calculator using Tab, Enter, Space, and Escape keys
2. THE Trivia_Modal SHALL include ARIA labels on all interactive elements and announce the trivia question and options to screen readers
3. THE Game_Engine SHALL maintain a minimum color contrast ratio of 4.5:1 for all text elements against their backgrounds
4. WHEN a hidden object is discovered, THE Game_Engine SHALL announce the discovery to screen readers using an ARIA live region
5. THE Hint_System activation control SHALL be keyboard accessible and include an ARIA label indicating the number of remaining hints

### Requirement 16: Performance

**User Story:** As a player, I want the game to load quickly and run smoothly, so that I have an uninterrupted gameplay experience.

#### Acceptance Criteria

1. THE Game_Engine SHALL achieve a First Contentful Paint of less than 2 seconds on a standard 4G connection
2. THE Game_Engine SHALL maintain a frame rate of at least 30 frames per second during scene rendering and animations
3. THE Game_Engine SHALL keep the total initial bundle size below 5 megabytes including all scene assets for the first level
4. THE Game_Engine SHALL lazy-load scene assets that are not required for the initial render
5. IF the Game_Engine detects a frame rate drop below 20 frames per second for more than 3 consecutive seconds, THEN THE Game_Engine SHALL reduce visual effects to maintain playable performance


### Requirement 17: Level Manifest Data Hydration

**User Story:** As a developer, I want all Room-specific game data to be loaded from a static local JSON configuration file, so that game content is data-driven and decoupled from application logic.

#### Acceptance Criteria

1. THE Game_Engine SHALL load all Room-specific data from a Level_Manifest JSON file for each Room at session initialization and Room transitions
2. THE Level_Manifest SHALL define the scene background asset file path for each Room
3. THE Level_Manifest SHALL define each hidden object's coordinates, bounding box dimensions, and hit area within the scene for each Room
4. THE Level_Manifest SHALL define the Base_Appraisal_Value for each hidden object in each Room
5. THE Level_Manifest SHALL define the Trivia Data for each hidden object, consisting of exactly two true historical claims and one false historical claim
6. WHEN the Trivia_Modal displays claims for a discovered object, THE Trivia_Modal SHALL consume the claim text and correct answer designation exclusively from the Level_Manifest data, not from hardcoded logic
7. WHEN the Game_Engine loads a Room, THE Game_Engine SHALL consume object placement coordinates and hitbox definitions exclusively from the Level_Manifest data, not from hardcoded logic
8. IF the Level_Manifest JSON file fails to parse or is missing required fields, THEN THE Game_Engine SHALL display a descriptive error message identifying the malformed or missing data
9. FOR ALL valid Level_Manifest JSON files, parsing the Level_Manifest into game objects and serializing those game objects back to JSON and parsing again SHALL produce equivalent game object data (round-trip property)
