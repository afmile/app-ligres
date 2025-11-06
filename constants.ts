
import { PositionLayout, PositionName } from './types';

export const POSITIONS_6_PLAYERS: PositionName[] = [
  'Portero',
  'Defensa Central',
  'Lateral Izquierdo',
  'Lateral Derecho',
  'Mediocampista',
  'Delantero',
];

export const POSITIONS_7_PLAYERS: PositionName[] = [
  'Portero',
  'Defensa Central',
  'Lateral Izquierdo',
  'Lateral Derecho',
  'Mediocampista 1',
  'Mediocampista 2',
  'Delantero',
];

export const DEFAULT_LAYOUT_6_PLAYERS: PositionLayout[] = [
  { position: 'Portero', coordinates: { x: 50, y: 92 } },
  { position: 'Defensa Central', coordinates: { x: 50, y: 72 } },
  { position: 'Lateral Izquierdo', coordinates: { x: 25, y: 58 } },
  { position: 'Lateral Derecho', coordinates: { x: 75, y: 58 } },
  { position: 'Mediocampista', coordinates: { x: 50, y: 40 } },
  { position: 'Delantero', coordinates: { x: 50, y: 18 } },
];

export const DEFAULT_LAYOUT_7_PLAYERS: PositionLayout[] = [
  { position: 'Portero', coordinates: { x: 50, y: 92 } },
  { position: 'Defensa Central', coordinates: { x: 50, y: 70 } },
  { position: 'Lateral Izquierdo', coordinates: { x: 20, y: 60 } },
  { position: 'Lateral Derecho', coordinates: { x: 80, y: 60 } },
  { position: 'Mediocampista 1', coordinates: { x: 35, y: 42 } },
  { position: 'Mediocampista 2', coordinates: { x: 65, y: 42 } },
  { position: 'Delantero', coordinates: { x: 50, y: 20 } },
];
