import React, { useState, useEffect } from 'react';
import { CardConfig, Suit, GameType, Rank, CardBackConfig } from '../types';
import { getSuitIcon } from './Icons';
import { getRankLabel } from '../utils/deckBuilder';

export interface CardPreviewProps {
  card?: CardConfig;
  backConfig?: CardBackConfig;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  printMode?: boolean;
  side?: 'face' | 'back';
  showCenterMark?: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ 
  card, 
  backConfig,
  className = '', 
  onClick, 
  selected, 
  printMode = false,
  side = 'face',
  showCenterMark = false
}) => {
  const isBack = side === 'back';
  const gameType = card?.gameType || GameType.PokerStandard;
  
  // Vždy používáme anonymous pro externí obrázky (CORS)
  const crossOriginAttr = "anonymous";
  const [imgError, setImgError] = useState(false);

  // Reset error state when card changes
  useEffect(() => {
    setImgError(false);
  }, [card?.templateImage, backConfig?.customImage]);

  const getAspectRatioClass = () => {
    if (printMode) return 'w-full h-full';
    switch (gameType) {
      case GameType.MariasSingle:
      case GameType.MariasDouble:
        return 'aspect-[56/89]';
      case GameType.Canasta:
        return 'aspect-[57/88]';
      default:
        return 'aspect-[63/88]';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.currentTarget;
      let src = target.src;
      
      if (src.includes('retry=done')) {
          setImgError(true);
          return;
      }

      console.warn("Failed to load image. Attempting recovery...", src);
      
      // Pokus o opravu cesty na lowercase
      const url = new URL(src);
      if (!url.searchParams.has('retry')) {
           const lowerPath = url.pathname.toLowerCase();
           target.src = `${url.origin}${lowerPath}${url.search}&retry=done`;
      } else {
           setImgError(true);
      }
  };

  // --- RENDER BACK ---
  if (isBack) {
    const defaultPattern = "radial-gradient(circle, #0F1623 0%, #05080F 100%)";
    const image = backConfig?.customImage;
    const scale = backConfig?.imageScale || 1;
    const x = backConfig?.imageX || 0;
    const y = backConfig?.imageY || 0;
    const borderColor = backConfig?.borderColor || '#D4AF37';
    const text = backConfig?.customText;

    const containerClasses = printMode 
      ? `relative w-full h-full overflow-hidden bg-white ${className}`
      : `relative group perspective-1000 w-full ${getAspectRatioClass()} transition-transform duration-300 ${selected ? 'scale-105 z-10' : 'hover:scale-[1.02]'} ${className}`;

    const innerClasses = printMode
      ? `w-full h-full relative border-[1px] border-gray-300 overflow-hidden`
      : `w-full h-full rounded-xl shadow-xl overflow-hidden relative border-[6px] transition-all duration-300 ${selected ? 'ring-4 ring-gold-500 ring-offset-2 ring-offset-navy-900' : ''}`;

    return (
      <div onClick={!printMode ? onClick : undefined} className={containerClasses}>
        <div className={innerClasses} style={{ borderColor: printMode ? '#000000' : borderColor, background: !image || imgError ? defaultPattern : 'white' }}>
           {image && !imgError ? (
             <div className="absolute inset-0 overflow-hidden">
                <img 
                  src={image} 
                  alt="Card Back" 
                  crossOrigin={crossOriginAttr}
                  onError={handleImageError}
                  className="w-full h-full object-cover transition-transform duration-100"
                  style={{ transform: `scale(${scale}) translate(${x}%, ${y}%)` }}
                />
             </div>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-16 h-16 border-2 border-gold-500 transform rotate-45"></div>
             </div>
           )}
           
           {/* Center Mark for Print */}
           {showCenterMark && !printMode && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="w-8 h-[1px] bg-gold-500/50 absolute"></div>
                <div className="h-8 w-[1px] bg-gold-500/50 absolute"></div>
                <div className="w-2 h-2 rounded-full border border-gold-500/50 absolute"></div>
              </div>
           )}
           
           {text && (
            <div className={`absolute top-1/2 left-0 right-0 -translate-y-1/2 z-30 flex justify-center`}>
              <span className={`bg-navy-900/90 backdrop-blur-sm px-3 py-1 text-gold-400 font-serif font-bold italic shadow-lg text-xs md:text-sm border-y border-gold-500 ${printMode ? 'border text-black bg-white' : ''}`}>
                {text}
              </span>
            </div>
           )}

           {(!image || imgError) && !printMode && (
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           )}
        </div>
      </div>
    );
  }

  // --- RENDER FACE ---
  if (!card) return null;

  const isJoker = card.rank === Rank.Joker;
  const isRed = card.suit === Suit.Hearts || card.suit === Suit.Diamonds;
  const isJokerRed = isJoker && (card.suit === Suit.Hearts || card.suit === Suit.Diamonds);
  const isSingleHeaded = card.gameType === GameType.MariasSingle;
  const rankLabel = getRankLabel(card.rank, card.gameType);
  const hasTemplate = !!card.templateImage;
  const isMaskStyle = hasTemplate && (
    (card.templateImage || '').toLowerCase().includes('obliceje') || 
    (card.templateImage || '').toLowerCase().includes('figury')
  );

  const containerClasses = printMode 
    ? `relative w-full h-full overflow-hidden bg-white ${className}`
    : `relative group perspective-1000 w-full ${getAspectRatioClass()} transition-transform duration-300 ${selected ? 'scale-105 z-10' : 'hover:scale-[1.02]'} ${className}`;

  const innerClasses = printMode
    ? `w-full h-full bg-white relative border-[1px] border-gray-300 overflow-hidden`
    : `w-full h-full rounded-xl bg-white shadow-xl overflow-hidden relative border-[6px] transition-all duration-300 ${selected ? 'ring-4 ring-gold-500 ring-offset-2 ring-offset-navy-900' : ''}`;

  return (
    <div onClick={!printMode ? onClick : undefined} className={containerClasses}>
      <div className={innerClasses} style={{ borderColor: printMode ? '#000000' : card.borderColor }}>
        
        {/* CSS FALLBACK */}
        {(!hasTemplate || imgError) && (
            <>
                <div className="absolute top-[5%] left-[5%] flex flex-col items-center z-20">
                {isJoker ? (
                    <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 mb-1 ${isJokerRed ? 'text-red-600' : 'text-slate-900'}`}>
                        {getSuitIcon(card.suit, "w-full h-full", true)}
                        </div>
                        <span className={`text-[8px] md:text-[10px] font-bold font-sans tracking-tighter uppercase writing-mode-vertical ${isJokerRed ? 'text-red-600' : 'text-slate-900'}`} style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                            JOKER
                        </span>
                    </div>
                ) : (
                    <>
                        <span className={`text-xl md:text-2xl font-bold font-serif leading-none ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
                        {rankLabel}
                        </span>
                        <div className="w-4 h-4 md:w-5 md:h-5 mt-0.5">
                            {getSuitIcon(card.suit, "w-full h-full")}
                        </div>
                    </>
                )}
                </div>

                {!isSingleHeaded && (
                <div className="absolute bottom-[5%] right-[5%] flex flex-col items-center transform rotate-180 z-20">
                    {isJoker ? (
                    <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 mb-1 ${isJokerRed ? 'text-red-600' : 'text-slate-900'}`}>
                            {getSuitIcon(card.suit, "w-full h-full", true)}
                        </div>
                        <span className={`text-[8px] md:text-[10px] font-bold font-sans tracking-tighter uppercase writing-mode-vertical ${isJokerRed ? 'text-red-600' : 'text-slate-900'}`} style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                            JOKER
                        </span>
                    </div>
                    ) : (
                    <>
                        <span className={`text-xl md:text-2xl font-bold font-serif leading-none ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
                        {rankLabel}
                        </span>
                        <div className="w-4 h-4 md:w-5 md:h-5 mt-0.5">
                        {getSuitIcon(card.suit, "w-full h-full")}
                        </div>
                    </>
                    )}
                </div>
                )}

                {(!card.customImage) && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                         {getSuitIcon(card.suit, "w-32 h-32", isJoker)}
                    </div>
                )}
            </>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
           {/* TEMPLATE IMAGE (z nového serveru) */}
           {hasTemplate && !isMaskStyle && card.templateImage && !imgError && (
               <div className="absolute inset-0 z-0">
                   <img 
                    src={card.templateImage} 
                    alt="Template" 
                    crossOrigin={crossOriginAttr}
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                   />
               </div>
           )}

           {card.customImage ? (
             <div className={`relative w-full h-full ${isMaskStyle ? 'z-0' : 'z-10'}`}>
               {card.isBackgroundRemoved && !printMode && (
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-30 z-0"></div>
               )}

               {isSingleHeaded ? (
                 <img 
                   src={card.customImage} 
                   alt="Custom" 
                   crossOrigin={crossOriginAttr}
                   className={`w-full h-full object-cover z-10 transition-transform duration-100 ${card.isBackgroundRemoved ? 'object-contain scale-90' : ''}`}
                   style={{ transform: `scale(${card.imageScale}) translate(${card.imageX}%, ${card.imageY}%)` }}
                 />
               ) : (
                 <>
                   <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden z-10">
                      <img 
                        src={card.customImage} 
                        alt="Top" 
                        crossOrigin={crossOriginAttr}
                        className={`w-full h-[200%] object-cover object-top transition-transform duration-100 ${card.isBackgroundRemoved ? 'object-contain' : ''}`}
                        style={{ transform: `scale(${card.imageScale}) translate(${card.imageX}%, ${card.imageY}%)` }}
                      />
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden transform rotate-180 z-10 border-t border-white/20">
                      <img 
                        src={card.customImage} 
                        alt="Bottom" 
                        crossOrigin={crossOriginAttr}
                        className={`w-full h-[200%] object-cover object-top transition-transform duration-100 ${card.isBackgroundRemoved ? 'object-contain' : ''}`}
                        style={{ transform: `scale(${card.imageScale}) translate(${card.imageX}%, ${card.imageY}%)` }}
                      />
                   </div>
                 </>
               )}
             </div>
           ) : (
             !hasTemplate && (
                 <div className="text-gray-300 flex flex-col items-center p-4 text-center z-10">
                {isJoker ? (
                    <div className={`w-24 h-24 opacity-20 ${isJokerRed ? 'text-red-600' : 'text-slate-900'}`}>
                        {getSuitIcon(card.suit, "w-full h-full", true)}
                    </div>
                ) : (
                    <span className="mb-2 text-3xl opacity-20">📷</span>
                )}
                </div>
             )
           )}

           {hasTemplate && isMaskStyle && card.templateImage && !imgError && (
               <div className="absolute inset-0 z-20 pointer-events-none">
                   <img 
                    src={card.templateImage} 
                    alt="Template" 
                    crossOrigin={crossOriginAttr}
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                   />
               </div>
           )}

           {showCenterMark && !printMode && card.customImage && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                <div className="w-8 h-[1px] bg-gold-500/50 absolute"></div>
                <div className="h-8 w-[1px] bg-gold-500/50 absolute"></div>
                <div className="w-2 h-2 rounded-full border border-gold-500/50 absolute"></div>
              </div>
           )}
        </div>

        {card.customText && (
          <div className={`absolute left-0 right-0 z-40 flex justify-center ${isSingleHeaded ? 'bottom-[10%]' : 'top-1/2 -translate-y-1/2'}`}>
            <span 
              className={`bg-white/90 backdrop-blur-sm px-3 py-1 text-navy-900 font-serif font-bold italic shadow-lg text-xs md:text-sm border-y border-gold-400 ${printMode ? 'border text-black' : ''}`}
            >
              {card.customText}
            </span>
          </div>
        )}

        {!printMode && <div className="absolute inset-1 border border-gold-400 opacity-30 rounded-[8px] pointer-events-none z-50"></div>}
      </div>
    </div>
  );
};