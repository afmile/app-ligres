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

const HorizontalFieldLinesSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 500"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <style>{`.line{stroke:#a3a3a3;stroke-opacity:0.6;stroke-width:3;fill:none;}`}</style>
      </defs>
      <rect x="1.5" y="1.5" width="797" height="497" className="line" />
      <path d="M400 0 V500 M400 250 m0 -70 a70 70 0 1 0 0 140 a70 70 0 1 0 0 -140" className="line" />
      <circle cx="400" cy="250" r="4" fill="#a3a3a3" fillOpacity="0.6" />
      <path d="M0 90 H130 V410 H0 M800 90 H670 V410 H800" className="line" />
      <path d="M0 180 H45 V320 H0 M800 180 H755 V320 H800" className="line" />
      <circle cx="90" cy="250" r="3" fill="#a3a3a3" fillOpacity="0.6" />
      <circle cx="710" cy="250" r="3" fill="#a3a3a3" fillOpacity="0.6" />
      <path d="M130 180 A 60 70 0 0 0 130 320" className="line" />
      <path d="M670 180 A 60 70 0 0 1 670 320" className="line" />
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
    const fieldElement = fieldRef.current;
    if (!fieldElement || isExporting) return;
    
    setIsExporting(true);
    
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.blur) {
        activeElement.blur();
    }
    
    const originalAspectRatio = fieldElement.style.aspectRatio;
    const originalClasses = fieldElement.className;
    
    // Temporarily force vertical aspect ratio for export
    fieldElement.className = originalClasses.replace(/lg:aspect-\[.*?\]/g, ''); // remove horizontal aspect ratio class
    fieldElement.style.aspectRatio = '4 / 5';


    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const canvas = await html2canvas(fieldElement, {
            backgroundColor: '#059669',
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
        fieldElement.style.aspectRatio = originalAspectRatio;
        fieldElement.className = originalClasses;
        setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center lg:items-start lg:justify-center gap-8 animate-fade-in">
        <div 
            ref={fieldRef}
            className="relative w-full max-w-[400px] lg:max-w-3xl bg-green-700 rounded-lg shadow-2xl border-4 border-gray-600 overflow-hidden aspect-[9/16] lg:aspect-[3/2]"
        >
            <div className="block lg:hidden">
              <VerticalFieldLinesSVG />
            </div>
            <div className="hidden lg:block">
              <HorizontalFieldLinesSVG />
            </div>
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
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-center gap-4">
            <button 
                onClick={onReset}
                className="w-full sm:w-auto lg:w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.162l-1.5-1.5a1 1 0 111.415-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.415-1.414l1.5-1.5A5.002 5.002 0 005 9V11a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Empezar de Nuevo</span>
            </button>
            <button 
                onClick={handleExportImage}
                disabled={isExporting}
                className="w-full sm:w-auto lg:w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-500 disabled:cursor-wait"
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