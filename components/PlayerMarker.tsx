import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';

interface PlayerMarkerProps {
  player: Player;
  isTopTeam: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  onUpdateName: (id: number, newName: string) => void;
  isExporting?: boolean;
}

const JerseyIcon: React.FC<{ color: string; strokeColor: string; className?: string }> = ({
  color,
  strokeColor,
  className,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Path 1: Main shirt body with fill and outer stroke */}
      <path
        d="M19.5,7.5,18,6V4.5a1,1,0,0,0-1-1H7a1,1,0,0,0-1,1V6L4.5,7.5A1,1,0,0,0,4,8.5v8a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2v-8A1,1,0,0,0,19.5,7.5Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Path 2: Collar detail, no fill, just stroke */}
      <path
        d="M9,4.5a3.5,3.5,0,0,1,6,0"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


const PlayerMarker: React.FC<PlayerMarkerProps> = ({ player, isTopTeam, onMouseDown, isDragging, onUpdateName, isExporting = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  const teamColors = {
      red: '#EF4444', // error
      blue: '#3A7BFF', // secondary
      black: '#1F2937', // gray-800
      white: '#F9FAFB' // gray-50
  };
  const jerseyColor = teamColors[player.teamId];
  const strokeColor = player.teamId === 'white' ? '#111A2E' : '#E5E9F0';
  
  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    setIsEditing(true);
  };

  const handleNameChangeCommit = () => {
    if (editedName.trim() && editedName.trim() !== player.name) {
      onUpdateName(player.id, editedName.trim());
    } else {
      setEditedName(player.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameChangeCommit();
    } else if (e.key === 'Escape') {
      setEditedName(player.name);
      setIsEditing(false);
    }
  };
  
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setEditedName(player.name);
  }, [player.name]);

  const getNameClasses = () => {
    // Remove background both in field and export
    return 'text-xs font-bold px-1 py-0.5 rounded-md transition-colors uppercase cursor-pointer bg-transparent text-text-primary';
  };

  const MARKER_WIDTH = 48; // w-12
  const MARKER_HEIGHT = 56; // h-14

  const getCenteredStyles = () => {
    const parent = markerRef.current?.parentElement;
    if (!parent) {
      return {
        left: `calc(${player.x}% - 24px)`,
        top: `calc(${player.y}% - 28px)`,
      } as React.CSSProperties;
    }
    const cw = parent.clientWidth || parent.offsetWidth || 0;
    const ch = parent.clientHeight || parent.offsetHeight || 0;
    if (!cw || !ch) {
      return {
        left: `calc(${player.x}% - 24px)`,
        top: `calc(${player.y}% - 28px)`,
      } as React.CSSProperties;
    }
    const offsetXPercent = (MARKER_WIDTH / 2 / cw) * 100;
    const offsetYPercent = (MARKER_HEIGHT / 2 / ch) * 100;
    return {
      left: `calc(${player.x}% - ${offsetXPercent}%)`,
      top: `calc(${player.y}% - ${offsetYPercent}%)`,
    } as React.CSSProperties;
  };

  return (
    <div
      ref={markerRef}
      className={`absolute w-12 h-14 select-none group ${
        !isExporting ? 'transition-transform duration-150 animate-pop-in' : ''
      } ${
        isDragging ? 'cursor-grabbing scale-110 z-10' : 'cursor-grab'
      }`}
      style={{
        ...getCenteredStyles(),
        touchAction: 'none',
        animationDelay: !isExporting ? `${(player.id - 100) * 20}ms` : undefined
      }}
      onMouseDown={(e) => {
        if (!isEditing) {
            e.preventDefault();
            onMouseDown(e);
        }
      }}
      onTouchStart={(e) => {
        if (!isEditing) {
            e.preventDefault();
            onMouseDown(e);
        }
      }}
    >
      <div className={`relative w-full h-full flex flex-col items-center justify-start ${!isExporting ? 'filter drop-shadow-lg' : ''}`}>
        <JerseyIcon 
            color={jerseyColor}
            strokeColor={strokeColor}
            className="w-10 h-10"
        />
        <div className="w-full text-center -mt-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameChangeCommit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-background/80 text-text-primary text-center text-xs font-bold rounded-md py-0.5 px-1 border border-primary outline-none shadow-inner"
            />
          ) : (
            <span
              onClick={handleNameClick}
              className={getNameClasses()}
            >
              {player.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerMarker;
