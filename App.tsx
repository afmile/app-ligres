import React, { useState, useEffect } from 'react';
import { Player, TeamSetup, BenchPlayer, Match, Roster } from './types';
import PlayerSetup from './components/PlayerSetup';
import SoccerField from './components/SoccerField';
import History from './components/History';
import PaymentTracker from './components/PaymentTracker';
import Help from './components/Help';
import RosterManager from './components/RosterManager';
import { LAYOUTS, APP_VERSION, HORIZONTAL_ZONE_COORDS, VERTICAL_ZONE_COORDS } from './constants';

const HISTORY_STORAGE_KEY = 'soccerLineupHistory';
const CURRENT_MATCH_STATE_KEY = 'currentMatchState';
const ROSTER_STORAGE_KEY = 'soccerRosters';

const EDGE_PADDING = 2; // Prevent overlaps with field border

const clampToField = (value: number) => Math.min(100 - EDGE_PADDING, Math.max(EDGE_PADDING, value));

const createPlayersFromSetup = (team1: TeamSetup, team2: TeamSetup) => {
    const newPlayers: Player[] = [];
    const newBenchPlayers: BenchPlayer[] = [];
    let idCounter = 100;

    const mapLayoutToPlayer = (team: TeamSetup, isTopTeam: boolean) => {
        const layout = LAYOUTS[team.size];
        layout.forEach((posLayout) => {
            const horizontal = posLayout.zone.horizontal;
            const vertical = posLayout.zone.vertical;
            const baseX = clampToField(HORIZONTAL_ZONE_COORDS[horizontal]);
            const baseY = clampToField(VERTICAL_ZONE_COORDS[vertical]);
            const y = isTopTeam ? 100 - baseY : baseY;

            newPlayers.push({
                id: idCounter++,
                name: team.playerNames[posLayout.position] || `Jugador ${idCounter}`,
                position: posLayout.position,
                x: baseX,
                y,
                teamId: team.color,
            });
        });

        team.bench.forEach((name) => {
            if (name.trim()) {
                newBenchPlayers.push({ id: idCounter++, name, teamId: team.color });
            }
        });
    };

    // Team 1 (Bottom half, attacking "up")
    mapLayoutToPlayer(team1, false);
    // Team 2 (Top half, attacking "down")
    mapLayoutToPlayer(team2, true);

    return { players: newPlayers, benchPlayers: newBenchPlayers };
};

function App() {
  const [view, setView] = useState<'setup' | 'field' | 'history' | 'payment' | 'help' | 'roster'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<BenchPlayer[]>([]);
  const [matchInfo, setMatchInfo] = useState<{location: string, date: string, time: string} | null>(null);
  const [history, setHistory] = useState<Match[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [feePerPlayer, setFeePerPlayer] = useState<number | undefined>();
  const [playerPayments, setPlayerPayments] = useState<Record<number, boolean>>({});
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);


  useEffect(() => {
    try {
      const storedMatchState = localStorage.getItem(CURRENT_MATCH_STATE_KEY);
      if (storedMatchState) {
        const { view, players, benchPlayers, matchInfo, feePerPlayer, playerPayments, currentMatchId } = JSON.parse(storedMatchState);
        if ((view === 'field' || view === 'payment') && players && benchPlayers && matchInfo && matchInfo.time) {
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
      
      const storedRosters = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (storedRosters) {
        setRosters(JSON.parse(storedRosters));
      }

    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    } finally {
        setIsInitialized(true);
    }
  }, []);
  
  // Haptic feedback for interactions
  useEffect(() => {
    const triggerHapticFeedback = () => {
      if (navigator.vibrate) {
        navigator.vibrate(10); // A short, subtle vibration for UI feedback
      }
    };

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Trigger on buttons, links, and elements with button/switch roles
      if (target.closest('button, a[href], [role="button"], [role="switch"]')) {
        triggerHapticFeedback();
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
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
    const newMatchInfo = { location: match.location, date: match.date, time: match.time };
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
  
  const handleSetupComplete = (team1: TeamSetup, team2: TeamSetup, location: string, date: string, time: string, fee?: number) => {
    const { players, benchPlayers } = createPlayersFromSetup(team1, team2);
    // Create an initial empty payment object based on the new players
    const initialPayments: Record<number, boolean> = {};
    [...players, ...benchPlayers].forEach(p => {
        initialPayments[p.id] = false;
    });

    const newMatch = handleSaveMatch({ location, date, time, team1Setup: team1, team2Setup: team2, feePerPlayer: fee, playerPayments: initialPayments });
    
    const newMatchInfo = { location, date, time };
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
      if (matchData.players && matchData.benchPlayers && matchData.matchInfo && matchData.matchInfo.time) {
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
    let text = `Partido del ${new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${match.time} hrs\n`;
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
a.href = url;
    a.download = `alineacion-${new Date(match.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveRoster = (rosterToSave: Roster) => {
    const updatedRosters = [...rosters];
    const existingIndex = updatedRosters.findIndex(r => r.id === rosterToSave.id);

    if (existingIndex > -1) {
        updatedRosters[existingIndex] = rosterToSave;
    } else {
        updatedRosters.unshift(rosterToSave); // Add new rosters to the top
    }
    
    setRosters(updatedRosters);
    try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(updatedRosters));
    } catch (error) {
        console.error("Failed to save rosters to localStorage:", error);
    }
  };

  const handleDeleteRoster = (rosterId: string) => {
      const updatedRosters = rosters.filter(r => r.id !== rosterId);
      setRosters(updatedRosters);
      try {
          localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(updatedRosters));
      } catch (error) {
          console.error("Failed to save rosters to localStorage:", error);
      }
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
      case 'roster':
        return (
          <RosterManager
            rosters={rosters}
            onSaveRoster={handleSaveRoster}
            onDeleteRoster={handleDeleteRoster}
            onBack={() => setView('setup')}
          />
        );
      case 'setup':
      default:
        return (
            <PlayerSetup
                onSetupComplete={handleSetupComplete}
                history={history}
                onShowHistory={() => setView('history')}
                rosters={rosters}
                onShowRosters={() => setView('roster')}
            />
        );
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-7xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary">Organizador Táctico Ligres</h1>
        <p className="text-text-secondary mt-2">Define tus alineaciones, gestiona tu banca y comparte tu estrategia.</p>
      </header>

      <main className="w-full max-w-7xl flex-grow">
        {renderView()}
      </main>
      <footer className="w-full max-w-7xl text-center mt-8 text-text-secondary/75 text-sm">
        <p>Creado por AFML</p>
        <p className="text-xs mt-1">Versión {APP_VERSION}</p>
        <button onClick={() => setView('help')} className="mt-2 text-text-secondary hover:text-primary transition-colors">
            Ayuda
        </button>
      </footer>
    </div>
  );
}

export default App;
