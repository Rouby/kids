import { Button, Container, Group, Paper, Stack, Text, Title, ColorSwatch, Slider } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useCallback, useRef, useMemo } from 'react';
import { usePoints } from '../hooks/usePoints';

// Color name mappings for accessibility
const COLOR_NAMES: Record<string, string> = {
  '#D32F2F': 'Dunkelrot',
  '#C2185B': 'Kirschrot',
  '#E91E63': 'Pink',
  '#FF4081': 'Hellpink',
  '#FF6B6B': 'Korallenrot',
  '#AD1457': 'Magenta',
  '#880E4F': 'Burgunder',
  '#B71C1C': 'Tiefrot',
  '#7B1FA2': 'Lila',
  '#512DA8': 'Violett',
  '#303F9F': 'Indigo',
  '#1976D2': 'Blau',
  '#00796B': 'Türkis',
  '#388E3C': 'Grün',
  '#F57C00': 'Orange',
  '#5D4037': 'Braun',
  '#00BCD4': 'Cyan',
  '#FFCDD2': 'Zartrosa',
  '#F8BBD9': 'Hellrosa',
  '#FCE4EC': 'Blassrosa',
  '#FFAB91': 'Pfirsich',
  '#FFCCBC': 'Apricot',
  '#E1BEE7': 'Lavendel',
  '#212121': 'Schwarz',
  '#3E2723': 'Dunkelbraun',
  '#1A237E': 'Dunkelblau',
  '#4A148C': 'Dunkellila',
  '#006064': 'Dunkelcyan',
  '#1B5E20': 'Dunkelgrün',
  '#000000': 'Tiefschwarz',
  '#FDEBD0': 'Elfenbein',
  '#F5CBA7': 'Beige',
  '#E8BEAC': 'Sand',
  '#D4A574': 'Karamell',
  '#C68642': 'Bronze',
  '#8D5524': 'Mokka',
};

// Unique stroke ID counter
let strokeIdCounter = 0;

// Makeup tool types
type MakeupToolType = 'lipstick' | 'eyeshadow' | 'blush' | 'eyeliner' | 'mascara' | 'foundation';

// Brush stroke for painting
interface BrushStroke {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  tool: MakeupToolType;
  opacity: number;
}

// Color palettes for each tool
const TOOL_COLORS: Record<MakeupToolType, string[]> = {
  lipstick: ['#D32F2F', '#C2185B', '#E91E63', '#FF4081', '#FF6B6B', '#AD1457', '#880E4F', '#B71C1C'],
  eyeshadow: ['#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#00796B', '#388E3C', '#F57C00', '#5D4037', '#E91E63', '#00BCD4'],
  blush: ['#FFCDD2', '#F8BBD9', '#FCE4EC', '#FFAB91', '#FFCCBC', '#E1BEE7'],
  eyeliner: ['#212121', '#3E2723', '#1A237E', '#4A148C', '#006064', '#1B5E20'],
  mascara: ['#212121', '#3E2723', '#000000'],
  foundation: ['#FDEBD0', '#F5CBA7', '#E8BEAC', '#D4A574', '#C68642', '#8D5524'],
};

const TOOL_ICONS: Record<MakeupToolType, string> = {
  lipstick: '💄',
  eyeshadow: '🎨',
  blush: '🌸',
  eyeliner: '✏️',
  mascara: '🖌️',
  foundation: '🧴',
};

const TOOL_NAMES: Record<MakeupToolType, string> = {
  lipstick: 'Lippenstift',
  eyeshadow: 'Lidschatten',
  blush: 'Rouge',
  eyeliner: 'Eyeliner',
  mascara: 'Wimperntusche',
  foundation: 'Grundierung',
};

// Brush sizes for each tool
const TOOL_BRUSH_SIZES: Record<MakeupToolType, number> = {
  lipstick: 8,
  eyeshadow: 15,
  blush: 25,
  eyeliner: 3,
  mascara: 4,
  foundation: 30,
};

