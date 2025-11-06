import React, { useState, useMemo, useCallback } from 'react';
import { POSITIONS_6_PLAYERS, POSITIONS_7_PLAYERS } from '../constants';
import { PositionName, TeamColor, TeamSetup } from '../types';

interface PlayerSetupProps {
  onSetupComplete: (team1: TeamSetup, team2: TeamSetup) => void;
}

const ALL_COLORS: TeamColor[] = ['red', 'blue', 'black', 'white'];

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
         <div>
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


const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete }) => {
  const [team1Color, setTeam1Color] = useState<TeamColor>('blue');
  const [team2Color, setTeam2Color] = useState<TeamColor>('red');
  const [teamSize, setTeamSize] = useState<6 | 7>(7);
  const [team1Names, setTeam1Names] = useState<Record<string, string>>({});
  const [team2Names, setTeam2Names] = useState<Record<string, string>>({});
  const [isBenchEnabled, setIsBenchEnabled] = useState(false);
  const [team1Bench, setTeam1Bench] = useState<string[]>(['', '', '']);
  const [team2Bench, setTeam2Bench] = useState<string[]>(['', '', '']);


  const positions = useMemo(() => teamSize === 6 ? POSITIONS_6_PLAYERS : POSITIONS_7_PLAYERS, [teamSize]);
  
  const isTeam1Valid = useMemo(() => positions.every(pos => team1Names[pos]?.trim() !== ''), [team1Names, positions]);
  const areTeamColorsValid = useMemo(() => team1Color !== team2Color, [team1Color, team2Color]);
  const isTeam2Valid = useMemo(() => positions.every(pos => team2Names[pos]?.trim() !== ''), [team2Names, positions]);
  const isFormValid = isTeam1Valid && isTeam2Valid && areTeamColorsValid;

  const colorTranslations: Record<TeamColor, string> = {
    red: 'Rojo',
    blue: 'Azul',
    black: 'Negro',
    white: 'Blanco'
  };

  const team1Label = `Equipo ${colorTranslations[team1Color]}`;
  const team2Label = `Equipo ${colorTranslations[team2Color]}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    onSetupComplete(
        { color: team1Color, size: teamSize, playerNames: team1Names, bench: isBenchEnabled ? team1Bench.filter(n => n.trim()) : [] },
        { color: team2Color, size: teamSize, playerNames: team2Names, bench: isBenchEnabled ? team2Bench.filter(n => n.trim()) : [] }
    );
  };
  
  const toggleBench = () => {
    const nextState = !isBenchEnabled;
    setIsBenchEnabled(nextState);
    if (!nextState) {
        setTeam1Bench(['', '', '']);
        setTeam2Bench(['', '', '']);
    }
  }

  return (
    <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold text-center">Configuración General</h3>
             <div className="flex space-x-4">
              {[6, 7].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTeamSize(size as 6 | 7)}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    teamSize === size
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {size} Jugadores
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center bg-gray-800 p-4 rounded-lg">
                <label htmlFor="bench-toggle" className="font-semibold mr-4">Activar Banca</label>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isBenchEnabled}
                    onClick={toggleBench}
                    id="bench-toggle"
                    className={`${isBenchEnabled ? 'bg-green-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                >
                    <span className={`${isBenchEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TeamForm
              teamLabel={team1Label}
              teamColor={team1Color}
              setTeamColor={setTeam1Color}
              otherTeamColor={team2Color}
              playerNames={team1Names}
              setPlayerNames={setTeam1Names}
              positions={positions}
              isBenchEnabled={isBenchEnabled}
              benchNames={team1Bench}
              setBenchNames={setTeam1Bench}
            />
            <TeamForm
              teamLabel={team2Label}
              teamColor={team2Color}
              setTeamColor={setTeam2Color}
              otherTeamColor={team1Color}
              playerNames={team2Names}
              setPlayerNames={setTeam2Names}
              positions={positions}
              isBenchEnabled={isBenchEnabled}
              benchNames={team2Bench}
              setBenchNames={setTeam2Bench}
            />
        </div>
        
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Distribuir Jugadores en la Cancha</span>
        </button>
        {!isFormValid && <p className="text-center text-yellow-400 text-sm mt-3">Por favor, completa los datos de ambos equipos y asegúrate de que los colores sean diferentes.</p>}
      </form>
    </div>
  );
};

export default PlayerSetup;