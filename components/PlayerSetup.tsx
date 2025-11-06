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
  teamSize: 6 | 7;
  setTeamSize: (size: 6 | 7) => void;
  playerNames: Record<string, string>;
  setPlayerNames: (names: Record<string, string>) => void;
  positions: PositionName[];
}> = ({
  teamLabel,
  teamColor,
  setTeamColor,
  otherTeamColor,
  teamSize,
  setTeamSize,
  playerNames,
  setPlayerNames,
  positions
}) => {
  
  const handleNameChange = (position: PositionName, name: string) => {
    setPlayerNames({ ...playerNames, [position]: name });
  };
  
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
        <h3 className="text-lg font-semibold mb-3 text-center">Nº de Jugadores</h3>
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
              {size}
            </button>
          ))}
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
    </div>
  );
};


const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete }) => {
  const [team1Color, setTeam1Color] = useState<TeamColor>('blue');
  const [team2Color, setTeam2Color] = useState<TeamColor>('red');
  const [team1Size, setTeam1Size] = useState<6 | 7>(7);
  const [team2Size, setTeam2Size] = useState<6 | 7>(7);
  const [team1Names, setTeam1Names] = useState<Record<string, string>>({});
  const [team2Names, setTeam2Names] = useState<Record<string, string>>({});

  const positions1 = useMemo(() => team1Size === 6 ? POSITIONS_6_PLAYERS : POSITIONS_7_PLAYERS, [team1Size]);
  const positions2 = useMemo(() => team2Size === 6 ? POSITIONS_6_PLAYERS : POSITIONS_7_PLAYERS, [team2Size]);
  
  const isTeam1Valid = useMemo(() => positions1.every(pos => team1Names[pos]?.trim() !== ''), [team1Names, positions1]);
  const areTeamColorsValid = useMemo(() => team1Color !== team2Color, [team1Color, team2Color]);
  const isTeam2Valid = useMemo(() => positions2.every(pos => team2Names[pos]?.trim() !== ''), [team2Names, positions2]);
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
        { color: team1Color, size: team1Size, playerNames: team1Names },
        { color: team2Color, size: team2Size, playerNames: team2Names }
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TeamForm
              teamLabel={team1Label}
              teamColor={team1Color}
              setTeamColor={setTeam1Color}
              otherTeamColor={team2Color}
              teamSize={team1Size}
              setTeamSize={setTeam1Size}
              playerNames={team1Names}
              setPlayerNames={setTeam1Names}
              positions={positions1}
            />
            <TeamForm
              teamLabel={team2Label}
              teamColor={team2Color}
              setTeamColor={setTeam2Color}
              otherTeamColor={team1Color}
              teamSize={team2Size}
              setTeamSize={setTeam2Size}
              playerNames={team2Names}
              setPlayerNames={setTeam2Names}
              positions={positions2}
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