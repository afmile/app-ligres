import React, { useState, useMemo, useEffect, useRef } from 'react';
import { POSITIONS_6_PLAYERS, POSITIONS_7_PLAYERS } from '../constants';
import { PositionName, TeamColor, TeamSetup, Match, Roster } from '../types';

interface PlayerSetupProps {
  onSetupComplete: (team1: TeamSetup, team2: TeamSetup, location: string, date: string, time: string, feePerPlayer?: number) => void;
  history: Match[];
  onShowHistory: () => void;
  rosters: Roster[];
  onShowRosters: () => void;
}

const ALL_COLORS: TeamColor[] = ['red', 'blue', 'black', 'white'];
const DRAFT_STORAGE_KEY = 'soccerLineupDraft';

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
  rosters: Roster[];
  onApplyRoster: (playerNames: string[]) => void;
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
  rosters,
  onApplyRoster,
}) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const selectRosterRef = useRef<HTMLSelectElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    if (buttonContainerRef.current) {
      const selectedButton = buttonContainerRef.current.querySelector(`[data-color="${teamColor}"]`) as HTMLButtonElement;
      if (selectedButton) {
        setIndicatorStyle({
          opacity: 1,
          left: selectedButton.offsetLeft,
          top: selectedButton.offsetTop,
          width: selectedButton.offsetWidth,
          height: selectedButton.offsetHeight,
        });
      }
    }
  }, [teamColor]);
  
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

  const handleRosterSelect = (rosterId: string) => {
    const selectedRoster = rosters.find(r => r.id === rosterId);
    if (selectedRoster) {
        onApplyRoster(selectedRoster.playerNames);
    }
    // Reset select to default option after applying
    if(selectRosterRef.current) {
        selectRosterRef.current.value = "";
    }
  };

  const colorClasses: Record<TeamColor, string> = {
      red: 'bg-error hover:bg-red-500',
      blue: 'bg-secondary hover:bg-blue-500',
      black: 'bg-[#1F2937] hover:bg-gray-700 border border-gray-600',
      white: 'bg-gray-200 hover:bg-white text-black'
  };

  return (
    <div className="bg-surface p-6 rounded-xl border border-secondary/20 flex flex-col space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Color del Equipo</h3>
        <div ref={buttonContainerRef} className="relative grid grid-cols-4 gap-2">
          <div 
            className="absolute z-10 border-2 border-primary rounded-md transition-all duration-300 ease-in-out pointer-events-none"
            style={indicatorStyle}
          />
          {ALL_COLORS.map(color => {
            const isSelected = teamColor === color;
            const isDisabled = otherTeamColor === color;
            return (
              <button
                key={color}
                type="button"
                data-color={color}
                disabled={isDisabled}
                onClick={() => setTeamColor(color)}
                className={`relative flex items-center justify-center h-12 w-full rounded-md font-bold text-white text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary
                  ${colorClasses[color]}
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                {isSelected && <span className="text-primary">✓</span>}
                {isDisabled && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Jugadores</h3>
             {rosters.length > 0 && (
                <div className="relative">
                    <select
                        ref={selectRosterRef}
                        onChange={(e) => handleRosterSelect(e.target.value)}
                        className="bg-background border border-secondary/20 rounded-md py-1 pl-2 pr-7 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                        defaultValue=""
                    >
                        <option value="" disabled>Cargar Plantilla...</option>
                        {rosters.map(roster => (
                            <option key={roster.id} value={roster.id}>{roster.name}</option>
                        ))}
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
          </div>
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
                  className="w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-inner"
                  required
                />
              </div>
            ))}
          </div>
      </div>
      
      {isBenchEnabled && (
         <div className="animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-center">Banca</h3>
           <div className="grid grid-cols-1 gap-4">
            {benchNames.map((name, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => handleBenchNameChange(index, e.target.value)}
                  placeholder={`Suplente ${index + 1}`}
                  className="w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-inner"
                />
                {index >= 3 && (
                    <button type="button" onClick={() => removeBenchPlayer(index)} className="p-2 text-error hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
              </div>
            ))}
             <button type="button" onClick={addBenchPlayer} className="w-full mt-2 text-primary border-2 border-dashed border-secondary/20 rounded-lg py-2 hover:bg-surface/75 hover:border-primary transition flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                 <span>+ Suplente</span>
             </button>
          </div>
      </div>
      )}
    </div>
  );
};


const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete, history, onShowHistory, rosters, onShowRosters }) => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
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
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            setLocation(draft.location ?? '');
            setDate(draft.date ?? new Date().toISOString().split('T')[0]);
            setTime(draft.time ?? '19:00');
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
        }
    } catch (error) {
        console.error("Failed to load draft from localStorage:", error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const draft = {
        location, date, time, isMatchInfoLocked, team1Color, team2Color, 
        teamSize, team1Names, team2Names, isBenchEnabled, team1Bench, team2Bench,
        isFeeEnabled, feeValue,
    };
    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
        console.error("Failed to save draft to localStorage:", error);
    }
  }, [
      location, date, time, isMatchInfoLocked, team1Color, team2Color, 
      teamSize, team1Names, team2Names, isBenchEnabled, team1Bench, team2Bench,
      isFeeEnabled, feeValue
  ]);

  const positions = useMemo(() => teamSize === 6 ? POSITIONS_6_PLAYERS : POSITIONS_7_PLAYERS, [teamSize]);
  
  const isMatchInfoValid = useMemo(() => location.trim() !== '' && date.trim() !== '' && time.trim() !== '', [location, date, time]);
  const isTeam1Valid = useMemo(() => positions.every(pos => (team1Names[pos] || '').trim() !== ''), [team1Names, positions]);
  const areTeamColorsValid = useMemo(() => team1Color !== team2Color, [team1Color, team2Color]);
  const isTeam2Valid = useMemo(() => positions.every(pos => (team2Names[pos] || '').trim() !== ''), [team2Names, positions]);
  const isFeeValid = useMemo(() => !isFeeEnabled || (isFeeEnabled && Number(feeValue) > 0), [isFeeEnabled, feeValue]);
  const isFormValid = isMatchInfoValid && isTeam1Valid && isTeam2Valid && areTeamColorsValid && isFeeValid;

  const colorTranslations: Record<TeamColor, string> = { red: 'Rojo', blue: 'Azul', black: 'Negro', white: 'Blanco' };
  const team1Label = `Equipo ${colorTranslations[team1Color]}`;
  const team2Label = `Equipo ${colorTranslations[team2Color]}`;
  
  const formattedDateTime = useMemo(() => {
    if (!date || !time) return 'Selecciona fecha y hora';
    const d = new Date(`${date}T${time}`);
    const formatted = new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [date, time]);

  const calendarUrl = useMemo(() => {
    if (!isMatchInfoValid) return '#';
    const eventTitle = `Partido Ligres, ${location}`;
    const startDate = new Date(`${date}T${time}`);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 2); // Assume 2 hour match

    const formatForUrl = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    
    const params = new URLSearchParams({
        action: 'TEMPLATE', 
        text: eventTitle, 
        dates: `${formatForUrl(startDate)}/${formatForUrl(endDate)}`,
        location: location, 
        details: 'Partido de fútbol organizado con Organizador Táctico Ligres.'
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }, [date, time, location, isMatchInfoValid]);
  
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
        { color: team1Color, size: teamSize, playerNames: team1Names, bench: isBenchEnabled ? team1Bench.filter(n => n.trim()) : [] },
        { color: team2Color, size: teamSize, playerNames: team2Names, bench: isBenchEnabled ? team2Bench.filter(n => n.trim()) : [] },
        location,
        new Date(date).toISOString(),
        time,
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

  const handleApplyRoster = (team: 'team1' | 'team2', rosterPlayers: string[]) => {
    const newTeamNames: Record<string, string> = {};
    const newBenchNames: string[] = [];

    // Fill field positions first, ensuring all positions are accounted for
    positions.forEach((position, index) => {
        newTeamNames[position] = rosterPlayers[index] || '';
    });

    // Fill bench with remaining players if it's enabled
    if (isBenchEnabled && rosterPlayers.length > positions.length) {
        newBenchNames.push(...rosterPlayers.slice(positions.length));
    }
    
    // Ensure bench has at least 3 slots (filled with empty strings if needed)
    while (newBenchNames.length < 3) {
        newBenchNames.push('');
    }

    if (team === 'team1') {
        setTeam1Names(newTeamNames);
        setTeam1Bench(newBenchNames);
    } else {
        setTeam2Names(newTeamNames);
        setTeam2Bench(newBenchNames);
    }
};

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-center text-primary mb-4">Lugar, fecha y hora</h3>
        {!isMatchInfoLocked ? (
          <div key="match-info-form" className="animate-fade-in">
            <div className="bg-surface/75 p-6 md:p-8 rounded-xl shadow-2xl border border-secondary/20">
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="location" className="block text-sm font-medium text-text-secondary">Lugar del Partido</label>
                    {recentLocations.length > 0 && (
                      <button type="button" onClick={() => setShowRecentLocations(!showRecentLocations)} className="text-sm text-text-secondary hover:text-text-primary opacity-75 hover:opacity-100 transition-opacity">Lugares recientes</button>
                    )}
                  </div>
                  <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Cancha Los Héroes" className="w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" required/>
                  {showRecentLocations && recentLocations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-surface border border-secondary/20 rounded-md shadow-lg"><ul className="py-1">{recentLocations.map(loc => (<li key={loc} onClick={() => { setLocation(loc); setShowRecentLocations(false); }} className="px-3 py-2 text-sm text-text-secondary hover:bg-background cursor-pointer">{loc}</li>))}</ul></div>
                  )}
                </div>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1">Fecha</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" required />
                      </div>
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-text-secondary mb-1">Hora</label>
                        <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" required />
                      </div>
                  </div>
                   <p className="text-text-secondary text-sm text-center mt-3">{formattedDateTime}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button 
                  type="button" 
                  onClick={handleLockMatchInfo} 
                  disabled={!isMatchInfoValid || saveState !== 'idle'} 
                  className="w-full bg-success text-black font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors duration-300 shadow-lg disabled:bg-surface/50 disabled:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
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
        ) : (
          <div key="match-info-display" className="bg-surface/75 p-6 md:p-8 rounded-xl shadow-2xl border border-secondary/20 animate-fade-in">
            <div className="space-y-4">
              <div className="p-4 bg-background/50 rounded-lg shadow-md"><p className="text-sm font-semibold text-text-secondary text-center">Lugar</p><div className="flex items-center justify-center gap-2 mt-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg><p className="text-lg font-bold text-text-primary text-center">{location}</p></div></div>
              <div className="p-4 bg-background/50 rounded-lg shadow-md"><p className="text-sm font-semibold text-text-secondary text-center">Fecha y Hora</p><div className="flex items-start justify-center gap-2 mt-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg><p className="text-lg text-text-primary text-center">{formattedDateTime}</p></div></div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                <button type="button" onClick={handleUnlockMatchInfo} className="bg-surface hover:bg-surface/75 border border-secondary/20 text-text-primary font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2-2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>Modificar</button>
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="bg-secondary hover:bg-blue-500 text-white font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg><span className="hidden sm:inline">Añadir al calendario</span><span className="sm:hidden">Calendario</span></a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className="bg-secondary hover:bg-blue-500 text-white font-semibold px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Cómo llegar</a>
              </div>
            </div>
          </div>
        )}
      </div>


      <form onSubmit={handleSubmit} id="setupForm" ref={formRef} className="space-y-8">
            <div>
                 <div className="relative mb-4">
                    <h3 className="text-xl font-bold text-center text-primary">Tipo de Partido</h3>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button type="button" onClick={onShowRosters} className="bg-surface/50 hover:bg-surface/75 text-white text-sm font-semibold py-1 px-3 rounded-lg transition-colors opacity-75 hover:opacity-100">Plantillas</button>
                        {history.length > 0 && (<button type="button" onClick={onShowHistory} className="bg-surface/50 hover:bg-surface/75 text-white text-sm font-semibold py-1 px-3 rounded-lg transition-colors opacity-75 hover:opacity-100">Historial</button>)}
                    </div>
                </div>
                <div className="bg-surface/75 p-6 md:p-8 rounded-xl shadow-2xl border border-secondary/20">
                    <div className="space-y-4">
                        <div className="flex space-x-4">
                        {[6, 7].map(size => (<button key={size} type="button" onClick={() => setTeamSize(size as 6 | 7)} className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${ teamSize === size ? 'bg-primary text-black shadow-lg' : 'bg-surface text-text-secondary hover:bg-surface/75' }`}>{size} vs {size}</button>))}
                        </div>
                        <div className="flex items-center justify-center bg-surface p-4 rounded-lg"><label htmlFor="bench-toggle" className="font-semibold mr-4">Banca</label><button type="button" role="switch" aria-checked={isBenchEnabled} onClick={toggleBench} id="bench-toggle" className={`${isBenchEnabled ? 'bg-primary' : 'bg-background'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface`}><span className={`${isBenchEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/></button></div>
                    </div>
                </div>
            </div>
            <div>
                 <h3 className="text-xl font-bold text-center text-primary mb-4">Equipos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TeamForm teamLabel={team1Label} teamColor={team1Color} setTeamColor={setTeam1Color} otherTeamColor={team2Color} playerNames={team1Names} setPlayerNames={setTeam1Names} positions={positions} isBenchEnabled={isBenchEnabled} benchNames={team1Bench} setBenchNames={setTeam1Bench} rosters={rosters} onApplyRoster={(p) => handleApplyRoster('team1', p)} />
                    <TeamForm teamLabel={team2Label} teamColor={team2Color} setTeamColor={setTeam2Color} otherTeamColor={team1Color} playerNames={team2Names} setPlayerNames={setTeam2Names} positions={positions} isBenchEnabled={isBenchEnabled} benchNames={team2Bench} setBenchNames={setTeam2Bench} rosters={rosters} onApplyRoster={(p) => handleApplyRoster('team2', p)} />
                </div>
            </div>
      </form>

      <div className="bg-surface/75 p-6 md:p-8 rounded-xl shadow-2xl border border-secondary/20">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">Cuota por Jugador</h3>
            <button type="button" role="switch" aria-checked={isFeeEnabled} onClick={() => setIsFeeEnabled(!isFeeEnabled)} id="fee-toggle" className={`${isFeeEnabled ? 'bg-primary' : 'bg-background'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface`}>
                <span className={`${isFeeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
            </button>
        </div>
        {isFeeEnabled && (
            <div className="mt-4 animate-fade-in space-y-4">
                <div>
                    <label htmlFor="fee" className="sr-only">Valor Cuota por Jugador</label>
                    <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-text-secondary sm:text-sm">$</span></div><input type="number" id="fee" value={feeValue} onChange={e => setFeeValue(e.target.value)} placeholder="2500" className="w-full bg-background border border-secondary/20 rounded-md py-2 pl-7 pr-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"/><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-text-secondary sm:text-sm">CLP</span></div></div>
                </div>
                {totalFee > 0 && <div className="p-4 bg-background/50 rounded-lg text-center shadow-md"><p className="text-sm font-semibold text-text-secondary">Total a pagar por la cancha</p><p className="text-2xl font-bold text-text-primary mt-1">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalFee)}</p></div>}
            </div>
        )}
      </div>

       <div className="mt-8">
           <button
            type="submit"
            form="setupForm"
            disabled={!isFormValid}
            className="w-full bg-primary text-black font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-colors duration-300 shadow-lg disabled:bg-surface/50 disabled:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Distribuir jugadores en Cancha</span>
            </button>
            {!isFormValid && <p className="text-center text-warning text-sm mt-3">Por favor, completa los datos del partido, de ambos equipos y la cuota si está activada.</p>}
       </div>
    </div>
  );
};

export default PlayerSetup;