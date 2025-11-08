import { PositionLayout, PositionName } from './types';

export const APP_VERSION = '1.1.0';

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
  { position: 'Portero', coordinates: { x: 50, y: 90 } },
  { position: 'Defensa Central', coordinates: { x: 50, y: 70 } },
  { position: 'Lateral Izquierdo', coordinates: { x: 25, y: 55 } },
  { position: 'Lateral Derecho', coordinates: { x: 75, y: 55 } },
  { position: 'Mediocampista', coordinates: { x: 50, y: 35 } },
  { position: 'Delantero', coordinates: { x: 50, y: 15 } },
];

export const DEFAULT_LAYOUT_7_PLAYERS: PositionLayout[] = [
  { position: 'Portero', coordinates: { x: 50, y: 90 } },
  { position: 'Defensa Central', coordinates: { x: 50, y: 70 } },
  { position: 'Lateral Izquierdo', coordinates: { x: 20, y: 60 } },
  { position: 'Lateral Derecho', coordinates: { x: 80, y: 60 } },
  { position: 'Mediocampista 1', coordinates: { x: 35, y: 40 } },
  { position: 'Mediocampista 2', coordinates: { x: 65, y: 40 } },
  { position: 'Delantero', coordinates: { x: 50, y: 15 } },
];

export const LAYOUTS: Record<6 | 7, PositionLayout[]> = {
  6: DEFAULT_LAYOUT_6_PLAYERS,
  7: DEFAULT_LAYOUT_7_PLAYERS,
};
