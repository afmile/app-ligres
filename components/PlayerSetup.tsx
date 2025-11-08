import React, { useState, useMemo, useEffect, useRef } from 'react';
import { POSITIONS_6_PLAYERS, POSITIONS_7_PLAYERS } from '../constants';
import { PositionName, TeamColor, TeamSetup, Match, Formation } from '../types';

interface PlayerSetupProps {
  onSetupComplete: (team1: TeamSetup, team2: TeamSetup, location: string, date: string, feePerPlayer?: number) => void;
  history: Match[];
  onShowHistory: () => void;
}

const ALL_COLORS: TeamColor[] = ['red', 'blue', 'black', 'white'];
const DRAFT_STORAGE_KEY = 'soccerLineupDraft';

const FormationSelector: React.FC<{
  selectedFormation: Formation;
  onSelectFormation: (formation: Formation) => void;
}> = ({ selectedFormation, onSelectFormation }) => {
  const formations: Formation[] = ['Defensiva', 'Equilibrada', 'Ofensiva'];
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-center">Formación Táctica</h3>
      <div className="flex bg-gray-700 rounded-lg p-1">
        {formations.map((formation) => (
          <button
            key={formation}
            type="button"
            onClick={() => onSelectFormation(formation)}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-green-500 ${
              selectedFormation === formation
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            {formation}
          </button>
        ))}
      </div>
    </div>
  );
};

