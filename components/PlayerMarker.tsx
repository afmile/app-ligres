import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';

interface PlayerMarkerProps {
  player: Player;
  onMouseDown: (id: number) => void;
  isDragging: boolean;
  onUpdateName: (id: number, newName: string) => void;
}

const JerseyIcon: React.FC<{ color: string; teamId: Player['teamId']; className?: string }> = ({
  color,
  teamId,
  className,
}) => {
  const strokeColor = teamId === 'black' ? '#6B7280' : '#111827'; // gray-500 vs gray-900

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


const PlayerMarker: React.FC<PlayerMarkerProps> = ({ player, onMouseDown, isDragging, onUpdateName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const teamColors = {
      red: '#DC2626', // red-600
      blue: '#2563EB', // blue-600
      black: '#1F2937', // gray-800
      white: '#F9FAFB' // gray-50
  };
  const jerseyColor = teamColors[player.teamId];
  
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

  return (
    <div
      className={`absolute w-20 h-24 -translate-x-1/2 -translate-y-1/2 select-none group transition-transform duration-150 ${
        isDragging ? 'cursor-grabbing scale-110 z-10' : 'cursor-grab'
      }`}
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        touchAction: 'none'
      }}
      onMouseDown={(e) => {
        if (!isEditing) {
            e.preventDefault();
            onMouseDown(player.id);
        }
      }}
      onTouchStart={(e) => {
        if (!isEditing) {
            e.preventDefault();
            onMouseDown(player.id);
        }
      }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-start filter drop-shadow-lg">
        <JerseyIcon 
            color={jerseyColor}
            teamId={player.teamId}
            className="w-16 h-16"
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
              className="w-full bg-gray-900/80 text-white text-center text-sm font-bold rounded-md py-0.5 px-1 border border-green-500 outline-none"
            />
          ) : (
            <span
              onClick={handleNameClick}
              className={`text-sm font-bold px-1.5 py-0.5 rounded-md transition-colors text-white uppercase hover:bg-black/50 cursor-pointer`}
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