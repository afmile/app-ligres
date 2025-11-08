import { PositionLayout, PositionName, Formation } from './types';

export const APP_VERSION = '1.0.0';

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

export const DEFENSIVE_LAYOUT_6_PLAYERS: PositionLayout[] = [
  { position: 'Portero', coordinates: { x: 50, y: 90 } },
  { position: 'Defensa Central', coordinates: { x: 50, y: 75 } },
  { position: 'Lateral Izquierdo', coordinates: { x: 25, y: 65 } },
  { position: 'Lateral Derecho', coordinates: { x: 75, y: 65 } },
  { position: 'Mediocampista', coordinates: { x: 50, y: 45 } },
  { position: 'Delantero', coordinates: { x: 50, y: 25 } },
];

export const DEFENSIVE_LAYOUT_7_PLAYERS: PositionLayout[] = [
  { position: 'Portero', coordinates: { x: 50, y: 90 } },
  { position: 'Defensa Central', coordinates: { x: 50, y: 75 } },
  { position: 'Lateral Izquierdo', coordinates: { x: 20, y: 68 } },
  { position: 'Lateral Derecho', coordinates: { x: 80, y: 68 } },
  { position: 'Mediocampista 1', coordinates: { x: 35, y: 50 } },
  { position: 'Mediocampista 2', coordinates: { x: 65, y: 50 } },
  { position: 'Delantero', coordinates: { x: 50, y: 25 } },
];

export const OFFENSIVE_LAYOUT_6_PLAYERS: PositionLayout[] = [
    { position: 'Portero', coordinates: { x: 50, y: 90 } },
    { position: 'Defensa Central', coordinates: { x: 50, y: 65 } },
    { position: 'Lateral Izquierdo', coordinates: { x: 25, y: 45 } },
    { position: 'Lateral Derecho', coordinates: { x: 75, y: 45 } },
    { position: 'Mediocampista', coordinates: { x: 50, y: 25 } },
    { position: 'Delantero', coordinates: { x: 50, y: 10 } },
];

export const OFFENSIVE_LAYOUT_7_PLAYERS: PositionLayout[] = [
    { position: 'Portero', coordinates: { x: 50, y: 90 } },
    { position: 'Defensa Central', coordinates: { x: 50, y: 65 } },
    { position: 'Lateral Izquierdo', coordinates: { x: 20, y: 50 } },
    { position: 'Lateral Derecho', coordinates: { x: 80, y: 50 } },
    { position: 'Mediocampista 1', coordinates: { x: 35, y: 30 } },
    { position: 'Mediocampista 2', coordinates: { x: 65, y: 30 } },
    { position: 'Delantero', coordinates: { x: 50, y: 10 } },
];


export const LAYOUTS: Record<6 | 7, Record<Formation, PositionLayout[]>> = {
  6: {
    'Equilibrada': DEFAULT_LAYOUT_6_PLAYERS,
    'Ofensiva': OFFENSIVE_LAYOUT_6_PLAYERS,
    'Defensiva': DEFENSIVE_LAYOUT_6_PLAYERS,
  },
  7: {
    'Equilibrada': DEFAULT_LAYOUT_7_PLAYERS,
    'Ofensiva': OFFENSIVE_LAYOUT_7_PLAYERS,
    'Defensiva': DEFENSIVE_LAYOUT_7_PLAYERS,
  }
};