const TeamForm: React.FC<{
  teamLabel: string;
  teamColor: TeamColor;
  setTeamColor: (color: TeamColor) => void;
  otherTeamColor?: TeamColor;
  playerNames: Record<string, string>;
  setPlayerNames: (names: Record<string, string>) => void;
  positions: PositionName[];
  isBenchEnabled: boolean;
  benchNames: string[];
  setBenchNames: (names: string[]) => void;
  formation: Formation;
  setFormation: (formation: Formation) => void;
}> = ({
  teamLabel,
  teamColor,
  setTeamColor,
  otherTeamColor,
  playerNames,
  setPlayerNames,
  positions,
  isBenchEnabled,
  benchNames,
  setBenchNames,
  formation,
  setFormation,
}) => {
  
  const handleNameChange = (position: PositionName, name: string) => {
    setPlayerNames({ ...playerNames, [position]: name });
  };
  
  const handleBenchNameChange = (index: number, name: string) => {
    const newBenchNames = [...benchNames];
    newBenchNames[index] = name;
    setBenchNames(newBenchNames);
  };
  
  const addBenchPlayer = () => {
      setBenchNames([...benchNames, '']);
  }
  
  const removeBenchPlayer = (index: number) => {
      if(benchNames.length > 3) {
        setBenchNames(benchNames.filter((_, i) => i !== index));
      }
  }

  const colorClasses: Record<TeamColor, string> = {
      red: 'bg-red-600 hover:bg-red-500',
      blue: 'bg-blue-600 hover:bg-blue-500',
      black: 'bg-gray-800 hover:bg-gray-700 border border-gray-600',
      white: 'bg-gray-200 hover:bg-white text-black'
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-center text-green-400">{teamLabel}</h2>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-center">Color del Equipo</h3>
        <div className="grid grid-cols-4 gap-2">
          {ALL_COLORS.map(color => {
            const isSelected = teamColor === color;
            const isDisabled = otherTeamColor === color;
            return (
              <button
                key={color}
                type="button"
                disabled={isDisabled}
                onClick={() => setTeamColor(color)}
                className={`h-12 w-full rounded-md font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500
                  ${colorClasses[color]}
                  ${isSelected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : ''}
                  ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                `}
              >
                {isSelected && '✓'}
              </button>
            )
          })}
        </div>
      </div>
      
      <FormationSelector selectedFormation={formation} onSelectFormation={setFormation} />

      <div>
          <h3 className="text-lg font-semibold mb-3 text-center">Nombres de Jugadores</h3>
           <div className="grid grid-cols-1 gap-4">
            {positions.map(position => (
              <div key={position}>
                <label htmlFor={`${teamLabel}-${position}`} className="sr-only">
                  {position}
                </label>
                <input
                  type="text"
                  id={`${teamLabel}-${position}`}
                  value={playerNames[position] || ''}
                  onChange={e => handleNameChange(position, e.target.value)}
                  placeholder={position}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  required
                />
              </div>
            ))}
          </div>
      </div>
      
      {isBenchEnabled && (
         <div className="animate-fade-in">
          <h3 className="text-lg font-semibold mb-3 text-center">Banca de Suplentes</h3>
           <div className="grid grid-cols-1 gap-4">
            {benchNames.map((name, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => handleBenchNameChange(index, e.target.value)}
                  placeholder={`Suplente ${index + 1}`}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
                {index >= 3 && (
                    <button type="button" onClick={() => removeBenchPlayer(index)} className="p-2 text-red-400 hover:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
              </div>
            ))}
             <button type="button" onClick={addBenchPlayer} className="w-full mt-2 text-green-400 border-2 border-dashed border-gray-600 rounded-lg py-2 hover:bg-gray-700 hover:border-green-500 transition flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                 <span>Añadir Suplente</span>
             </button>
          </div>
      </div>
      )}
    </div>
  );
};


const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete, history, onShowHistory }) => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMatchInfoLocked, setIsMatchInfoLocked] = useState(false);
  const [team1Color, setTeam1Color] = useState<TeamColor>('blue');
  const [team2Color, setTeam2Color] = useState<TeamColor>('red');
  const [teamSize, setTeamSize] = useState<6 | 7>(7);
  const [team1Names, setTeam1Names] = useState<Record<string, string>>({});
  const [team2Names, setTeam2Names] = useState<Record<string, string>>({});
  const [isBenchEnabled, setIsBenchEnabled] = useState(false);
  const [team1Bench, setTeam1Bench] = useState<string[]>(['', '', '']);
  const [team2Bench, setTeam2Bench] = useState<string[]>(['', '', '']);
  const [showRecentLocations, setShowRecentLocations] = useState(false);
  const [isFeeEnabled, setIsFeeEnabled] = useState(false);
  const [feeValue, setFeeValue] = useState('');
  const [team1Formation, setTeam1Formation] = useState<Formation>('Equilibrada');
  const [team2Formation, setTeam2Formation] = useState<Formation>('Equilibrada');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            setLocation(draft.location ?? '');
            setDate(draft.date ?? new Date().toISOString().split('T')[0]);
            setIsMatchInfoLocked(draft.isMatchInfoLocked ?? false);
            setTeam1Color(draft.team1Color ?? 'blue');
            setTeam2Color(draft.team2Color ?? 'red');
            setTeamSize(draft.teamSize ?? 7);
            setTeam1Names(draft.team1Names ?? {});
            setTeam2Names(draft.team2Names ?? {});
            setIsBenchEnabled(draft.isBenchEnabled ?? false);
            setTeam1Bench(draft.team1Bench ?? ['', '', '']);
            setTeam2Bench(draft.team2Bench ?? ['', '', '']);
            setIsFeeEnabled(draft.isFeeEnabled ?? false);
            setFeeValue(draft.feeValue ?? '');
            setTeam1Formation(draft.team1Formation ?? 'Equilibrada');
            setTeam2Formation(draft.team2Formation ?? 'Equilibrada');
        }
    } catch (error) {
        console.error("Failed to load draft from localStorage:", error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const draft = {
        location, date, isMatchInfoLocked, team1Color, team2Color, 
        teamSize, team1Names, team2Names, isBenchEnabled, team1Bench, team2Bench,
        isFeeEnabled, feeValue, team1Formation, team2Formation,
    };
    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
        console.error("Failed to save draft to localStorage:", error);
    }
  }, [
      location, date, isMatchInfoLocked, team1Color, team2Color, 
      teamSize, team1Names, team2Names, isBenchEnabled, team1Bench, team2Bench,
      isFeeEnabled, feeValue, team1Formation, team2Formation
  ]);

  const positions = useMemo(() => teamSize === 6 ? POSITIONS_6_PLAYERS : POSITIONS_7_PLAYERS, [teamSize]);
  
  const isMatchInfoValid = useMemo(() => location.trim() !== '' && date.trim() !== '', [location, date]);
  const isTeam1Valid = useMemo(() => positions.every(pos => (team1Names[pos] || '').trim() !== ''), [team1Names, positions]);
  const areTeamColorsValid = useMemo(() => team1Color !== team2Color, [team1Color, team2Color]);
  const isTeam2Valid = useMemo(() => positions.every(pos => (team2Names[pos] || '').trim() !== ''), [team2Names, positions]);
  const isFeeValid = useMemo(() => !isFeeEnabled || (isFeeEnabled && Number(feeValue) > 0), [isFeeEnabled, feeValue]);
  const isFormValid = isMatchInfoValid && isTeam1Valid && isTeam2Valid && areTeamColorsValid && isFeeValid;

  const colorTranslations: Record<TeamColor, string> = { red: 'Rojo', blue: 'Azul', black: 'Negro', white: 'Blanco' };
  const team1Label = `Equipo ${colorTranslations[team1Color]}`;
  const team2Label = `Equipo ${colorTranslations[team2Color]}`;
  
  const formattedDate = useMemo(() => {
    if (!date) return 'Selecciona una fecha';
    const d = new Date(date + 'T00:00:00'); // Adjust for timezone issues
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  }, [date]);

  const calendarUrl = useMemo(() => {
    const eventTitle = `Partido Ligres, ${location}`;
    const startDate = new Date(date + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    const formatDateForUrl = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
    const formattedStartDate = formatDateForUrl(startDate);
    const formattedEndDate = formatDateForUrl(endDate);
    const params = new URLSearchParams({
        action: 'TEMPLATE', text: eventTitle, dates: `${formattedStartDate}/${formattedEndDate}`,
        location: location, details: 'Partido de fútbol organizado con Organizador Táctico Ligres.'
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }, [date, location]);
  
  const recentLocations = useMemo(() => Array.from(new Set(history.map(m => m.location))).slice(0, 5), [history]);

  const handleLockMatchInfo = () => {
    if (isMatchInfoValid) {
        setSaveState('saving');
        setTimeout(() => {
            setSaveState('saved');
            setIsMatchInfoLocked(true); // Trigger transition
            setTimeout(() => {
                setSaveState('idle');
            }, 800);
        }, 700);
    }
  };
  const handleUnlockMatchInfo = () => setIsMatchInfoLocked(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    onSetupComplete(
        { color: team1Color, size: teamSize, playerNames: team1Names, bench: isBenchEnabled ? team1Bench.filter(n => n.trim()) : [], formation: team1Formation },
        { color: team2Color, size: teamSize, playerNames: team2Names, bench: isBenchEnabled ? team2Bench.filter(n => n.trim()) : [], formation: team2Formation },
        location,
        new Date(date).toISOString(),
        isFeeEnabled ? Number(feeValue) : undefined
    );
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };
  
  const toggleBench = () => {
    const nextState = !isBenchEnabled;
    setIsBenchEnabled(nextState);
    if (!nextState) {
        setTeam1Bench(['', '', '']);
        setTeam2Bench(['', '', '']);
    }
  };

  const totalFee = useMemo(() => {
    const fee = Number(feeValue);
    if (!isFeeEnabled || isNaN(fee) || fee <= 0) return 0;
    const totalPlayers = teamSize * 2;
    return totalPlayers * fee;
  }, [feeValue, teamSize, isFeeEnabled]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700">
        <h3 className="text-xl font-bold text-center mb-4 text-green-400">Lugar y fecha</h3>
        <div className="grid min-h-[210px] sm:min-h-[160px]">
           {/* Locked View */}
          <div className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${isMatchInfoLocked ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
             <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg"><p className="text-sm font-semibold text-gray-400 text-center">Lugar</p><div className="flex items-center justify-center gap-2 mt-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg><p className="text-lg font-bold text-white text-center">{location}</p></div></div>
              <div className="p-4 bg-gray-900/50 rounded-lg"><p className="text-sm font-semibold text-gray-400 text-center">Fecha</p><div className="flex items-center justify-center gap-2 mt-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg><p className="text-lg text-white text-center">{formattedDate}</p></div></div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                  <button type="button" onClick={handleUnlockMatchInfo} className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2-2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>Modificar</button>
                   <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg><span className="hidden sm:inline">Añadir al calendario</span><span className="sm:hidden">Calendario</span></a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Cómo llegar</a>
              </div>
            </div>
          </div>

          {/* Unlocked (Form) View */}
          <div className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${isMatchInfoLocked ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <div className="space-y-4"><div className="relative"><div className="flex justify-between items-center mb-1"><label htmlFor="location" className="block text-sm font-medium text-gray-300">Lugar del Partido</label>{recentLocations.length > 0 && (<button type="button" onClick={() => setShowRecentLocations(!showRecentLocations)} className="text-sm text-gray-400 hover:text-white opacity-75 hover:opacity-100 transition-opacity">Lugares recientes</button>)}</div><input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Cancha Los Héroes" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" required/>{showRecentLocations && recentLocations.length > 0 && (<div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg"><ul className="py-1">{recentLocations.map(loc => (<li key={loc} onClick={() => { setLocation(loc); setShowRecentLocations(false); }} className="px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 cursor-pointer">{loc}</li>))}</ul></div>)}</div><div><label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Fecha</label><input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500" required /><p className="text-center text-gray-400 mt-2 text-sm">{formattedDate}</p></div></div><div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                <button 
                    type="button" 
                    onClick={handleLockMatchInfo} 
                    disabled={!isMatchInfoValid || saveState !== 'idle'} 
                    className="bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 w-28 h-9"
                >
                    {saveState === 'idle' && (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>
                        <span>Guardar</span></>
                    )}
                    {saveState === 'saving' && (
                        <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Guardando</span></>
                    )}
                    {saveState === 'saved' && (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span>Guardado</span></>
                    )}
                </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} id="setupForm" ref={formRef}>
          <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="mb-8 space-y-4">
                    <div className={history.length > 0 ? 'flex justify-between items-center' : ''}><h3 className={`text-lg font-semibold ${history.length === 0 ? 'text-center' : ''}`}>Configurar Plantilla</h3>{history.length > 0 && (<button type="button" onClick={onShowHistory} className="bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm font-semibold py-1 px-3 rounded-lg transition-colors opacity-75 hover:opacity-100">Historial</button>)}</div>
                    <div className="flex space-x-4">
                    {[6, 7].map(size => (<button key={size} type="button" onClick={() => setTeamSize(size as 6 | 7)} className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${ teamSize === size ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}>{size} Jugadores</button>))}
                    </div>
                    <div className="flex items-center justify-center bg-gray-800 p-4 rounded-lg"><label htmlFor="bench-toggle" className="font-semibold mr-4">Activar Banca</label><button type="button" role="switch" aria-checked={isBenchEnabled} onClick={toggleBench} id="bench-toggle" className={`${isBenchEnabled ? 'bg-green-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800`}><span className={`${isBenchEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/></button></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TeamForm teamLabel={team1Label} teamColor={team1Color} setTeamColor={setTeam1Color} otherTeamColor={team2Color} playerNames={team1Names} setPlayerNames={setTeam1Names} positions={positions} isBenchEnabled={isBenchEnabled} benchNames={team1Bench} setBenchNames={setTeam1Bench} formation={team1Formation} setFormation={setTeam1Formation}/>
                    <TeamForm teamLabel={team2Label} teamColor={team2Color} setTeamColor={setTeam2Color} otherTeamColor={team1Color} playerNames={team2Names} setPlayerNames={setTeam2Names} positions={positions} isBenchEnabled={isBenchEnabled} benchNames={team2Bench} setBenchNames={setTeam2Bench} formation={team2Formation} setFormation={setTeam2Formation}/>
                </div>
          </div>
      </form>

      <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-xl font-bold text-green-400">Cuota por Jugador</h3><button type="button" role="switch" aria-checked={isFeeEnabled} onClick={() => setIsFeeEnabled(!isFeeEnabled)} id="fee-toggle" className={`${isFeeEnabled ? 'bg-green-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800`}><span className={`${isFeeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/></button></div>
        {isFeeEnabled && (
            <div className="animate-fade-in space-y-4">
                <div>
                    <label htmlFor="fee" className="sr-only">Valor Cuota por Jugador</label>
                    <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-400 sm:text-sm">$</span></div><input type="number" id="fee" value={feeValue} onChange={e => setFeeValue(e.target.value)} placeholder="2500" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-7 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"/><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-400 sm:text-sm">CLP</span></div></div>
                </div>
                {totalFee > 0 && <div className="p-4 bg-gray-900/50 rounded-lg text-center"><p className="text-sm font-semibold text-gray-400">Total a pagar por la cancha</p><p className="text-2xl font-bold text-white mt-1">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalFee)}</p></div>}
            </div>
        )}
      </div>

       <div className="mt-8">
           <button
            type="submit"
            form="setupForm"
            disabled={!isFormValid}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Distribuir jugadores en Cancha</span>
            </button>
            {!isFormValid && <p className="text-center text-yellow-400 text-sm mt-3">Por favor, completa los datos del partido, de ambos equipos y la cuota si está activada.</p>}
       </div>
    </div>
  );
};

export default PlayerSetup;