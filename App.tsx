
import React, { useState, useEffect } from 'react';
import { Player, TeamSetup, BenchPlayer, Match } from './types';
import PlayerSetup from './components/PlayerSetup';
import SoccerField from './components/SoccerField';
import History from './components/History';
import PaymentTracker from './components/PaymentTracker';
import Help from './components/Help';
import { LAYOUTS, APP_VERSION } from './constants';

const HISTORY_STORAGE_KEY = 'soccerLineupHistory';
const CURRENT_MATCH_STATE_KEY = 'currentMatchState';

const createPlayersFromSetup = (team1: TeamSetup, team2: TeamSetup) => {
    const newPlayers: Player[] = [];
    const newBenchPlayers: BenchPlayer[] = [];
    let idCounter = 100;

    const layout1 = LAYOUTS[team1.size][team1.formation];
    layout1.forEach((posLayout) => {
      newPlayers.push({
        id: idCounter++,
        name: team1.playerNames[posLayout.position] || `Jugador ${idCounter}`,
        position: posLayout.position,
        x: posLayout.coordinates.x,
        y: 50 + (posLayout.coordinates.y / 2),
        teamId: team1.color,
      });
    });

    team1.bench.forEach((name) => {
        if(name.trim()) {
            newBenchPlayers.push({ id: idCounter++, name, teamId: team1.color });
        }
    });

    const layout2 = LAYOUTS[team2.size][team2.formation];
    layout2.forEach((posLayout) => {
      newPlayers.push({
        id: idCounter++,
        name: team2.playerNames[posLayout.position] || `Jugador ${idCounter}`,
        position: posLayout.position,
        x: 100 - posLayout.coordinates.x,
        y: (100 - posLayout.coordinates.y) / 2,
        teamId: team2.color,
      });
    });
    
    team2.bench.forEach((name) => {
        if(name.trim()) {
            newBenchPlayers.push({ id: idCounter++, name, teamId: team2.color });
        }
    });
    
    return { players: newPlayers, benchPlayers: newBenchPlayers };
};

