
import React, { useState } from 'react';
import { Player, TeamSetup } from './types';
import PlayerSetup from './components/PlayerSetup';
import SoccerField from './components/SoccerField';
import { DEFAULT_LAYOUT_6_PLAYERS, DEFAULT_LAYOUT_7_PLAYERS } from './constants';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showField, setShowField] = useState(false);

  const handleSetupComplete = (team1: TeamSetup, team2: TeamSetup) => {
    const newPlayers: Player[] = [];
    let idCounter = 0;

    // Create players for Team 1 (Bottom half of the field)
    const layout1 = team1.size === 6 ? DEFAULT_LAYOUT_6_PLAYERS : DEFAULT_LAYOUT_7_PLAYERS;
    layout1.forEach(posLayout => {
      newPlayers.push({
        id: idCounter++,
        name: team1.playerNames[posLayout.position] || `Jugador ${idCounter}`,
        position: posLayout.position,
        x: posLayout.coordinates.x,
        // Scale Y to fit in the bottom half (50% to 100%)
        y: 50 + (posLayout.coordinates.y / 2),
        teamId: team1.color,
      });
    });

    // Create players for Team 2 (Top half of the field)
    const layout2 = team2.size === 6 ? DEFAULT_LAYOUT_6_PLAYERS : DEFAULT_LAYOUT_7_PLAYERS;
    layout2.forEach(posLayout => {
      newPlayers.push({
        id: idCounter++,
        name: team2.playerNames[posLayout.position] || `Jugador ${idCounter}`,
        position: posLayout.position,
        // Mirror X coordinate
        x: 100 - posLayout.coordinates.x,
        // Scale Y to fit in the top half (0% to 50%)
        y: (100 - posLayout.coordinates.y) / 2,
        teamId: team2.color,
      });
    });

    setPlayers(newPlayers);
    setShowField(true);
  };

  const updatePlayerPosition = (id: number, x: number, y: number) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(p => (p.id === id ? { ...p, x, y } : p))
    );
  };

  const updatePlayerName = (id: number, newName: string) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(p => (p.id === id ? { ...p, name: newName } : p))
    );
  };
  
  const handleReset = () => {
    setShowField(false);
    setPlayers([]);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-7xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-400">Organizador Táctico Ligres</h1>
        <p className="text-gray-400 mt-2">Define tus alineaciones arrastrando a los jugadores y editando los nombres en tiempo real.</p>
      </header>

      <main className="w-full max-w-7xl flex-grow">
        {showField ? (
          <SoccerField 
            players={players} 
            updatePlayerPosition={updatePlayerPosition} 
            updatePlayerName={updatePlayerName}
            onReset={handleReset} 
          />
        ) : (
          <PlayerSetup onSetupComplete={handleSetupComplete} />
        )}
      </main>
      <footer className="w-full max-w-7xl text-center mt-8 text-gray-500 text-sm">
        <p>Creado por AFML</p>
      </footer>
    </div>
  );
}

export default App;