import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Player, BenchPlayer, TeamColor } from '../types';
import PlayerMarker from './PlayerMarker';

declare const html2canvas: any;

interface SoccerFieldProps {
  players: Player[];
  benchPlayers: BenchPlayer[];
  updatePlayerPosition: (id: number, x: number, y: number) => void;
  updatePlayerName: (id: number, newName: string) => void;
  onReset: () => void;
  matchInfo: { location: string, date: string } | null;
  feePerPlayer?: number;
  onGoToPayments: () => void;
}

const VerticalFieldLinesSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 800"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <style>{`.line{stroke:#9AA3B0;stroke-opacity:0.6;stroke-width:3;fill:none;}`}</style>
      </defs>
      <rect x="1.5" y="1.5" width="497" height="797" className="line" />
      <path d="M0 400 H500 M250 400 m-70 0 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0" className="line" />
      <circle cx="250" cy="400" r="4" fill="#9AA3B0" fillOpacity="0.6" />
      <path d="M90 0 V130 H410 V0 M90 800 V670 H410 V800" className="line" />
      <path d="M180 0 V45 H320 V0 M180 800 V755 H320 V800" className="line" />
      <circle cx="250" cy="90" r="3" fill="#9AA3B0" fillOpacity="0.6" />
      <circle cx="250" cy="710" r="3" fill="#9AA3B0" fillOpacity="0.6" />
      <path d="M180 130 A 70 60 0 0 0 320 130" className="line" />
      <path d="M180 670 A 70 60 0 0 1 320 670" className="line" />
    </svg>
);

const BenchList: React.FC<{ title: string; players: BenchPlayer[], teamColor: TeamColor, className?: string }> = ({ title, players, teamColor, className = '' }) => {
    const teamColorClasses: Record<TeamColor, string> = {
        red: 'bg-error/20 border-error',
        blue: 'bg-secondary/20 border-secondary',
        black: 'bg-surface/70 border-gray-600',
        white: 'bg-gray-200/70 border-gray-400 text-black',
    };

    if (players.length === 0) return null;

    return (
        <div className={className}>
            <h3 className={`text-center font-bold text-sm mb-2 text-text-secondary`}>{title}</h3>
            <div className={`rounded-lg overflow-hidden border-2 shadow-md ${teamColorClasses[teamColor]} h-full`}>
                <ul className="p-2 space-y-1">
                    {players.map(p => <li key={p.id} className="font-semibold truncate text-sm">{p.name}</li>)}
                </ul>
            </div>
        </div>
    );
};


