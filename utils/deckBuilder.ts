import { GameType, CardConfig, Suit, Rank, GameConfig, CardStyle } from '../types';

export const GAME_VARIANTS: Record<GameType, GameConfig> = {
  [GameType.MariasSingle]: {
    id: GameType.MariasSingle,
    name: 'Mariášové Jednohlavé',
    description: 'Klasické české karty, 32 listů. Ideální na Prší nebo Mariáš.',
    cardCount: 32,
    dimensions: { width: 56, height: 89, label: '56 × 89 mm' },
    ranks: [Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]
  },
  [GameType.MariasDouble]: {
    id: GameType.MariasDouble,
    name: 'Mariášové Dvouhlavé',
    description: 'Moderní verze mariášek, zrcadlový obraz. Nemusíte karty otáčet.',
    cardCount: 32,
    dimensions: { width: 56, height: 89, label: '56 × 89 mm' },
    ranks: [Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]
  },
  [GameType.PokerStandard]: {
    id: GameType.PokerStandard,
    name: 'Poker Standard',
    description: 'Francouzské karty, 52 listů + Žolíci. Klasické indexy ve 4 rozích.',
    cardCount: 54,
    dimensions: { width: 63, height: 88, label: '63 × 88 mm' },
    ranks: [Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]
  },
  [GameType.PokerBig]: {
    id: GameType.PokerBig,
    name: 'Poker 4BIG Index',
    description: 'Francouzské karty s obřími indexy. Skvěle čitelné i potmě.',
    cardCount: 54,
    dimensions: { width: 63, height: 88, label: '63 × 88 mm' },
    ranks: [Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]
  },
  [GameType.Canasta]: {
    id: GameType.Canasta,
    name: 'Canasta / Žolíky',
    description: 'Sada obsahuje 2 balíčky po 54 kartách (celkem 108). Zde navrhujete design pro jeden balíček, který vyrobíme dvakrát.',
    cardCount: 54, // Editing only single deck
    dimensions: { width: 57, height: 88, label: '57 × 88 mm' },
    ranks: [Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]
  }
};

export const getGameShortCode = (gameType: GameType): string => {
    switch(gameType) {
        case GameType.MariasSingle: return 'M1H';
        case GameType.MariasDouble: return 'M2H';
        case GameType.PokerStandard: return 'PST';
        case GameType.PokerBig: return 'P4B';
        case GameType.Canasta: return 'CAN';
        default: return 'UKN';
    }
};

export const getPrintDimensions = (gameType: GameType): { width: number, height: number } => {
    const mm = GAME_VARIANTS[gameType].dimensions;
    const DPI_FACTOR = 11.811; 
    return {
        width: Math.round(mm.width * DPI_FACTOR),
        height: Math.round(mm.height * DPI_FACTOR)
    };
};

// --- FILE NAMING HELPERS ---

const getMariasFileName = (prefix: 'm1h' | 'm2h', rank: Rank, suit: Suit, version: string): string => {
    let suitOffset = 0;
    let suitName = '';
    
    // LOGIC: M1H uses 'zaludy' (plural), M2H uses 'zalud' (singular) based on file list.
    const zaludName = prefix === 'm1h' ? 'zaludy' : 'zalud';

    switch(suit) {
        case Suit.Diamonds: suitOffset = 1; suitName = 'kule'; break;
        case Suit.Hearts: suitOffset = 9; suitName = 'srdce'; break;
        case Suit.Spades: suitOffset = 17; suitName = 'zelene'; break; 
        case Suit.Clubs: suitOffset = 25; suitName = zaludName; break;
    }

    let rankOffset = 0;
    let rankName = '';
    switch(rank) {
        case Rank.Seven: rankOffset = 0; rankName = '7'; break;
        case Rank.Eight: rankOffset = 1; rankName = '8'; break;
        case Rank.Nine: rankOffset = 2; rankName = '9'; break;
        case Rank.Ten: rankOffset = 3; rankName = '10'; break;
        case Rank.Jack: rankOffset = 4; rankName = 'spodek'; break;
        case Rank.Queen: rankOffset = 5; rankName = 'svrsek'; break;
        case Rank.King: rankOffset = 6; rankName = 'kral'; break;
        case Rank.Ace: rankOffset = 7; rankName = 'eso'; break;
    }

    const finalIndex = suitOffset + rankOffset;
    const paddedIndex = finalIndex.toString().padStart(2, '0');
    
    return `${prefix}_${version}_${paddedIndex}_${suitName}_${rankName}.png`;
};