// Realistic Avatar component with painting canvas
interface AvatarProps {
  brushStrokes: BrushStroke[];
  onPaint: (x: number, y: number) => void;
  isPainting: boolean;
  setIsPainting: (painting: boolean) => void;
}

function Avatar({ brushStrokes, onPaint, isPainting, setIsPainting }: AvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const getPosition = (clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 400 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };
  
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPainting(true);
    const pos = getPosition(e.clientX, e.clientY);
    if (pos) onPaint(pos.x, pos.y);
  };
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPainting) return;
    const pos = getPosition(e.clientX, e.clientY);
    if (pos) onPaint(pos.x, pos.y);
  };
  
  const handleMouseUp = () => {
    setIsPainting(false);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    setIsPainting(true);
    const touch = e.touches[0];
    const pos = getPosition(touch.clientX, touch.clientY);
    if (pos) onPaint(pos.x, pos.y);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!isPainting) return;
    const touch = e.touches[0];
    const pos = getPosition(touch.clientX, touch.clientY);
    if (pos) onPaint(pos.x, pos.y);
  };

  const handleTouchEnd = () => {
    setIsPainting(false);
  };

  // Memoize brush strokes rendering for performance
  const renderedStrokes = useMemo(() => {
    return brushStrokes.map((stroke) => {
      // Create more realistic makeup effects based on tool type
      const getStrokeStyle = () => {
        switch (stroke.tool) {
          case 'lipstick':
            return { opacity: stroke.opacity * 0.85, filter: 'url(#lipBlur)' };
          case 'eyeshadow':
            return { opacity: stroke.opacity * 0.6, filter: 'url(#eyeshadowBlur)' };
          case 'blush':
            return { opacity: stroke.opacity * 0.35, filter: 'url(#blushBlur)' };
          case 'foundation':
            return { opacity: stroke.opacity * 0.2, filter: 'url(#foundationBlur)' };
          case 'eyeliner':
            return { opacity: stroke.opacity * 0.9, filter: 'none' };
          case 'mascara':
            return { opacity: stroke.opacity * 0.85, filter: 'none' };
          default:
            return { opacity: stroke.opacity * 0.5, filter: 'none' };
        }
      };
      
      const style = getStrokeStyle();
      
      return (
        <circle
          key={stroke.id}
          cx={stroke.x}
          cy={stroke.y}
          r={stroke.size}
          fill={stroke.color}
          opacity={style.opacity}
          style={{ mixBlendMode: stroke.tool === 'foundation' ? 'normal' : 'multiply', filter: style.filter }}
        />
      );
    });
  }, [brushStrokes]);

  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 300 400" 
      width="300" 
      height="400" 
      role="img"
      aria-label="Make-up Artist Gesicht zum Bemalen"
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
        cursor: 'crosshair',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <defs>
        {/* Blur filters for realistic makeup effects */}
        <filter id="lipBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
        </filter>
        <filter id="eyeshadowBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        <filter id="blushBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>
        <filter id="foundationBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
        </filter>
        
        {/* Realistic skin gradient with subtle variations */}
        <radialGradient id="skinGradient" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FCECD9" />
          <stop offset="30%" stopColor="#F8D9C4" />
          <stop offset="60%" stopColor="#F0C8B0" />
          <stop offset="100%" stopColor="#E0B090" />
        </radialGradient>
        
        {/* Forehead gradient */}
        <radialGradient id="foreheadGradient" cx="50%" cy="100%" r="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        
        {/* Cheek shadow gradient */}
        <radialGradient id="cheekShadowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(200,150,130,0.15)" />
          <stop offset="100%" stopColor="rgba(200,150,130,0)" />
        </radialGradient>
        
        {/* Natural lip color gradient */}
        <linearGradient id="lipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4918A" />
          <stop offset="40%" stopColor="#C8827A" />
          <stop offset="100%" stopColor="#B87068" />
        </linearGradient>
        
        {/* Lip highlight */}
        <linearGradient id="lipHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        
        {/* Realistic hair gradient */}
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3D2B1F" />
          <stop offset="30%" stopColor="#2C1810" />
          <stop offset="100%" stopColor="#1A0F0A" />
        </linearGradient>
        
        {/* Hair highlight */}
        <radialGradient id="hairHighlight" cx="30%" cy="20%" r="40%">
          <stop offset="0%" stopColor="rgba(100,70,50,0.4)" />
          <stop offset="100%" stopColor="rgba(100,70,50,0)" />
        </radialGradient>
        
        {/* Nose shadow */}
        <linearGradient id="noseShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(180,140,100,0.12)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(180,140,100,0.15)" />
        </linearGradient>
        
        {/* Eye socket shadow */}
        <radialGradient id="eyeSocketGradient" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="rgba(150,120,100,0.08)" />
          <stop offset="100%" stopColor="rgba(150,120,100,0)" />
        </radialGradient>
        
        {/* Iris gradient for realistic eyes */}
        <radialGradient id="irisGradient" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="50%" stopColor="#5D4A1F" />
          <stop offset="100%" stopColor="#3D2B1F" />
        </radialGradient>
        
        {/* Clip path for face area */}
        <clipPath id="faceClip">
          <path d="M55 140 Q55 80 150 65 Q245 80 245 140 Q250 200 245 240 Q220 310 150 320 Q80 310 55 240 Q50 200 55 140 Z" />
        </clipPath>
        
        {/* Lip clip path */}
        <clipPath id="lipClip">
          <ellipse cx="150" cy="262" rx="35" ry="18" />
        </clipPath>
      </defs>
      
      {/* Background/Neck with realistic shading */}
      <path 
        d="M115 295 Q115 310 120 350 L180 350 Q185 310 185 295" 
        fill="url(#skinGradient)" 
      />
      <ellipse cx="150" cy="298" rx="38" ry="12" fill="url(#skinGradient)" />
      {/* Neck shadow */}
      <ellipse cx="150" cy="302" rx="32" ry="8" fill="rgba(180,140,100,0.1)" />
      
      {/* Hair back - fuller and more realistic */}
      <ellipse cx="150" cy="95" rx="105" ry="85" fill="url(#hairGradient)" />
      <ellipse cx="150" cy="95" rx="105" ry="85" fill="url(#hairHighlight)" />
      
      {/* Face base - more natural face shape with jawline */}
      <path 
        d="M55 140 Q55 80 150 65 Q245 80 245 140 Q250 200 245 240 Q220 310 150 320 Q80 310 55 240 Q50 200 55 140 Z" 
        fill="url(#skinGradient)" 
      />
      
      {/* Subtle face contouring */}
      <ellipse cx="150" cy="115" rx="55" ry="30" fill="url(#foreheadGradient)" />
      <ellipse cx="75" cy="220" rx="35" ry="45" fill="url(#cheekShadowGradient)" />
      <ellipse cx="225" cy="220" rx="35" ry="45" fill="url(#cheekShadowGradient)" />
      
      {/* Jawline definition */}
      <path 
        d="M75 250 Q100 300 150 315 Q200 300 225 250" 
        fill="none" 
        stroke="rgba(180,140,100,0.15)" 
        strokeWidth="3"
      />
      
      {/* Ears with inner detail */}
      <ellipse cx="52" cy="175" rx="10" ry="22" fill="url(#skinGradient)" />
      <ellipse cx="52" cy="175" rx="6" ry="15" fill="rgba(200,160,120,0.25)" />
      <ellipse cx="248" cy="175" rx="10" ry="22" fill="url(#skinGradient)" />
      <ellipse cx="248" cy="175" rx="6" ry="15" fill="rgba(200,160,120,0.25)" />
      
      {/* Hair front - natural looking bangs with texture */}
      <path 
        d="M55 130 Q70 55 150 45 Q230 55 245 130 Q230 95 150 85 Q70 95 55 130" 
        fill="url(#hairGradient)"
      />
      <path 
        d="M60 140 Q80 70 150 55 Q220 70 240 140 Q210 100 150 92 Q90 100 60 140" 
        fill="url(#hairGradient)"
      />
      {/* Hair strands for texture */}
      <path d="M80 120 Q90 80 100 60" stroke="rgba(60,35,20,0.3)" strokeWidth="2" fill="none" />
      <path d="M120 110 Q125 70 130 50" stroke="rgba(60,35,20,0.3)" strokeWidth="2" fill="none" />
      <path d="M170 110 Q175 70 180 50" stroke="rgba(60,35,20,0.3)" strokeWidth="2" fill="none" />
      <path d="M200 120 Q210 80 220 60" stroke="rgba(60,35,20,0.3)" strokeWidth="2" fill="none" />
      
      {/* Brush strokes layer - clipped to face */}
      <g clipPath="url(#faceClip)">
        {renderedStrokes}
      </g>
      
      {/* Eyebrows - natural individual hair strokes */}
      <g stroke="#3D2B1F" strokeLinecap="round" fill="none">
        {/* Left eyebrow */}
        <path d="M90 148 Q95 143 100 144" strokeWidth="2" />
        <path d="M95 146 Q102 140 110 142" strokeWidth="2.5" />
        <path d="M100 145 Q110 139 118 141" strokeWidth="2.5" />
        <path d="M108 144 Q118 139 125 142" strokeWidth="2" />
        <path d="M115 144 Q125 140 132 145" strokeWidth="1.5" />
        {/* Right eyebrow */}
        <path d="M168 145 Q178 140 185 144" strokeWidth="1.5" />
        <path d="M175 142 Q185 139 195 144" strokeWidth="2" />
        <path d="M182 141 Q192 139 202 145" strokeWidth="2.5" />
        <path d="M190 142 Q200 140 208 146" strokeWidth="2.5" />
        <path d="M200 144 Q207 143 212 148" strokeWidth="2" />
      </g>
      
      {/* Eye sockets - subtle shadows */}
      <ellipse cx="112" cy="175" rx="32" ry="20" fill="url(#eyeSocketGradient)" />
      <ellipse cx="188" cy="175" rx="32" ry="20" fill="url(#eyeSocketGradient)" />
      
      {/* Eyes - highly detailed and realistic */}
      {/* Left eye */}
      <ellipse cx="112" cy="178" rx="24" ry="14" fill="white" />
      <ellipse cx="112" cy="178" rx="24" ry="14" fill="none" stroke="rgba(100,70,50,0.2)" strokeWidth="0.5" />
      {/* Iris with detail */}
      <circle cx="112" cy="179" r="12" fill="url(#irisGradient)" />
      <circle cx="112" cy="179" r="12" fill="none" stroke="rgba(80,60,40,0.3)" strokeWidth="0.5" />
      {/* Pupil */}
      <circle cx="112" cy="179" r="5" fill="#1A0F0A" />
      {/* Eye highlights */}
      <circle cx="116" cy="175" r="3.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="108" cy="182" r="1.5" fill="rgba(255,255,255,0.5)" />
      
      {/* Right eye */}
      <ellipse cx="188" cy="178" rx="24" ry="14" fill="white" />
      <ellipse cx="188" cy="178" rx="24" ry="14" fill="none" stroke="rgba(100,70,50,0.2)" strokeWidth="0.5" />
      {/* Iris with detail */}
      <circle cx="188" cy="179" r="12" fill="url(#irisGradient)" />
      <circle cx="188" cy="179" r="12" fill="none" stroke="rgba(80,60,40,0.3)" strokeWidth="0.5" />
      {/* Pupil */}
      <circle cx="188" cy="179" r="5" fill="#1A0F0A" />
      {/* Eye highlights */}
      <circle cx="192" cy="175" r="3.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="184" cy="182" r="1.5" fill="rgba(255,255,255,0.5)" />
      
      {/* Upper eyelids with crease */}
      <path d="M88 175 Q112 160 136 175" stroke="rgba(120,90,70,0.3)" strokeWidth="1.2" fill="none" />
      <path d="M90 170 Q112 158 134 170" stroke="rgba(120,90,70,0.15)" strokeWidth="0.8" fill="none" />
      <path d="M164 175 Q188 160 212 175" stroke="rgba(120,90,70,0.3)" strokeWidth="1.2" fill="none" />
      <path d="M166 170 Q188 158 210 170" stroke="rgba(120,90,70,0.15)" strokeWidth="0.8" fill="none" />
      
      {/* Lower eyelids - subtle */}
      <path d="M90 182 Q112 192 134 182" stroke="rgba(120,90,70,0.15)" strokeWidth="0.8" fill="none" />
      <path d="M166 182 Q188 192 210 182" stroke="rgba(120,90,70,0.15)" strokeWidth="0.8" fill="none" />
      
      {/* Eyelashes - natural looking */}
      <g stroke="#2C1810" strokeLinecap="round" fill="none">
        {/* Left eye lashes */}
        <path d="M88 173 L85 166" strokeWidth="1.2" />
        <path d="M94 169 L91 161" strokeWidth="1.3" />
        <path d="M100 166 L98 158" strokeWidth="1.3" />
        <path d="M106 164 L105 156" strokeWidth="1.4" />
        <path d="M112 163 L112 155" strokeWidth="1.4" />
        <path d="M118 164 L119 156" strokeWidth="1.4" />
        <path d="M124 166 L126 158" strokeWidth="1.3" />
        <path d="M130 169 L133 161" strokeWidth="1.3" />
        <path d="M136 173 L139 166" strokeWidth="1.2" />
        {/* Right eye lashes */}
        <path d="M164 173 L161 166" strokeWidth="1.2" />
        <path d="M170 169 L167 161" strokeWidth="1.3" />
        <path d="M176 166 L174 158" strokeWidth="1.3" />
        <path d="M182 164 L181 156" strokeWidth="1.4" />
        <path d="M188 163 L188 155" strokeWidth="1.4" />
        <path d="M194 164 L195 156" strokeWidth="1.4" />
        <path d="M200 166 L202 158" strokeWidth="1.3" />
        <path d="M206 169 L209 161" strokeWidth="1.3" />
        <path d="M212 173 L215 166" strokeWidth="1.2" />
      </g>
      
      {/* Nose - natural 3D appearance */}
      <path 
        d="M150 150 L150 218" 
        stroke="url(#noseShadow)" 
        strokeWidth="18" 
        strokeLinecap="round"
        fill="none"
      />
      {/* Nose bridge highlight */}
      <path 
        d="M150 155 L150 200" 
        stroke="rgba(255,255,255,0.08)" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
      />
      {/* Nose shape */}
      <path 
        d="M150 148 Q146 185 140 218 Q150 228 160 218 Q154 185 150 148" 
        fill="none" 
        stroke="rgba(180,140,100,0.2)" 
        strokeWidth="1.2"
      />
      {/* Nose tip highlight */}
      <ellipse cx="150" cy="220" rx="10" ry="6" fill="rgba(255,255,255,0.12)" />
      {/* Nostrils - more realistic */}
      <ellipse cx="140" cy="223" rx="6" ry="4" fill="rgba(120,80,60,0.15)" />
      <ellipse cx="160" cy="223" rx="6" ry="4" fill="rgba(120,80,60,0.15)" />
      
      {/* Natural subtle cheek highlights */}
      <ellipse cx="85" cy="205" rx="20" ry="12" fill="rgba(255,200,190,0.08)" />
      <ellipse cx="215" cy="205" rx="20" ry="12" fill="rgba(255,200,190,0.08)" />
      
      {/* Lips - highly realistic with natural shape */}
      {/* Upper lip shadow */}
      <path 
        d="M118 258 Q150 252 182 258" 
        fill="none" 
        stroke="rgba(150,100,90,0.2)" 
        strokeWidth="2"
      />
      {/* Upper lip */}
      <path 
        d="M118 260 Q130 253 142 256 Q150 252 158 256 Q170 253 182 260 Q165 257 150 260 Q135 257 118 260" 
        fill="url(#lipGradient)"
      />
      {/* Cupid's bow highlight */}
      <path 
        d="M142 256 Q150 251 158 256" 
        fill="url(#lipHighlight)"
      />
      {/* Lower lip */}
      <path 
        d="M118 260 Q130 263 150 275 Q170 263 182 260 Q165 262 150 260 Q135 262 118 260" 
        fill="url(#lipGradient)"
      />
      {/* Lip line */}
      <path 
        d="M118 260 Q150 265 182 260" 
        stroke="rgba(140,90,80,0.3)" 
        strokeWidth="0.6" 
        fill="none"
      />
      {/* Lower lip highlight */}
      <ellipse cx="150" cy="267" rx="18" ry="5" fill="rgba(255,255,255,0.15)" />
      
      {/* Chin highlight and definition */}
      <ellipse cx="150" cy="300" rx="22" ry="6" fill="rgba(255,255,255,0.06)" />
      
      {/* Philtrum with subtle shading */}
      <path d="M145 228 Q148 245 145 255" stroke="rgba(180,140,100,0.12)" strokeWidth="2.5" fill="none" />
      <path d="M155 228 Q152 245 155 255" stroke="rgba(180,140,100,0.12)" strokeWidth="2.5" fill="none" />
      {/* Philtrum highlight */}
      <path d="M150 230 L150 252" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
    </svg>
  );
}

