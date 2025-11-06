import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Player, BenchPlayer, TeamColor } from '../types';
import PlayerMarker from './PlayerMarker';

declare const html2canvas: any;

interface SoccerFieldProps {
  players: Player[];
  benchPlayers: BenchPlayer[];
  updatePlayerPosition: (id: number, x: number, y: number) => void;
  updatePlayerName: (id: number, newName: string) => void;
  onReset: () => void;
}

const VerticalFieldLinesSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 800"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <style>{`.line{stroke:#a3a3a3;stroke-opacity:0.6;stroke-width:3;fill:none;}`}</style>
      </defs>
      <rect x="1.5" y="1.5" width="497" height="797" className="line" />
      <path d="M0 400 H500 M250 400 m-70 0 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0" className="line" />
      <circle cx="250" cy="400" r="4" fill="#a3a3a3" fillOpacity="0.6" />
      <path d="M90 0 V130 H410 V0 M90 800 V670 H410 V800" className="line" />
      <path d="M180 0 V45 H320 V0 M180 800 V755 H320 V800" className="line" />
      <circle cx="250" cy="90" r="3" fill="#a3a3a3" fillOpacity="0.6" />
      <circle cx="250" cy="710" r="3" fill="#a3a3a3" fillOpacity="0.6" />
      <path d="M180 130 A 70 60 0 0 0 320 130" className="line" />
      <path d="M180 670 A 70 60 0 0 1 320 670" className="line" />
    </svg>
);

const BenchList: React.FC<{ title: string; players: BenchPlayer[], teamColor: TeamColor, className?: string }> = ({ title, players, teamColor, className = '' }) => {
    const teamColorClasses: Record<TeamColor, string> = {
        red: 'bg-red-800/70 border-red-600',
        blue: 'bg-blue-800/70 border-blue-600',
        black: 'bg-gray-800/70 border-gray-600',
        white: 'bg-gray-200/70 border-gray-400 text-black',
    };
    const titleColorClasses: Record<TeamColor, string> = {
        red: 'bg-red-600',
        blue: 'bg-blue-600',
        black: 'bg-gray-600',
        white: 'bg-gray-400 text-black',
    };

    if (players.length === 0) return null;

    return (
        <div className={`rounded-lg overflow-hidden border-2 ${teamColorClasses[teamColor]} ${className}`}>
            <h3 className={`text-center font-bold p-2 text-sm`}>{title}</h3>
            <ul className="p-2 space-y-1">
                {players.map(p => <li key={p.id} className="font-semibold truncate text-sm">{p.name}</li>)}
            </ul>
        </div>
    );
};


const SoccerField: React.FC<SoccerFieldProps> = ({ players, benchPlayers, updatePlayerPosition, updatePlayerName, onReset }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const team1 = players.find(p => p.y > 50);
  const team2 = players.find(p => p.y <= 50);
  const team1Color = team1?.teamId || 'blue';
  const team2Color = team2?.teamId || 'red';

  const team1Bench = benchPlayers.filter(p => p.teamId === team1Color);
  const team2Bench = benchPlayers.filter(p => p.teamId === team2Color);


  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (activePlayerId === null || !fieldRef.current) return;
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = ((clientX - fieldRect.left) / fieldRect.width) * 100;
    const y = ((clientY - fieldRect.top) / fieldRect.height) * 100;

    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    updatePlayerPosition(activePlayerId, constrainedX, constrainedY);
  }, [activePlayerId, updatePlayerPosition]);

  const handleMouseUp = useCallback(() => {
    setActivePlayerId(null);
  }, []);

  useEffect(() => {
    if (activePlayerId !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [activePlayerId, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (id: number) => {
    setActivePlayerId(id);
  };
  
  const handleShareImage = async () => {
    const exportElement = exportRef.current;
    if (!exportElement || isExporting) return;
    
    setIsExporting(true);
    
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.blur) activeElement.blur();
    
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const canvas = await html2canvas(exportElement, {
            backgroundColor: '#111827',
            scale: 2,
            logging: false,
            useCORS: true,
        });

        if (navigator.share && navigator.canShare) {
             canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], 'alineacion-tactica.png', { type: 'image/png' });
                    try {
                        await navigator.share({
                            title: 'Alineación Táctica',
                            text: 'Así salimos a la cancha.',
                            files: [file],
                        });
                    } catch (error) {
                       if((error as Error).name !== 'AbortError') {
                         console.error('Error sharing:', error);
                       }
                    }
                }
            }, 'image/png');
        } else {
            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = 'alineacion-tactica.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Error exporting image:', error);
        alert('Hubo un error al generar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
        setIsExporting(false);
    }
  };

  const hasBenches = team1Bench.length > 0 || team2Bench.length > 0;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div ref={exportRef} className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl bg-gray-900 p-2 lg:p-4">
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4">
                 {hasBenches && (
                    <div className="hidden lg:flex flex-col justify-between self-stretch w-40 flex-shrink-0 space-y-4">
                         <BenchList title={`Banca (${team2Color})`} players={team2Bench} teamColor={team2Color} className="flex-grow flex flex-col" />
                         <div className="h-2"></div> {/* Spacer */}
                         <BenchList title={`Banca (${team1Color})`} players={team1Bench} teamColor={team1Color} className="flex-grow flex flex-col" />
                    </div>
                 )}
                <div 
                    ref={fieldRef}
                    className="relative w-full bg-green-700 rounded-lg shadow-2xl border-4 border-gray-600 overflow-hidden aspect-[1/2]"
                >
                    <VerticalFieldLinesSVG />
                    {players.map(player => (
                        <PlayerMarker
                            key={player.id}
                            player={player}
                            onMouseDown={handleMouseDown}
                            isDragging={activePlayerId === player.id}
                            onUpdateName={updatePlayerName}
                        />
                    ))}
                </div>
            </div>
             {hasBenches && (
                <div className="w-full flex lg:hidden items-center justify-center gap-4 mt-4">
                     <BenchList title={`Banca (${team2Color})`} players={team2Bench} teamColor={team2Color} className="flex-1" />
                     <BenchList title={`Banca (${team1Color})`} players={team1Bench} teamColor={team1Color} className="flex-1" />
                </div>
             )}
        </div>
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl flex flex-col sm:flex-row items-center gap-4">
            <button 
                onClick={onReset}
                className="w-full sm:flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.162l-1.5-1.5a1 1 0 111.415-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.415-1.414l1.5-1.5A5.002 5.002 0 005 9V11a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Empezar de Nuevo</span>
            </button>
            <button 
                onClick={handleShareImage}
                disabled={isExporting}
                className="w-full sm:flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-500 disabled:cursor-wait"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>{isExporting ? 'Generando...' : 'Compartir Imagen'}</span>
            </button>
        </div>
    </div>
  );
};

export default SoccerField;