import React, { useState, useEffect } from 'react';
import { Player, TeamSetup, BenchPlayer, Match } from './types';
import PlayerSetup from './components/PlayerSetup';
import SoccerField from './components/SoccerField';
import History from './components/History';
import { DEFAULT_LAYOUT_6_PLAYERS, DEFAULT_LAYOUT_7_PLAYERS } from './constants';

const HISTORY_STORAGE_KEY = 'soccerLineupHistory';
const CURRENT_MATCH_STATE_KEY = 'currentMatchState';

const createPlayersFromSetup = (team1: TeamSetup, team2: TeamSetup) => {
    const newPlayers: Player[] = [];
    const newBenchPlayers: BenchPlayer[] = [];
    let idCounter = 0;

    const layout1 = team1.size === 6 ? DEFAULT_LAYOUT_6_PLAYERS : DEFAULT_LAYOUT_7_PLAYERS;
    layout1.forEach(posLayout => {
      newPlayers.push({
        id: idCounter++,
        name: team1.playerNames[posLayout.position] || `Jugador ${idCounter}`,
        position: posLayout.position,
        x: posLayout.coordinates.x,
        y: 50 + (posLayout.coordinates.y / 2),
        teamId: team1.color,
      });
    });

    team1.bench.forEach(name => {
        if(name.trim()) {
            newBenchPlayers.push({ id: idCounter++, name, teamId: team1.color });
        }
    });

    const layout2 = team2.size === 6 ? DEFAULT_LAYOUT_6_PLAYERS : DEFAULT_LAYOUT_7_PLAYERS;
    layout2.forEach(posLayout => {
      newPlayers.push({
        id: idCounter++,
        name: team2.playerNames[posLayout.position] || `Jugador ${idCounter}`,
        position: posLayout.position,
        x: 100 - posLayout.coordinates.x,
        y: (100 - posLayout.coordinates.y) / 2,
        teamId: team2.color,
      });
    });
    
    team2.bench.forEach(name => {
        if(name.trim()) {
            newBenchPlayers.push({ id: idCounter++, name, teamId: team2.color });
        }
    });
    
    return { players: newPlayers, benchPlayers: newBenchPlayers };
};

