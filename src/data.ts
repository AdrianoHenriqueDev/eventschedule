export type Category = 'wow' | 'overwatch' | 'diablo' | 'hearthstone' | 'classic' | 'blizzard' | 'opening';

export interface ScheduleEvent {
  id: string;
  title: string;
  stage: string;
  startTime: string; 
  endTime: string;
  category: Category;
  subtitle?: string;
  isSpanningAll?: boolean;
  day: 1 | 2;
}

export const STAGES = [
  { id: 'main', name: 'MAIN STAGE', location: 'HALL D' },
  { id: 'legends', name: 'LEGENDS STAGE', location: '2ND FLOOR' },
  { id: 'arena', name: 'OVERWATCH WORLD CUP ARENA', location: 'ARENA' },
  { id: 'wow', name: 'WORLD OF WARCRAFT STAGE', location: 'HALL C' },
  { id: 'hearthstone', name: 'HEARTHSTONE STAGE', location: 'HALL B' },
  { id: 'classic', name: 'CLASSIC CUP STAGE', location: 'HALL A' },
  { id: 'diablo', name: 'DIABLO STAGE', location: 'HALL B' },
];

const EVENTS_DAY1: Omit<ScheduleEvent, 'day'>[] = [
  { id: 'ev-opening', title: 'OPENING CEREMONY', stage: 'all', startTime: '10:30', endTime: '11:45', category: 'blizzard', isSpanningAll: true },
  
  // Main Stage
  { id: 'ev-main-1', title: "WORLD OF WARCRAFT: WHAT'S NEXT", stage: 'main', startTime: '12:00', endTime: '12:45', category: 'wow' },
  { id: 'ev-main-2', title: 'DIABLO: DEVELOPER UPDATE', stage: 'main', startTime: '13:45', endTime: '14:30', category: 'diablo' },
  { id: 'ev-main-3', title: "WORLD OF WARCRAFT: WHAT'S NEXT II", stage: 'main', startTime: '14:45', endTime: '15:30', category: 'wow' },
  { id: 'ev-main-4', title: 'OVERWATCH: HERO DEEP DIVE', stage: 'main', startTime: '15:45', endTime: '16:30', category: 'overwatch' },
  { id: 'ev-main-5', title: 'BLIZZCON COMMUNITY NIGHT', stage: 'main', startTime: '16:45', endTime: '19:00', category: 'blizzard' },

  // Legends Stage
  { id: 'ev-leg-1', title: 'OVERWATCH DEV LIVESTREAM: LIVE FROM BLIZZCON!', stage: 'legends', startTime: '12:00', endTime: '12:45', category: 'overwatch' },
  { id: 'ev-leg-2', title: 'TRAILERCRAFT', stage: 'legends', startTime: '13:00', endTime: '13:45', category: 'blizzard' },
  { id: 'ev-leg-3', title: 'BUILDING CUTSCENES IN WORLD OF WARCRAFT', stage: 'legends', startTime: '14:00', endTime: '14:45', category: 'wow' },
  { id: 'ev-leg-4', title: 'THE WORLD OF BLIZZARD SOUND DESIGN', stage: 'legends', startTime: '15:00', endTime: '16:00', category: 'blizzard' },
  { id: 'ev-leg-5', title: "THE ART OF DARKNESS: BEHIND DIABLO IV'S CINEMATICS", stage: 'legends', startTime: '16:15', endTime: '17:15', category: 'diablo' },
  { id: 'ev-leg-6', title: 'KINDA FUNNY LIVE FROM BLIZZCON', stage: 'legends', startTime: '17:30', endTime: '18:30', category: 'blizzard' },

  // Overwatch World Cup Arena
  { id: 'ev-ow-1', title: 'OVERWATCH WORLD CUP QUARTERFINALS 1', stage: 'arena', startTime: '12:00', endTime: '13:30', category: 'overwatch' },
  { id: 'ev-ow-2', title: 'OVERWATCH WORLD CUP QUARTERFINALS 2', stage: 'arena', startTime: '13:30', endTime: '15:00', category: 'overwatch' },
  { id: 'ev-ow-3', title: 'OVERWATCH WORLD CUP QUARTERFINALS 3', stage: 'arena', startTime: '15:00', endTime: '16:30', category: 'overwatch' },
  { id: 'ev-ow-4', title: 'OVERWATCH WORLD CUP QUARTERFINALS 4', stage: 'arena', startTime: '16:30', endTime: '18:00', category: 'overwatch' },
  { id: 'ev-ow-5', title: 'OVERWATCH: ART & COLLABORATION DEEP DIVE', stage: 'arena', startTime: '18:15', endTime: '19:00', category: 'overwatch' },

  // World of Warcraft Stage
  { id: 'ev-wow-1', title: "(SIMULCAST) WORLD OF WARCRAFT: WHAT'S NEXT", stage: 'wow', startTime: '12:00', endTime: '12:45', category: 'wow' },
  { id: 'ev-wow-2', title: 'MDI 2023 GRAND FINALS | DIGNITAS VS BIG LUCKY', stage: 'wow', startTime: '12:45', endTime: '14:00', category: 'wow' },
  { id: 'ev-wow-3', title: 'MDI 2023 GRAND FINALS | LIQUID VS MANDATORY', stage: 'wow', startTime: '14:00', endTime: '15:15', category: 'wow' },
  { id: 'ev-wow-4', title: 'WORLD OF WARCRAFT: DEVELOPER X CREATOR SHOWCASE', stage: 'wow', startTime: '15:30', endTime: '17:30', category: 'wow' },
  { id: 'ev-wow-5', title: 'MDI 2023 GRAND FINALS | CHAMPIONSHIP MATCH', stage: 'wow', startTime: '17:30', endTime: '19:00', category: 'wow' },

  // Hearthstone Stage
  { id: 'ev-hs-1', title: 'HEARTHSTONE WORLD CHAMPIONSHIP QUARTERFINALS', stage: 'hearthstone', startTime: '12:00', endTime: '13:30', category: 'hearthstone' },
  { id: 'ev-hs-2', title: 'HEARTHSTONE WORLD CHAMPIONSHIP QUARTERFINALS', stage: 'hearthstone', startTime: '13:30', endTime: '14:45', category: 'hearthstone' },
  { id: 'ev-hs-3', title: "HEARTHSTONE: WHAT'S NEXT", stage: 'hearthstone', startTime: '15:00', endTime: '15:45', category: 'hearthstone' },
  { id: 'ev-hs-4', title: 'HEARTHSTONE WORLD CHAMPIONSHIP QUARTERFINALS', stage: 'hearthstone', startTime: '15:45', endTime: '17:00', category: 'hearthstone' },
  { id: 'ev-hs-5', title: 'HEARTHSTONE WORLD CHAMPIONSHIP QUARTERFINALS', stage: 'hearthstone', startTime: '17:00', endTime: '18:15', category: 'hearthstone' },
  { id: 'ev-hs-6', title: 'DRAWSTONE: MURLOC DRAW ALONG', stage: 'hearthstone', startTime: '18:30', endTime: '19:00', category: 'hearthstone' },

  // Classic Cup Stage
  { id: 'ev-cc-1', title: 'CLASSIC CUP: HEROES OF THE STORM - LEGACY MATCH', stage: 'classic', startTime: '12:00', endTime: '14:15', category: 'classic' },
  { id: 'ev-cc-2', title: 'CUSTODIANS OF LEGACY GAMES', stage: 'classic', startTime: '14:30', endTime: '15:15', category: 'classic' },
  { id: 'ev-cc-3', title: 'CLASSIC GAME DEEP DIVE', stage: 'classic', startTime: '15:30', endTime: '16:15', category: 'classic' },
  { id: 'ev-cc-4', title: 'CLASSIC CUP: WARCRAFT III - LEGACY MATCH', stage: 'classic', startTime: '16:30', endTime: '17:45', category: 'classic' },
  { id: 'ev-cc-5', title: 'CLASSIC CUP: WARCRAFT III - ENTERTAINMENT MATCH', stage: 'classic', startTime: '17:45', endTime: '18:45', category: 'classic' },

  // Diablo Stage
  { id: 'ev-diablo-1', title: 'IMMORTAL EVENT', stage: 'diablo', startTime: '12:00', endTime: '19:00', category: 'diablo' }
];