type GameMode = 'menu' | 'freeplay' | 'challenge' | 'results';

interface Challenge {
  name: string;
  description: string;
  hint: string;
  points: number;
}

const CHALLENGES: Challenge[] = [
  {
    name: 'Natürlicher Look',
    description: 'Erstelle einen natürlichen, dezenten Look.',
    hint: 'Verwende dezentes Rouge auf den Wangen und einen natürlichen Lippenstift.',
    points: 50,
  },
  {
    name: 'Abend-Glamour',
    description: 'Ein glamouröser Abendlook für besondere Anlässe.',
    hint: 'Dunkler Lidschatten, dramatische Wimpern und rote Lippen!',
    points: 75,
  },
  {
    name: 'Sommerfrisch',
    description: 'Ein leichter, frischer Sommerlook.',
    hint: 'Rosige Wangen und ein frischer, leichter Lidschatten.',
    points: 60,
  },
];

export function MakeupArtistGame() {
  const { points, addPoints } = usePoints();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [selectedTool, setSelectedTool] = useState<MakeupToolType>('lipstick');
  const [selectedColor, setSelectedColor] = useState<string>(TOOL_COLORS.lipstick[0]);
  const [brushSize, setBrushSize] = useState<number>(TOOL_BRUSH_SIZES.lipstick);
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const [isPainting, setIsPainting] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const resetMakeup = useCallback(() => {
    setBrushStrokes([]);
  }, []);

  const handleToolChange = useCallback((tool: MakeupToolType) => {
    setSelectedTool(tool);
    setSelectedColor(TOOL_COLORS[tool][0]);
    setBrushSize(TOOL_BRUSH_SIZES[tool]);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const handlePaint = useCallback((x: number, y: number) => {
    // Get tool-specific opacity
    const getOpacity = (tool: MakeupToolType): number => {
      switch (tool) {
        case 'lipstick': return 0.8;
        case 'eyeshadow': return 0.6;
        case 'blush': return 0.4;
        case 'foundation': return 0.3;
        case 'eyeliner': return 0.95;
        case 'mascara': return 0.9;
        default: return 0.5;
      }
    };
    
    const newStroke: BrushStroke = {
      id: ++strokeIdCounter,
      x,
      y,
      color: selectedColor,
      size: brushSize,
      tool: selectedTool,
      opacity: getOpacity(selectedTool),
    };
    
    setBrushStrokes(prev => [...prev, newStroke]);
  }, [selectedColor, brushSize, selectedTool]);

  const startFreePlay = () => {
    setGameMode('freeplay');
    resetMakeup();
  };

  const startChallenge = () => {
    setGameMode('challenge');
    resetMakeup();
    setCurrentChallenge(CHALLENGES[completedChallenges % CHALLENGES.length]);
  };

  const finishLook = () => {
    if (currentChallenge && brushStrokes.length > 0) {
      // Improved scoring algorithm that considers variety and coverage
      const toolsUsed = new Set(brushStrokes.map(s => s.tool)).size;
      const uniquePositions = new Set(brushStrokes.map(s => `${Math.round(s.x/20)}-${Math.round(s.y/20)}`)).size;
      
      // Base points for using multiple tools (variety bonus)
      const varietyBonus = Math.min(toolsUsed * 10, 30);
      
      // Coverage bonus based on unique areas painted (max 40 points)
      const coverageBonus = Math.min(uniquePositions * 2, 40);
      
      // Base participation points
      const participationPoints = 5;
      
      // Total points (capped at challenge max)
      const totalPoints = Math.min(participationPoints + varietyBonus + coverageBonus, currentChallenge.points);
      
      setEarnedPoints(totalPoints);
      addPoints(totalPoints);
      setCompletedChallenges(prev => prev + 1);
    } else {
      setEarnedPoints(0);
    }
    setGameMode('results');
  };

  const tools: MakeupToolType[] = ['lipstick', 'eyeshadow', 'blush', 'eyeliner', 'mascara', 'foundation'];

  if (gameMode === 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Container size="md">
          <Stack gap="xl" align="center">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                💄 Make-up Artist Studio
              </Title>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Text size="xl" style={{ color: 'white', textAlign: 'center', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                Werde der beste Make-up Artist!
              </Text>
            </motion.div>

            <Stack gap="md" style={{ width: '100%', maxWidth: 500, marginTop: '2rem' }}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="xl"
                  variant="filled"
                  color="pink"
                  onClick={startFreePlay}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🎨 Freies Spielen
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Kreiere deinen eigenen Look
                  </Text>
                </Button>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="xl"
                  variant="filled"
                  color="grape"
                  onClick={startChallenge}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🏆 Herausforderung
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Erfülle Make-up Aufträge
                  </Text>
                </Button>
              </motion.div>
            </Stack>

            {points !== null && points > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1, type: 'spring', bounce: 0.5 }}
              >
                <Paper p="md" style={{ background: 'rgba(255,255,255,0.9)', marginTop: '2rem' }}>
                  <Text size="lg" fw={700} ta="center">
                    💎 Deine Punkte: {points}
                  </Text>
                </Paper>
              </motion.div>
            )}
          </Stack>
        </Container>
      </motion.div>
    );
  }

  if (gameMode === 'results') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Container size="sm">
          <Stack gap="xl" align="center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6, duration: 0.8 }}
              style={{ fontSize: '6rem' }}
            >
              🌟
            </motion.div>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                Toll gemacht!
              </Title>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <Stack gap="lg" align="center">
                  <Avatar 
                    brushStrokes={brushStrokes} 
                    onPaint={() => {}} 
                    isPainting={false} 
                    setIsPainting={() => {}}
                  />
                  
                  <Text size="xl" fw={700} ta="center">
                    Dein Look ist fertig!
                  </Text>
                  
                  {currentChallenge && earnedPoints > 0 && (
                    <Text size="lg" c="pink" fw={600} ta="center">
                      💎 +{earnedPoints} Punkte verdient!
                    </Text>
                  )}

                  <Group mt="md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="filled"
                        color="pink"
                        onClick={() => setGameMode('menu')}
                      >
                        ✨ Zurück zum Menü
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="filled"
                        color="grape"
                        onClick={startChallenge}
                      >
                        🏆 Nächste Herausforderung
                      </Button>
                    </motion.div>
                  </Group>
                </Stack>
              </Paper>
            </motion.div>
          </Stack>
        </Container>
      </motion.div>
    );
  }

  // Freeplay or Challenge mode
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '80px',
      }}
    >
      <Container size="lg" style={{ height: '100%' }}>
        <Stack gap="md" style={{ height: '100%' }}>
          {/* Challenge info */}
          {gameMode === 'challenge' && currentChallenge && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Paper p="md" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="lg" fw={700} c="grape">
                      🏆 {currentChallenge.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {currentChallenge.description}
                    </Text>
                    <Text size="xs" c="pink" mt={4}>
                      💡 {currentChallenge.hint}
                    </Text>
                  </div>
                  <Text size="lg" fw={700} c="pink">
                    {currentChallenge.points} Punkte möglich
                  </Text>
                </Group>
              </Paper>
            </motion.div>
          )}

          {/* Main content */}
          <Group align="flex-start" justify="center" gap="xl" style={{ flex: 1 }}>
            {/* Avatar with painting */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px' }}>
                <Stack align="center" gap="md">
                  <Text size="lg" fw={700}>Male auf das Gesicht! 🎨</Text>
                  <Text size="xs" c="dimmed">Klicke und ziehe um Make-up aufzutragen</Text>
                  <Avatar 
                    brushStrokes={brushStrokes}
                    onPaint={handlePaint}
                    isPainting={isPainting}
                    setIsPainting={setIsPainting}
                  />
                </Stack>
              </Paper>
            </motion.div>

            {/* Tools panel */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Paper p="lg" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', minWidth: 320 }}>
                <Stack gap="lg">
                  <Text size="lg" fw={700} ta="center">🎨 Werkzeuge</Text>
                  
                  {/* Tool selection */}
                  <Group gap="xs" justify="center">
                    {tools.map((tool) => (
                      <motion.div key={tool} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={selectedTool === tool ? 'filled' : 'light'}
                          color="pink"
                          onClick={() => handleToolChange(tool)}
                          style={{ 
                            width: 50, 
                            height: 50, 
                            padding: 0,
                            fontSize: '1.5rem',
                          }}
                          title={TOOL_NAMES[tool]}
                        >
                          {TOOL_ICONS[tool]}
                        </Button>
                      </motion.div>
                    ))}
                  </Group>

                  <Text size="md" fw={600} ta="center" c="grape">
                    {TOOL_ICONS[selectedTool]} {TOOL_NAMES[selectedTool]}
                  </Text>

                  {/* Color selection */}
                  <div>
                    <Text size="sm" fw={500} mb="xs">Farbe wählen:</Text>
                    <Group gap="xs" justify="center" role="radiogroup" aria-label="Farbauswahl">
                      {TOOL_COLORS[selectedTool].map((color) => (
                        <motion.div key={color} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <ColorSwatch
                            color={color}
                            onClick={() => handleColorChange(color)}
                            aria-label={`${COLOR_NAMES[color] || color} ${TOOL_NAMES[selectedTool]}`}
                            role="radio"
                            aria-checked={selectedColor === color}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleColorChange(color);
                              }
                            }}
                            style={{ 
                              cursor: 'pointer',
                              border: selectedColor === color ? '3px solid #E91E63' : '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          />
                        </motion.div>
                      ))}
                    </Group>
                  </div>

                  {/* Brush size slider */}
                  <div>
                    <Text size="sm" fw={500} mb="xs">Pinselgröße:</Text>
                    <Slider
                      value={brushSize}
                      onChange={setBrushSize}
                      min={2}
                      max={40}
                      color="pink"
                      marks={[
                        { value: 5, label: 'Klein' },
                        { value: 20, label: 'Mittel' },
                        { value: 35, label: 'Groß' },
                      ]}
                    />
                  </div>

                  {/* Brush preview */}
                  <Group justify="center">
                    <div 
                      aria-hidden="true"
                      style={{ 
                        width: brushSize * 2, 
                        height: brushSize * 2, 
                        borderRadius: '50%', 
                        backgroundColor: selectedColor,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }} 
                    />
                  </Group>

                  {/* Action buttons */}
                  <Group justify="center" mt="md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="light"
                        color="gray"
                        onClick={resetMakeup}
                      >
                        🔄 Neu starten
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="filled"
                        color="pink"
                        onClick={finishLook}
                      >
                        ✨ Fertig
                      </Button>
                    </motion.div>
                  </Group>
                </Stack>
              </Paper>
            </motion.div>
          </Group>
        </Stack>
      </Container>
    </motion.div>
  );
}