const getPokerFileName = (prefix: 'pst' | 'p4b' | 'p2b', rank: Rank, suit: Suit, version: string): string => {
    let index = 0;
    let suitName = '';
    let rankName = '';

    // Handle JOKER
    if (rank === Rank.Joker) {
        index = (suit === Suit.Hearts || suit === Suit.Diamonds) ? 2 : 3;
        return `${prefix}_${version}_${index.toString().padStart(2, '0')}_joker.png`;
    }

    // Handle Suit Names (Diamond inconsistency: 'kara' vs 'kary')
    // PST (Canasta) v1 uses 'kary'. ALL others (including PST v2/v3) use 'kara'
    let diamondName = 'kara'; 
    if (prefix === 'pst' && version === 'v1') diamondName = 'kary'; 
    
    switch(suit) {
        case Suit.Hearts: suitName = 'srdce'; break;
        case Suit.Diamonds: suitName = diamondName; break;
        case Suit.Clubs: suitName = 'krize'; break;
        case Suit.Spades: suitName = 'piky'; break;
    }

    // Handle Rank Names
    switch(rank) {
        case Rank.Ace: rankName = 'eso'; break;
        case Rank.King: rankName = 'kral'; break;
        case Rank.Queen: rankName = 'dama'; break;
        case Rank.Jack: rankName = 'kluk'; break;
        default: rankName = rank; break;
    }

    // Index Calculation logic based on provided file order
    // 01: Srdce A, 04-06: Srdce KQJ, 16-24: Srdce 10-2
    // 34: Kara A, 07-09: Kara KQJ, 25-33: Kara 10-2
    // 44: Krize A, 10-12: Krize KQJ, 35-43: Krize 10-2
    // 54: Piky A, 13-15: Piky KQJ, 45-53: Piky 10-2

    if (suit === Suit.Hearts) {
        if (rank === Rank.Ace) index = 1;
        else if (rank === Rank.King) index = 4;
        else if (rank === Rank.Queen) index = 5;
        else if (rank === Rank.Jack) index = 6;
        else index = 16 + (10 - parseInt(rank)); 
    } 
    else if (suit === Suit.Diamonds) {
        if (rank === Rank.Ace) index = 34;
        else if (rank === Rank.King) index = 7;
        else if (rank === Rank.Queen) index = 8;
        else if (rank === Rank.Jack) index = 9;
        else index = 25 + (10 - parseInt(rank));
    }
    else if (suit === Suit.Clubs) {
        if (rank === Rank.Ace) index = 44;
        else if (rank === Rank.King) index = 10;
        else if (rank === Rank.Queen) index = 11;
        else if (rank === Rank.Jack) index = 12;
        else index = 35 + (10 - parseInt(rank));
    }
    else if (suit === Suit.Spades) {
        if (rank === Rank.Ace) index = 54;
        else if (rank === Rank.King) index = 13;
        else if (rank === Rank.Queen) index = 14;
        else if (rank === Rank.Jack) index = 15;
        else index = 45 + (10 - parseInt(rank));
    }

    return `${prefix}_${version}_${index.toString().padStart(2, '0')}_${suitName}_${rankName}.png`;
};

