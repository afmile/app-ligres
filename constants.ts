import { PositionLayout, PositionName, HorizontalZone, VerticalZone } from './types';

export const APP_VERSION = '1.1.0';

export const HORIZONTAL_ZONE_COORDS: Record<HorizontalZone, number> = {
  'left-wide': 14,
  'left-channel': 32,
  center: 50,
  'right-channel': 68,
  'right-wide': 86,
};

export const VERTICAL_ZONE_COORDS: Record<VerticalZone, number> = {
  'goal-area': 92,
  'deep-defense': 82,
  'wide-defense': 72,
  midfield: 60,
  'attacking-midfield': 54,
  'forward-line': 48,
};

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
  { position: 'Portero', zone: { horizontal: 'center', vertical: 'goal-area' } },
  { position: 'Defensa Central', zone: { horizontal: 'center', vertical: 'deep-defense' } },
  { position: 'Lateral Izquierdo', zone: { horizontal: 'left-wide', vertical: 'wide-defense' } },
  { position: 'Lateral Derecho', zone: { horizontal: 'right-wide', vertical: 'wide-defense' } },
  { position: 'Mediocampista', zone: { horizontal: 'center', vertical: 'midfield' } },
  { position: 'Delantero', zone: { horizontal: 'center', vertical: 'forward-line' } },
];

export const DEFAULT_LAYOUT_7_PLAYERS: PositionLayout[] = [
  { position: 'Portero', zone: { horizontal: 'center', vertical: 'goal-area' } },
  { position: 'Defensa Central', zone: { horizontal: 'center', vertical: 'deep-defense' } },
  { position: 'Lateral Izquierdo', zone: { horizontal: 'left-wide', vertical: 'wide-defense' } },
  { position: 'Lateral Derecho', zone: { horizontal: 'right-wide', vertical: 'wide-defense' } },
  { position: 'Mediocampista 1', zone: { horizontal: 'left-channel', vertical: 'midfield' } },
  { position: 'Mediocampista 2', zone: { horizontal: 'right-channel', vertical: 'midfield' } },
  { position: 'Delantero', zone: { horizontal: 'center', vertical: 'forward-line' } },
];

export const LAYOUTS: Record<6 | 7, PositionLayout[]> = {
  6: DEFAULT_LAYOUT_6_PLAYERS,
  7: DEFAULT_LAYOUT_7_PLAYERS,
};