function App() {
  const [view, setView] = useState<'setup' | 'field' | 'history' | 'payment' | 'help'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<BenchPlayer[]>([]);
  const [matchInfo, setMatchInfo] = useState<{location: string, date: string} | null>(null);
  const [history, setHistory] = useState<Match[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [feePerPlayer, setFeePerPlayer] = useState<number | undefined>();
  const [playerPayments, setPlayerPayments] = useState<Record<number, boolean>>({});
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);


  useEffect(() => {
    try {
      const storedMatchState = localStorage.getItem(CURRENT_MATCH_STATE_KEY);
      if (storedMatchState) {
        const { view, players, benchPlayers, matchInfo, feePerPlayer, playerPayments, currentMatchId } = JSON.parse(storedMatchState);
        if ((view === 'field' || view === 'payment') && players && benchPlayers && matchInfo) {
          setPlayers(players);
          setBenchPlayers(benchPlayers);
          setMatchInfo(matchInfo);
          setFeePerPlayer(feePerPlayer);
          setPlayerPayments(playerPayments || {});
          setCurrentMatchId(currentMatchId || null);
          setView(view);
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
  
  const saveCurrentMatchState = (state: any) => {
    try {
      localStorage.setItem(CURRENT_MATCH_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save current match state:", error);
    }
  };

  const handleSaveMatch = (matchData: Omit<Match, 'id'>): Match => {
    const newMatch: Match = { ...matchData, id: new Date().toISOString() };
    const updatedHistory = [newMatch, ...history.slice(0, 19)]; // Keep latest 20
    setHistory(updatedHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
    return newMatch;
  };
  
  const handleLoadMatch = (match: Match) => {
    const { players, benchPlayers } = createPlayersFromSetup(match.team1Setup, match.team2Setup);
    const newMatchInfo = { location: match.location, date: match.date };
    const fee = match.feePerPlayer;
    const payments = match.playerPayments || {};
    setPlayers(players);
    setBenchPlayers(benchPlayers);
    setMatchInfo(newMatchInfo);
    setFeePerPlayer(fee);
    setPlayerPayments(payments);
    setCurrentMatchId(match.id);
    setView('field');
    
    saveCurrentMatchState({ view: 'field', players, benchPlayers, matchInfo: newMatchInfo, feePerPlayer: fee, playerPayments: payments, currentMatchId: match.id });
  };
  
  const handleSetupComplete = (team1: TeamSetup, team2: TeamSetup, location: string, date: string, fee?: number) => {
    const { players, benchPlayers } = createPlayersFromSetup(team1, team2);
    // Create an initial empty payment object based on the new players
    const initialPayments: Record<number, boolean> = {};
    [...players, ...benchPlayers].forEach(p => {
        initialPayments[p.id] = false;
    });

    const newMatch = handleSaveMatch({ location, date, team1Setup: team1, team2Setup: team2, feePerPlayer: fee, playerPayments: initialPayments });
    
    const newMatchInfo = { location, date };
    setPlayers(players);
    setBenchPlayers(benchPlayers);
    setMatchInfo(newMatchInfo);
    setFeePerPlayer(fee);
    setPlayerPayments(initialPayments);
    setCurrentMatchId(newMatch.id);
    setView('field');
    
    saveCurrentMatchState({ view: 'field', players, benchPlayers, matchInfo: newMatchInfo, feePerPlayer: fee, playerPayments: initialPayments, currentMatchId: newMatch.id });
  };

  const updatePlayerPosition = (id: number, x: number, y: number) => {
    const updatedPlayers = players.map(player => (player.id === id ? { ...player, x, y } : player));
    setPlayers(updatedPlayers);
    const currentState = JSON.parse(localStorage.getItem(CURRENT_MATCH_STATE_KEY) || '{}');
    saveCurrentMatchState({ ...currentState, players: updatedPlayers });
  };

  const updatePlayerName = (id: number, newName: string) => {
    const updatedPlayers = players.map(player => (player.id === id ? { ...player, name: newName } : player));
    setPlayers(updatedPlayers);
    const currentState = JSON.parse(localStorage.getItem(CURRENT_MATCH_STATE_KEY) || '{}');
    saveCurrentMatchState({ ...currentState, players: updatedPlayers });
  };
  
    const handleUpdatePlayerPayment = (playerId: number, isPaid: boolean) => {
    const updatedPayments = { ...playerPayments, [playerId]: isPaid };
    setPlayerPayments(updatedPayments);
    const currentState = JSON.parse(localStorage.getItem(CURRENT_MATCH_STATE_KEY) || '{}');
    saveCurrentMatchState({ ...currentState, playerPayments: updatedPayments });
  };

  const handleImportMatch = (matchDataString: string) => {
    try {
      const matchData = JSON.parse(matchDataString);
      if (matchData.players && matchData.benchPlayers && matchData.matchInfo) {
        const newView = matchData.feePerPlayer ? 'payment' : 'field';
        setPlayers(matchData.players);
        setBenchPlayers(matchData.benchPlayers);
        setMatchInfo(matchData.matchInfo);
        setFeePerPlayer(matchData.feePerPlayer);
        setPlayerPayments(matchData.playerPayments || {});
        setCurrentMatchId(null); // Imported match is not from history
        setView(newView);
        
        saveCurrentMatchState({ view: newView, ...matchData, currentMatchId: null });
        alert('Partido importado con éxito!');
      } else {
        throw new Error('Archivo de partido inválido.');
      }
    } catch (error) {
      console.error("Error al importar el partido:", error);
      alert('Error al importar el partido. Asegúrate de que el archivo es correcto.');
    }
  };

  const handleReset = () => {
    if (currentMatchId && history.find(m => m.id === currentMatchId)) {
        const updatedHistory = history.map(match => {
            if (match.id === currentMatchId) {
                // Find current team setups from the match in history
                const currentMatchInHistory = history.find(m => m.id === currentMatchId);
                if (currentMatchInHistory) {
                    const { players, benchPlayers } = createPlayersFromSetup(currentMatchInHistory.team1Setup, currentMatchInHistory.team2Setup);
                    const finalPayments: Record<number, boolean> = {};
                    [...players, ...benchPlayers].forEach(p => {
                        finalPayments[p.id] = playerPayments[p.id] || false;
                    });
                    return { ...match, playerPayments: finalPayments };
                }
            }
            return match;
        });
        setHistory(updatedHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    }

    setView('setup');
    setPlayers([]);
    setBenchPlayers([]);
    setMatchInfo(null);
    setFeePerPlayer(undefined);
    setPlayerPayments({});
    setCurrentMatchId(null);
    localStorage.removeItem(CURRENT_MATCH_STATE_KEY);
  };
  
  const handleExportMatch = (match: Match) => {
    let text = `Partido del ${new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    text += `Lugar: ${match.location}\n\n`;

    const formatTeam = (teamSetup: TeamSetup) => {
        let teamText = `--- EQUIPO ${teamSetup.color.toUpperCase()} ---\n`;
        teamText += `Formación: ${teamSetup.formation}\n`;
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

    if (match.feePerPlayer && match.feePerPlayer > 0 && match.playerPayments) {
        text += "\n\n--- ESTADO DE PAGOS ---\n";
        const { players, benchPlayers } = createPlayersFromSetup(match.team1Setup, match.team2Setup);
        const allPlayers = [...players, ...benchPlayers];
        
        allPlayers.sort((a,b) => a.name.localeCompare(b.name)).forEach(player => {
            const paid = match.playerPayments?.[player.id] || false;
            text += `- ${player.name}: ${paid ? 'Pagado' : 'Pendiente'}\n`;
        });
    }

    const blob = new Blob([text], { type: 'text/plain' });
    // FIX: Changed URL.ObjectURL to URL.createObjectURL
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
            feePerPlayer={feePerPlayer}
            onGoToPayments={() => setView('payment')}
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
      case 'payment':
        return (
          <PaymentTracker
            players={players}
            benchPlayers={benchPlayers}
            feePerPlayer={feePerPlayer || 0}
            playerPayments={playerPayments}
            onUpdatePayment={handleUpdatePlayerPayment}
            onBackToField={() => setView('field')}
            onImportMatch={handleImportMatch}
            matchInfo={matchInfo}
          />
        );
      case 'help':
        return <Help onBack={() => setView('setup')} />;
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
        <p className="text-xs text-gray-600 mt-1">Versión {APP_VERSION}</p>
        <button onClick={() => setView('help')} className="mt-2 text-gray-400 hover:text-green-400 transition-colors">
            Ayuda
        </button>
      </footer>
    </div>
  );
}

export default App;