export const generateDeck = (gameType: GameType, cardStyle: CardStyle): CardConfig[] => {
  const config = GAME_VARIANTS[gameType];
  const deck: CardConfig[] = [];
  const suits = Object.values(Suit);
  let idCounter = 1;

  // --- CONFIGURATION PER GAME TYPE ---

  let baseUrl = '';
  let filePrefix: any = ''; // 'm1h', 'm2h', 'pst', 'p2b', 'p4b'
  let version = 'v1';
  let isMarias = false;

  switch(gameType) {
      // MARIAS SINGLE (M1H)
      // Folder structure: RUB (v1), RUB_a_LIC (v2 - UNDERSCORE), RUB a LIC_obliceje (v3 - SPACES)
      case GameType.MariasSingle: 
          isMarias = true;
          filePrefix = 'm1h';
          if (cardStyle === CardStyle.BackAndFaceFaces) { 
              baseUrl = '/karty/M1H/RUB%20a%20LIC_obliceje/'; 
              version = 'v3'; 
          }
          else if (cardStyle === CardStyle.BackAndFace) { 
              baseUrl = '/karty/M1H/RUB_a_LIC/'; 
              version = 'v2'; 
          }
          else { 
              baseUrl = '/karty/M1H/RUB/'; 
              version = 'v1'; 
          }
          break;

      // MARIAS DOUBLE (M2H)
      // Folder structure based on file list (only RUB exists, others predicted)
      // RUB (v1), RUB a LIC (v2?), RUB a LIC_obliceje (v3?)
      case GameType.MariasDouble: 
          isMarias = true;
          filePrefix = 'm2h';
          if (cardStyle === CardStyle.BackAndFaceFaces) { 
              baseUrl = '/karty/M2H/RUB%20a%20LIC_obliceje/'; 
              version = 'v3'; // Guessing version
          }
          else if (cardStyle === CardStyle.BackAndFace) { 
              baseUrl = '/karty/M2H/RUB%20a%20LIC/'; 
              version = 'v2'; // Guessing version
          }
          else { 
              baseUrl = '/karty/M2H/RUB/';
              version = 'v1';
          }
          break;

      // POKER STANDARD (PST2BIG)
      case GameType.PokerStandard: 
          filePrefix = 'p2b'; 
          if (cardStyle === CardStyle.BackAndFace) { 
              baseUrl = '/karty/PST2BIG/RUB%20a%20LIC/'; 
              version = 'v3'; 
          }
          else if (cardStyle === CardStyle.BackAndFaceFaces) { 
              baseUrl = '/karty/PST2BIG/RUB%20a%20LIC_figury/'; 
              version = 'v2'; 
          }
          else { 
              baseUrl = '/karty/PST2BIG/RUB/'; 
              version = 'v1'; 
          }
          break;

      // POKER BIG (PST4BIG)
      case GameType.PokerBig: 
          filePrefix = 'p4b';
          if (cardStyle === CardStyle.BackAndFace) { 
              baseUrl = '/karty/PST4BIG/RUB%20a%20LIC/'; 
              version = 'v3'; 
          }
          else if (cardStyle === CardStyle.BackAndFaceFaces) { 
              baseUrl = '/karty/PST4BIG/RUB%20a%20LIC_figury/'; 
              version = 'v2'; 
          }
          else { 
              baseUrl = '/karty/PST4BIG/RUB/'; 
              version = 'v1'; 
          }
          break;

      // CANASTA (PST a CAN)
      case GameType.Canasta: 
          filePrefix = 'pst';
          if (cardStyle === CardStyle.BackAndFace) { 
              baseUrl = '/karty/PST%20a%20CAN/RUB%20a%20LIC/'; 
              version = 'v3'; 
          }
          else if (cardStyle === CardStyle.BackAndFaceFaces) { 
              baseUrl = '/karty/PST%20a%20CAN/RUB%20a%20LIC_figury/'; 
              version = 'v2'; 
          }
          else { 
              baseUrl = '/karty/PST%20a%20CAN/RUB/'; 
              version = 'v1'; 
          }
          break;
  }

  // --- GENERATE CARDS ---
  suits.forEach(suit => {
    config.ranks.forEach(rank => {
      let templateImage: string | undefined = undefined;
      let isLocked = false;

      // Generate filename
      const fileName = isMarias 
        ? getMariasFileName(filePrefix, rank, suit, version)
        : getPokerFileName(filePrefix, rank, suit, version);
      
      templateImage = `${baseUrl}${fileName}`;

      // Locking Logic
      if (cardStyle === CardStyle.BackOnly) {
          isLocked = true;
      } else if (cardStyle === CardStyle.BackAndFaceFaces) {
          // Only faces unlocked
          if (isMarias) {
              if (![Rank.Jack, Rank.Queen, Rank.King].includes(rank)) isLocked = true;
          } else {
              if (![Rank.Jack, Rank.Queen, Rank.King].includes(rank)) isLocked = true;
          }
      } else if (cardStyle === CardStyle.BackAndFace) {
          // Marias: 7-10 locked. Poker: All unlocked (usually)
          if (isMarias) {
              if ([Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten].includes(rank)) isLocked = true;
          }
      }

      deck.push({
        id: `card-${idCounter++}`,
        suit, rank, customImage: null,
        templateImage, imageScale: 1, imageX: 0, imageY: 0,
        customText: '', borderColor: '#D4AF37', gameType, isLocked
      });
    });
  });

  // --- JOKERS (For Poker/Canasta) ---
  if ([GameType.PokerStandard, GameType.PokerBig, GameType.Canasta].includes(gameType)) {
      const jokerLocked = cardStyle === CardStyle.BackOnly;
      
      // Filenames for Jokers
      const redJoker = getPokerFileName(filePrefix, Rank.Joker, Suit.Hearts, version); // ID 02
      const blackJoker = getPokerFileName(filePrefix, Rank.Joker, Suit.Spades, version); // ID 03

      deck.push({
          id: `card-joker-1-${idCounter++}`,
          suit: Suit.Hearts, rank: Rank.Joker, customImage: null,
          templateImage: `${baseUrl}${redJoker}`,
          imageScale: 1, imageX: 0, imageY: 0, customText: '', borderColor: '#D4AF37', gameType, isLocked: jokerLocked
      });
      deck.push({
          id: `card-joker-2-${idCounter++}`,
          suit: Suit.Spades, rank: Rank.Joker, customImage: null,
          templateImage: `${baseUrl}${blackJoker}`,
          imageScale: 1, imageX: 0, imageY: 0, customText: '', borderColor: '#D4AF37', gameType, isLocked: jokerLocked
      });
  }

  return deck;
};

export const getRankLabel = (rank: Rank, gameType: GameType): string => {
  if (rank === Rank.Joker) return 'JOKER';

  const isMarias = gameType === GameType.MariasSingle || gameType === GameType.MariasDouble;
  
  if (isMarias) {
    switch(rank) {
      case Rank.Jack: return 'Spodek';
      case Rank.Queen: return 'Svršek';
      case Rank.King: return 'Král';
      case Rank.Ace: return 'Eso';
      default: return rank;
    }
  } else {
    switch(rank) {
      case Rank.Jack: return 'J';
      case Rank.Queen: return 'Q';
      case Rank.King: return 'K';
      case Rank.Ace: return 'A';
      default: return rank;
    }
  }
};