const SoccerField: React.FC<SoccerFieldProps> = ({ players, benchPlayers, updatePlayerPosition, updatePlayerName, onReset, matchInfo, feePerPlayer, onGoToPayments }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDragHint, setShowDragHint] = useState(true);
  
  const team1 = players.find(p => p.y > 50);
  const team2 = players.find(p => p.y <= 50);
  const team1Color = team1?.teamId || 'blue';
  const team2Color = team2?.teamId || 'red';

  const team1Bench = benchPlayers.filter(p => p.teamId === team1Color);
  const team2Bench = benchPlayers.filter(p => p.teamId === team2Color);

  const formattedDate = matchInfo?.date 
    ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(matchInfo.date))
    : '';
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const calendarUrl = useMemo(() => {
    if (!matchInfo) return '#';
    
    const { location, date } = matchInfo;
    const eventTitle = `Partido Ligres, ${location}`;
    const startDate = new Date(date);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const formatAllDay = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
    
    const formattedStartDate = formatAllDay(startDate);
    const formattedEndDate = formatAllDay(endDate);

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventTitle,
        dates: `${formattedStartDate}/${formattedEndDate}`,
        location: location,
        details: 'Partido de fútbol organizado con Organizador Táctico Ligres.'
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  }, [matchInfo]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: number) => {
    setShowDragHint(false);
    setActivePlayerId(id);
    if (!fieldRef.current) return;
  
    const fieldRect = fieldRef.current.getBoundingClientRect();
    const player = players.find(p => p.id === id);
    if (!player) return;
  
    // Player's current center in pixels, relative to the field
    const playerXpx = (player.x / 100) * fieldRect.width;
    const playerYpx = (player.y / 100) * fieldRect.height;
  
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  
    // Mouse position in pixels, relative to the field
    const mouseXpx = clientX - fieldRect.left;
    const mouseYpx = clientY - fieldRect.top;
  
    // Calculate and store the offset from the player's center to the mouse click
    setDragOffset({
      x: mouseXpx - playerXpx,
      y: mouseYpx - playerYpx,
    });
  };

  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (activePlayerId === null || !fieldRef.current || !dragOffset) return;
    
    event.preventDefault();

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    
    // Current mouse position in pixels relative to the field
    const mouseXpx = clientX - fieldRect.left;
    const mouseYpx = clientY - fieldRect.top;

    // Subtract the offset to find the new player center
    const newPlayerXpx = mouseXpx - dragOffset.x;
    const newPlayerYpx = mouseYpx - dragOffset.y;
    
    const x = (newPlayerXpx / fieldRect.width) * 100;
    const y = (newPlayerYpx / fieldRect.height) * 100;

    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    updatePlayerPosition(activePlayerId, constrainedX, constrainedY);
  }, [activePlayerId, updatePlayerPosition, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setActivePlayerId(null);
    setDragOffset(null);
  }, []);

  useEffect(() => {
    if (activePlayerId !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
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
  
  const handleShareImage = async () => {
    const exportElement = exportRef.current;
    if (!exportElement || isExporting) return;
    
    setIsExporting(true);
    
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.blur) activeElement.blur();
    
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const canvas = await html2canvas(exportElement, {
            backgroundColor: '#0A0F1E',
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
                            text: `Alineación para el partido en ${matchInfo?.location || ''}.`,
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
        {/* Off-screen container for image export */}
        <div
            ref={exportRef}
            className="absolute -top-[9999px] -left-[9999px] w-[500px] h-[800px] bg-background p-4 flex flex-col font-sans"
        >
            {matchInfo && (
                <div className="w-full text-center mb-4 px-3 py-2 text-text-primary">
                    <p className="font-bold text-2xl text-primary">{matchInfo.location}</p>
                    <p className="text-lg text-text-secondary">{capitalizedDate}</p>
                </div>
            )}
            <div className="relative w-full h-full bg-field rounded-lg shadow-2xl border-4 border-surface overflow-hidden">
                <VerticalFieldLinesSVG />
                {players.map(player => (
                    <PlayerMarker
                        key={player.id}
                        player={player}
                        isTopTeam={player.y <= 50}
                        onMouseDown={() => {}}
                        isDragging={false}
                        onUpdateName={() => {}}
                    />
                ))}
            </div>
        </div>

        {/* Visible UI for interaction */}
        <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-2xl bg-background p-2 lg:p-4">
            {matchInfo && (
                <div className="w-full text-center mb-4 p-3 bg-surface rounded-lg border border-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-lg text-primary">{matchInfo.location}</p>
                        <p className="text-sm text-text-secondary">{capitalizedDate}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <a 
                            href={calendarUrl}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-secondary hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            <span>Añadir al calendario</span>
                        </a>
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(matchInfo.location)}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-secondary hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            <span>Cómo llegar</span>
                        </a>
                    </div>
                </div>
            )}
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
                    className="relative w-full bg-field rounded-lg shadow-2xl border-4 border-surface overflow-hidden aspect-[5/8]"
                >
                    <VerticalFieldLinesSVG />
                    {showDragHint && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fade-in">
                            <div className="text-center p-4 bg-black/60 text-white rounded-lg shadow-xl backdrop-blur-sm flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-semibold text-lg">Arrastra los jugadores para ordenarlos</p>
                            </div>
                        </div>
                    )}
                    {players.map(player => (
                        <PlayerMarker
                            key={player.id}
                            player={player}
                            isTopTeam={player.y <= 50}
                            onMouseDown={(e) => handleMouseDown(e, player.id)}
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
         {feePerPlayer && feePerPlayer > 0 && (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mt-4">
                <button 
                    onClick={onGoToPayments}
                    className="w-full bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-400 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.158-.103.346-.195.574-.277a6.213 6.213 0 012.218 0c.228.082.416.174.574.277a3.413 3.413 0 011.698 2.825c0 .363-.043.71-.128 1.045A3.99 3.99 0 0112 13.5a3.99 3.99 0 01-1.789-1.212A4.02 4.02 0 0110 13.5a4.02 4.02 0 01-.211.005 3.99 3.99 0 01-1.789 1.212 3.99 3.99 0 01-1.212.212c-.733 0-1.42-.231-1.99-.637a4.026 4.026 0 01-1.045-.128C3.043 11.95 3 11.603 3 11.24c0-1.12.503-2.164 1.302-2.825a3.413 3.413 0 011.698-2.825z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                    </svg>
                    <span>Gestionar Pagos</span>
                </button>
            </div>
        )}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button 
                onClick={onReset}
                className="w-full sm:flex-1 bg-error text-white font-bold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.026 1.06L3.636 7.25h6.114a4.25 4.25 0 0 1 0 8.5H8a.75.75 0 0 1 0-1.5h1.75a2.75 2.75 0 0 0 0-5.5H3.636l4.131 3.958a.75.75 0 1 1-1.036 1.084l-5.5-5.25a.75.75 0 0 1 0-1.084l5.5-5.25a.75.75 0 0 1 1.06.026Z" clipRule="evenodd" />
                </svg>
                <span>Empezar de Nuevo</span>
            </button>
            <button 
                onClick={handleShareImage}
                disabled={isExporting}
                className="w-full sm:flex-1 bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-400 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:bg-surface/50 disabled:text-text-secondary disabled:cursor-wait"
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