import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recipe } from '../types';
import { ItemSprite } from './ItemSprite';
import { itemsMap } from '../data/materials';
import { sound } from '../utils/audio';
import { showToast } from './ToastSystem';
import { ArrowRight, Play, CheckCircle2, Copy, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface CraftingGridProps {
  recipe: Recipe;
  allRecipeVariants?: Recipe[];
  currentVariantIndex?: number;
  onSelectVariant?: (index: number) => void;
  onSelectIngredient?: (materialId: string) => void;
}

export const CraftingGrid: React.FC<CraftingGridProps> = ({
  recipe,
  allRecipeVariants = [recipe],
  currentVariantIndex = 0,
  onSelectVariant,
  onSelectIngredient,
}) => {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setActiveStep(-1);
    setIsSimulating(false);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [recipe.id]);

  const handleSimulateCraft = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(-1);

    const filledIndices = recipe.grid
      .map((item, idx) => (item ? idx : -1))
      .filter((idx) => idx !== -1);

    filledIndices.forEach((slotIdx, step) => {
      timers.current.push(
        window.setTimeout(() => {
          setActiveStep(slotIdx);
          sound.playWoodClick();
        }, (step + 1) * 200)
      );
    });

    timers.current.push(
      window.setTimeout(() => {
        setActiveStep(99);
        sound.playCraftSuccess();
        timers.current.push(
          window.setTimeout(() => {
            setIsSimulating(false);
            setActiveStep(-1);
          }, 1200)
        );
      }, (filledIndices.length + 1) * 200 + 200)
    );
  };

  const handleCopyGiveCommand = () => {
    const cmd = recipe.giveCommand || `/give @p minecraft:${recipe.output.item} ${recipe.output.count}`;
    const done = () => {
      sound.playPop();
      setCopied(true);
      timers.current.push(window.setTimeout(() => setCopied(false), 2000));
    };
    const failed = () => {
      showToast({ title: 'Copy Failed', description: 'Clipboard blocked — copy the command manually', type: 'warning' });
    };
    // ponytail: Clipboard API throws sync where undefined + rejects off HTTPS; legacy fallback, toast instead of silent fail
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(cmd).then(done, failed);
        return;
      }
      const ta = document.createElement('textarea');
      ta.value = cmd;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) done();
      else failed();
    } catch {
      failed();
    }
  };

  const ingredientCounts = useMemo<Record<string, { name: string; count: number }>>(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    recipe.grid.forEach((item) => {
      if (item) {
        if (!counts[item]) {
          const mat = itemsMap[item];
          const displayName = mat ? mat.name : item.replace(/^minecraft:/, '').replace(/_/g, ' ');
          counts[item] = { name: displayName, count: 0 };
        }
        counts[item].count += 1;
      }
    });
    return counts;
  }, [recipe]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Recipe Header Info Banner */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-[#171c19] border border-[#353e37] rounded-t-sm mb-[-2px] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[#55C64B] flex items-center gap-1 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {recipe.shapeless ? 'SHAPELESS CRAFTING' : '3×3 SHAPED CRAFTING'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#252f28] text-[#A8A8A8] border border-[#353e37] rounded-xs font-mono">
            {recipe.version}
          </span>
        </div>

        {/* Recipe Variant Switcher */}
        {allRecipeVariants.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectVariant && onSelectVariant((currentVariantIndex - 1 + allRecipeVariants.length) % allRecipeVariants.length)}
              className="p-1 text-[#A8A8A8] hover:text-[#FFFFFF] bg-[#222a25] border border-[#353e37] rounded-xs cursor-pointer"
              title="Previous Recipe Pattern"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-pixel text-[10px] text-[#FFFFFF] px-1">
              Variant {currentVariantIndex + 1}/{allRecipeVariants.length}
            </span>
            <button
              type="button"
              onClick={() => onSelectVariant && onSelectVariant((currentVariantIndex + 1) % allRecipeVariants.length)}
              className="p-1 text-[#A8A8A8] hover:text-[#FFFFFF] bg-[#222a25] border border-[#353e37] rounded-xs cursor-pointer"
              title="Next Recipe Pattern"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main 3x3 Grid & Output Workstation Card */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 bg-[#181d1a] p-6 sm:p-8 rounded-b-sm border-2 border-[#353e37] shadow-[0_8px_24px_rgba(0,0,0,0.8)] w-full">
        {/* 3x3 Grid Matrix */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#111412] rounded-xs border-2 border-[#2b332d] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.9)] shrink-0">
          {recipe.grid.map((materialId, idx) => {
            // ponytail: index compare reveals in slot order; duplicates reveal on their own turn
            const isVisible = !isSimulating || activeStep === 99 || idx <= activeStep;
            const isHighlighted = isSimulating && activeStep === idx;
            const matInfo = materialId ? itemsMap[materialId] : null;
            const displayName = matInfo ? matInfo.name : (materialId || '').replace(/^minecraft:/, '').replace(/_/g, ' ');

            return (
              <div
                key={idx}
                role={materialId && onSelectIngredient ? 'button' : undefined}
                tabIndex={materialId && onSelectIngredient ? 0 : undefined}
                aria-label={materialId ? `View recipe for ${displayName}` : undefined}
                onClick={() => {
                  if (materialId && onSelectIngredient) {
                    sound.playPop();
                    onSelectIngredient(materialId);
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && materialId && onSelectIngredient) {
                    e.preventDefault();
                    sound.playPop();
                    onSelectIngredient(materialId);
                  }
                }}
                className={`minecraft-slot group relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all ${
                  isHighlighted ? 'minecraft-slot-active scale-105 border-[#55C64B]' : ''
                } ${
                  materialId && onSelectIngredient
                    ? 'cursor-pointer hover:border-[#55C64B] hover:bg-[#1a241c]'
                    : ''
                }`}
              >
                {materialId && isVisible ? (
                  <ItemSprite
                    id={materialId}
                    name={displayName}
                    size="lg"
                    className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  />
                ) : (
                  <span className="font-pixel text-[10px] text-[#3b473e] select-none">
                    {idx + 1}
                  </span>
                )}

                {/* Slot Hover Badge (CSS-only, no re-render) */}
                {materialId && (
                  <div className="hidden group-hover:block absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0d100e] border border-[#55C64B] px-2.5 py-1 rounded-xs text-[11px] font-pixel text-[#FFFFFF] shadow-2xl pointer-events-none z-50">
                    <span className="text-[#55C64B]">Click to craft:</span> {displayName}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Arrow Indicator */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#222a25] border-2 border-[#353e37] flex items-center justify-center text-[#55C64B] shadow-[0_3px_0_#0d100e]">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-pixel text-[10px] text-[#A8A8A8] mt-1.5 uppercase tracking-wider">
            Yields
          </span>
        </div>

        {/* Output Slot & Created Item Details */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <div
              className={`minecraft-slot-output relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xs transition-transform ${
                activeStep === 99
                  ? 'scale-110 shadow-[0_0_25px_rgba(85,198,75,0.7)] border-[#55C64B]'
                  : ''
              }`}
            >
              <ItemSprite
                id={recipe.output.item}
                name={recipe.name}
                size="hero"
                className={`drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] ${
                  activeStep === 99 ? 'animate-bounce' : ''
                }`}
              />
              {recipe.output.count > 1 && (
                <span className="absolute bottom-1 right-2 font-pixel text-base font-bold text-[#FFFFFF] drop-shadow-[2px_2px_0px_#000000]">
                  ×{recipe.output.count}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="font-pixel font-bold text-lg sm:text-xl text-[#FFFFFF] leading-tight">
                {recipe.name}
              </h3>
              <span className="text-xs text-[#A8A8A8] font-mono mt-0.5">
                ID: <code className="text-[#55C64B]">{recipe.output.item}</code>
              </span>
              <span className="text-[11px] text-[#6e7d72] mt-1 line-clamp-2">
                {recipe.description}
              </span>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 w-full">
            <button
              type="button"
              onClick={handleSimulateCraft}
              disabled={isSimulating}
              className={`btn-3d px-3.5 py-1.5 rounded-xs font-pixel text-xs flex items-center gap-1.5 cursor-pointer text-black ${
                isSimulating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSimulating ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Crafting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate 3D Craft</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyGiveCommand}
              className="btn-3d-secondary px-3 py-1.5 rounded-xs font-pixel text-xs flex items-center gap-1.5 text-[#FFFFFF] hover:text-[#55C64B] cursor-pointer"
              title={recipe.giveCommand || `/give @p minecraft:${recipe.output.item} ${recipe.output.count}`}
            >
              <Copy className="w-3.5 h-3.5 text-[#55C64B]" />
              <span>{copied ? 'Copied Command!' : '/give command'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients Summary Strip */}
      <div className="mt-3 w-full bg-[#141815] border border-[#353e37] rounded-sm p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-pixel text-[#A8A8A8] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#55C64B]" />
          Required Ingredients:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(ingredientCounts).map((matId) => {
            const { name, count } = ingredientCounts[matId];
            return (
            <button
              key={matId}
              type="button"
              onClick={() => onSelectIngredient && onSelectIngredient(matId)}
              className="px-2.5 py-1 bg-[#1d241f] hover:bg-[#27322a] border border-[#353e37] hover:border-[#55C64B] rounded-xs font-mono text-xs text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ItemSprite id={matId} size="sm" />
              <span>{name}</span>
              <span className="text-[#55C64B] font-bold">×{count}</span>
            </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
