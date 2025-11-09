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

export type HorizontalZone = 'left-wide' | 'left-channel' | 'center' | 'right-channel' | 'right-wide';
export type VerticalZone =
  | 'goal-area'
  | 'deep-defense'
  | 'wide-defense'
  | 'midfield'
  | 'attacking-midfield'
  | 'forward-line';

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
  zone: {
    horizontal: HorizontalZone;
    vertical: VerticalZone;
  };
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
  time: string; // Stored as HH:mm format
  team1Setup: TeamSetup;
  team2Setup: TeamSetup;
  feePerPlayer?: number;
  playerPayments?: Record<number, boolean>;
}

// FIX: Add missing Roster type.
export interface Roster {
  id: string;
  name: string;
  playerNames: string[];
}
