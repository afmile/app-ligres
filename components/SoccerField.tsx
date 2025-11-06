import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Player } from '../types';
import PlayerMarker from './PlayerMarker';

declare const html2canvas: any;

interface SoccerFieldProps {
  players: Player[];
  updatePlayerPosition: (id: number, x: number, y: number) => void;
  updatePlayerName: (id: number, newName: string) => void;
  onReset: () => void;
}

const FieldLinesSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 840 1050"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Field Border */}
      <rect x="2" y="2" width="836" height="1046" stroke="#a3a3a3" strokeOpacity="0.6" strokeWidth="4" fill="none" />
      
      {/* Halfway line & Center circle */}
      <path
        d="M0 525 h840 M420 525 m-73 0 a73 73 0 1 0 146 0 a73 73 0 1 0 -146 0"
        stroke="#a3a3a3"
        strokeOpacity="0.6"
        strokeWidth="4"
        fill="none"
      />
      <circle cx="420" cy="525" r="5" fill="#a3a3a3" fillOpacity="0.6" />

      {/* Penalty Areas */}
      <path
        d="M168 0 V165 H672 V0 M168 1050 V885 H672 V1050"
        stroke="#a3a3a3"
        strokeOpacity="0.6"
        strokeWidth="4"
        fill="none"
      />

      {/* Goal Areas */}
      <path
        d="M306 0 V55 H534 V0 M306 1050 V995 H534 V1050"
        stroke="#a3a3a3"
        strokeOpacity="0.6"
        strokeWidth="4"
        fill="none"
      />

      {/* Penalty Spots */}
      <circle cx="420" cy="110" r="4" fill="#a3a3a3" fillOpacity="0.6" />
      <circle cx="420" cy="940" r="4" fill="#a3a3a3" fillOpacity="0.6" />

      {/* Penalty Arcs */}
      <path
        d="M325 165 A 95 95 0 0 0 515 165"
        stroke="#a3a3a3"
        strokeOpacity="0.6"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M325 885 A 95 95 0 0 1 515 885"
        stroke="#a3a3a3"
        strokeOpacity="0.6"
        strokeWidth="4"
        fill="none"
      />
    </svg>
);


const SoccerField: React.FC<SoccerFieldProps> = ({ players, updatePlayerPosition, updatePlayerName, onReset }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (activePlayerId === null || !fieldRef.current) return;
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = ((clientX - fieldRect.left) / fieldRect.width) * 100;
    const y = ((clientY - fieldRect.top) / fieldRect.height) * 100;

    // Constrain player within field boundaries
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
  
  const handleExportImage = async () => {
    if (!fieldRef.current || isExporting) return;
    
    setIsExporting(true);
    
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.blur) {
        activeElement.blur();
    }

    try {
        const canvas = await html2canvas(fieldRef.current, {
            backgroundColor: '#059669', // A slightly brighter green for the export
            scale: 3, 
            logging: false,
            useCORS: true,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'alineacion-tactica.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting image:', error);
        alert('Hubo un error al exportar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
        <div 
            ref={fieldRef}
            className="relative w-full aspect-[4/5] max-w-[500px] lg:max-w-[600px] bg-green-700 rounded-lg shadow-2xl border-4 border-gray-600 overflow-hidden"
        >
            <FieldLinesSVG />
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
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <button 
                onClick={onReset}
                className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.162l-1.5-1.5a1 1 0 111.415-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.415-1.414l1.5-1.5A5.002 5.002 0 005 9V11a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Empezar de Nuevo</span>
            </button>
            <button 
                onClick={handleExportImage}
                disabled={isExporting}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-500 disabled:cursor-wait"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
                </svg>
                <span>{isExporting ? 'Exportando...' : 'Exportar Imagen'}</span>
            </button>
        </div>
    </div>
  );
};

export default SoccerField;