const EVENTS_DAY2: Omit<ScheduleEvent, 'day'>[] = [
  // Main Stage
  { id: 'd2-main-1', title: 'WORLD OF WARCRAFT: DEEP DIVE', stage: 'main', startTime: '10:00', endTime: '10:45', category: 'wow' },
  { id: 'd2-main-2', title: 'DIABLO: DEVELOPER UPDATE', stage: 'main', startTime: '11:00', endTime: '11:45', category: 'diablo' },
  { id: 'd2-main-3', title: 'QUESTWATCH: LIVE!!!', stage: 'main', startTime: '12:00', endTime: '14:00', category: 'overwatch' },
  { id: 'd2-main-4', title: 'WORLD OF WARCRAFT: ARCHIVES', stage: 'main', startTime: '14:15', endTime: '15:00', category: 'wow' },
  { id: 'd2-main-5', title: 'VOICES OF BLIZZARD', stage: 'main', startTime: '15:15', endTime: '17:30', category: 'blizzard' },
  { id: 'd2-main-6', title: 'CLOSING REMARKS', stage: 'main', startTime: '17:30', endTime: '17:45', category: 'blizzard' },
  { id: 'd2-main-7', title: 'LIVE PERFORMANCE', stage: 'main', startTime: '18:00', endTime: '18:45', category: 'blizzard' },

  // Legends Stage
  { id: 'd2-leg-1', title: '30 YEARS OF BATTLE.NET WITH SPECIAL GUEST CD PROJEKT RED', stage: 'legends', startTime: '09:30', endTime: '10:30', category: 'blizzard' },
  { id: 'd2-leg-2', title: 'WORLD OF WARCRAFT: CRAFTING COZINESS & CREATIVE FREEDOM', stage: 'legends', startTime: '10:45', endTime: '11:30', category: 'wow' },
  { id: 'd2-leg-3', title: 'WORLD BUILDING IN WORLD OF WARCRAFT', stage: 'legends', startTime: '11:45', endTime: '12:30', category: 'wow' },
  { id: 'd2-leg-4', title: 'VILLAINS OF BLIZZARD', stage: 'legends', startTime: '12:45', endTime: '13:45', category: 'blizzard' },
  { id: 'd2-leg-5', title: 'COLLABORATIVE STORYTELLING IN SFD', stage: 'legends', startTime: '14:00', endTime: '14:45', category: 'blizzard' },
  { id: 'd2-leg-6', title: 'OVERWATCH DEV LIVESTREAM: LIVE FROM BLIZZCON!', stage: 'legends', startTime: '15:00', endTime: '15:45', category: 'overwatch' },
  { id: 'd2-leg-7', title: 'LOCALIZATION: BRINGING BLIZZARD WORLDS TOGETHER', stage: 'legends', startTime: '16:00', endTime: '16:45', category: 'blizzard' },

  // Arena
  { id: 'd2-ow-1', title: 'OVERWATCH WORLD CUP SEMIFINALS 1', stage: 'arena', startTime: '09:00', endTime: '10:45', category: 'overwatch' },
  { id: 'd2-ow-2', title: 'OVERWATCH WORLD CUP SEMIFINALS 2', stage: 'arena', startTime: '10:45', endTime: '12:15', category: 'overwatch' },
  { id: 'd2-ow-3', title: 'OVERWATCH WORLD CUP HALFTIME SHOW: YOASOBI (IN-ROOM EXPERIENCE ONLY)', stage: 'arena', startTime: '12:15', endTime: '13:15', category: 'overwatch' },
  { id: 'd2-ow-4', title: 'OVERWATCH WORLD CUP THIRD-PLACE MATCH', stage: 'arena', startTime: '13:15', endTime: '14:45', category: 'overwatch' },
  { id: 'd2-ow-5', title: 'OVERWATCH WORLD CUP FINALS', stage: 'arena', startTime: '14:45', endTime: '17:00', category: 'overwatch' },

  // WoW Stage
  { id: 'd2-wow-1', title: '(SIMULCAST) WORLD OF WARCRAFT: DEEP DIVE', stage: 'wow', startTime: '10:00', endTime: '10:45', category: 'wow' },
  { id: 'd2-wow-2', title: 'AWC 2023 GRAND FINALS | F TIER VS GUILD DEAN', stage: 'wow', startTime: '10:45', endTime: '12:00', category: 'wow' },
  { id: 'd2-wow-3', title: 'AWC 2023 GRAND FINALS | STREAMERZONE.GG VS ONE LUN TRAVEL', stage: 'wow', startTime: '12:00', endTime: '13:00', category: 'wow' },
  { id: 'd2-wow-4', title: 'WORLD OF WARCRAFT: ART DESIGN', stage: 'wow', startTime: '13:15', endTime: '14:00', category: 'wow' },
  { id: 'd2-wow-5', title: 'AWC 2023 GRAND FINALS | ECHO VS TBD', stage: 'wow', startTime: '14:00', endTime: '15:00', category: 'wow' },
  { id: 'd2-wow-6', title: 'AWC 2023 GRAND FINALS | GATORS BACK VS TBD', stage: 'wow', startTime: '15:00', endTime: '16:00', category: 'wow' },
  { id: 'd2-wow-7', title: "WORLD OF WARCRAFT HARDCORE: WHAT'S NEXT", stage: 'wow', startTime: '16:15', endTime: '17:00', category: 'wow' },
  { id: 'd2-wow-8', title: 'AWC 2023 GRAND FINALS | CHAMPIONSHIP MATCH', stage: 'wow', startTime: '17:00', endTime: '19:00', category: 'wow' },

  // Hearthstone Stage
  { id: 'd2-hs-1', title: 'HEARTHSTONE WORLD CHAMPIONSHIP SEMIFINALS', stage: 'hearthstone', startTime: '09:30', endTime: '11:30', category: 'hearthstone' },
  { id: 'd2-hs-2', title: 'HEARTHSTONE WORLD CHAMPIONSHIP SEMIFINALS', stage: 'hearthstone', startTime: '11:30', endTime: '13:00', category: 'hearthstone' },
  { id: 'd2-hs-3', title: 'HEARTHSTONE WORLD CHAMPIONSHIP FINALS', stage: 'hearthstone', startTime: '13:00', endTime: '15:00', category: 'hearthstone' },
  { id: 'd2-hs-4', title: 'HEARTHSTONE: BATTLEGROUNDS DESIGN', stage: 'hearthstone', startTime: '15:15', endTime: '16:00', category: 'hearthstone' },
  { id: 'd2-hs-5', title: 'DRAWSTONE: CARD BACK ART DEMO', stage: 'hearthstone', startTime: '16:15', endTime: '17:00', category: 'hearthstone' },

  // Classic Cup Stage
  { id: 'd2-cc-1', title: 'RSL REVIVAL: SEASON 6 FINALS', stage: 'classic', startTime: '09:00', endTime: '11:30', category: 'classic' },
  { id: 'd2-cc-2', title: 'CLASSIC CUP: STARCRAFT II - LEGACY MATCH', stage: 'classic', startTime: '11:30', endTime: '13:15', category: 'classic' },
  { id: 'd2-cc-3', title: 'CLASSIC CUP: STARCRAFT II - ENTERTAINMENT MATCH', stage: 'classic', startTime: '13:15', endTime: '14:15', category: 'classic' },
  { id: 'd2-cc-4', title: 'CLASSIC CUP: STARCRAFT REMASTERED - ENTERTAINMENT MATCH', stage: 'classic', startTime: '14:15', endTime: '15:15', category: 'classic' },
  { id: 'd2-cc-5', title: 'CLASSIC CUP: STARCRAFT REMASTERED - LEGACY MATCH', stage: 'classic', startTime: '15:15', endTime: '17:00', category: 'classic' },

  // Diablo Stage
  { id: 'd2-diablo-1', title: 'DIABLO IMMORTAL LIVE ARTIST DRAWING WITH SPECIAL GUEST', stage: 'diablo', startTime: '10:00', endTime: '11:00', category: 'diablo' },
  { id: 'd2-diablo-2', title: 'IMMORTAL EVENT', stage: 'diablo', startTime: '11:00', endTime: '18:00', category: 'diablo' },
];

export const EVENTS: ScheduleEvent[] = [
  ...EVENTS_DAY1.map(e => ({ ...e, day: 1 as const })),
  ...EVENTS_DAY2.map(e => ({ ...e, day: 2 as const }))
];