function App() {
  const [view, setView] = useState<'setup' | 'field' | 'history'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<BenchPlayer[]>([]);
  const [matchInfo, setMatchInfo] = useState<{location: string, date: string} | null>(null);
  const [history, setHistory] = useState<Match[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);


  useEffect(() => {
    try {
      // Prioritize restoring an active match
      const storedMatchState = localStorage.getItem(CURRENT_MATCH_STATE_KEY);
      if (storedMatchState) {
        const { view, players, benchPlayers, matchInfo } = JSON.parse(storedMatchState);
        if (view === 'field' && players && benchPlayers && matchInfo) {
          setPlayers(players);
          setBenchPlayers(benchPlayers);
          setMatchInfo(matchInfo);
          setView('field');
        }
      }
      
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    } finally {
        setIsInitialized(true);
    }
  }, []);

  const handleSaveMatch = (matchData: Omit<Match, 'id'>) => {
    const newMatch: Match = { ...matchData, id: new Date().toISOString() };
    const updatedHistory = [newMatch, ...history.slice(0, 19)]; // Keep latest 20
    setHistory(updatedHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  };
  
  const handleLoadMatch = (match: Match) => {
    const { players, benchPlayers } = createPlayersFromSetup(match.team1Setup, match.team2Setup);
    const newMatchInfo = { location: match.location, date: match.date };
    setPlayers(players);
    setBenchPlayers(benchPlayers);
    setMatchInfo(newMatchInfo);
    setView('field');
    
    // Persist this loaded match state
    try {
        localStorage.setItem(CURRENT_MATCH_STATE_KEY, JSON.stringify({ view: 'field', players, benchPlayers, matchInfo: newMatchInfo }));
    } catch (error) {
        console.error("Failed to save current match state:", error);
    }
  };
  
  const handleSetupComplete = (team1: TeamSetup, team2: TeamSetup, location: string, date: string) => {
    handleSaveMatch({ location, date, team1Setup: team1, team2Setup: team2 });
    const { players, benchPlayers } = createPlayersFromSetup(team1, team2);
    const newMatchInfo = { location, date };
    setPlayers(players);
    setBenchPlayers(benchPlayers);
    setMatchInfo(newMatchInfo);
    setView('field');
    
    // Persist the new match state
    try {
        localStorage.setItem(CURRENT_MATCH_STATE_KEY, JSON.stringify({ view: 'field', players, benchPlayers, matchInfo: newMatchInfo }));
    } catch (error) {
        console.error("Failed to save current match state:", error);
    }
  };

  const updatePlayerPosition = (id: number, x: number, y: number) => {
    const updatedPlayers = players.map(player => (player.id === id ? { ...player, x, y } : player));
    setPlayers(updatedPlayers);
    try {
        const currentState = JSON.parse(localStorage.getItem(CURRENT_MATCH_STATE_KEY) || '{}');
        localStorage.setItem(CURRENT_MATCH_STATE_KEY, JSON.stringify({ ...currentState, players: updatedPlayers }));
    } catch (error) {
        console.error("Failed to update player position in storage:", error);
    }
  };

  const updatePlayerName = (id: number, newName: string) => {
    // FIX: Corrected a typo from `p` to `player` to ensure the correct object is returned in the map function.
    const updatedPlayers = players.map(player => (player.id === id ? { ...player, name: newName } : player));
    setPlayers(updatedPlayers);
    try {
        const currentState = JSON.parse(localStorage.getItem(CURRENT_MATCH_STATE_KEY) || '{}');
        localStorage.setItem(CURRENT_MATCH_STATE_KEY, JSON.stringify({ ...currentState, players: updatedPlayers }));
    } catch (error) {
        console.error("Failed to update player name in storage:", error);
    }
  };
  
  const handleReset = () => {
    setView('setup');
    setPlayers([]);
    setBenchPlayers([]);
    setMatchInfo(null);
    localStorage.removeItem(CURRENT_MATCH_STATE_KEY);
  };
  
  const handleExportMatch = (match: Match) => {
    let text = `Partido del ${new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    text += `Lugar: ${match.location}\n\n`;

    const formatTeam = (teamSetup: TeamSetup) => {
        let teamText = `--- EQUIPO ${teamSetup.color.toUpperCase()} ---\n`;
        teamText += "Titulares:\n";
        Object.entries(teamSetup.playerNames).forEach(([pos, name]) => {
            teamText += `- ${name} (${pos})\n`;
        });
        if (teamSetup.bench.length > 0) {
            teamText += "\nBanca:\n";
            teamSetup.bench.forEach(name => {
                teamText += `- ${name}\n`;
            });
        }
        return teamText;
    }

    text += formatTeam(match.team1Setup);
    text += "\n\n";
    text += formatTeam(match.team2Setup);

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alineacion-${new Date(match.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderView = () => {
    if (!isInitialized) return null; // Or a loading spinner

    switch(view) {
      case 'field':
        return (
          <SoccerField 
            players={players}
            benchPlayers={benchPlayers}
            updatePlayerPosition={updatePlayerPosition} 
            updatePlayerName={updatePlayerName}
            onReset={handleReset}
            matchInfo={matchInfo}
          />
        );
      case 'history':
        return (
          <History
            history={history}
            onLoadMatch={handleLoadMatch}
            onExportMatch={handleExportMatch}
            onBack={() => setView('setup')}
            onClearHistory={() => {
              setHistory([]);
              localStorage.removeItem(HISTORY_STORAGE_KEY);
            }}
          />
        );
      case 'setup':
      default:
        return <PlayerSetup onSetupComplete={handleSetupComplete} history={history} onShowHistory={() => setView('history')} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-7xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-400">Organizador Táctico Ligres</h1>
        <p className="text-gray-400 mt-2">Define tus alineaciones, gestiona tu banca y comparte tu estrategia.</p>
      </header>

      <main className="w-full max-w-7xl flex-grow">
        {renderView()}
      </main>
      <footer className="w-full max-w-7xl text-center mt-8 text-gray-500 text-sm">
        <p>Creado por AFML</p>
      </footer>
    </div>
  );
}

export default App;