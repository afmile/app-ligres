export type TeamColor = 'red' | 'blue' | 'black' | 'white';

export type PositionName = 
  | 'Portero'
  | 'Defensa Central'
  | 'Lateral Izquierdo'
  | 'Lateral Derecho'
  | 'Mediocampista'
  | 'Mediocampista 1'
  | 'Mediocampista 2'
  | 'Delantero';

export interface Player {
  id: number;
  name: string;
  position: PositionName;
  x: number; // Percentage
  y: number; // Percentage
  teamId: TeamColor;
}

export interface BenchPlayer {
    id: number;
    name: string;
    teamId: TeamColor;
}

export interface PositionLayout {
  position: PositionName;
  coordinates: { x: number; y: number };
}

export interface TeamSetup {
    color: TeamColor;
    size: 6 | 7;
    playerNames: Record<string, string>;
    bench: string[];
}

export interface Match {
  id: string;
  location: string;
  date: string; // Stored as ISO string
  team1Setup: TeamSetup;
  team2Setup: TeamSetup;
  feePerPlayer?: number;
  playerPayments?: Record<number, boolean>;
}

export interface Roster {
  id: string;
  name: string;
  playerNames: string[];
}
