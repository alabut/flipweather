export const GRID_COLS = 22;
export const GRID_ROWS = 5;

// Portrait grid for mobile phones in vertical orientation
export const GRID_COLS_PORTRAIT = 9;
export const GRID_ROWS_PORTRAIT = 12;

export const SCRAMBLE_DURATION = 800;
export const FLIP_DURATION = 300;
export const STAGGER_DELAY = 25;
export const TOTAL_TRANSITION = 3800;
export const MESSAGE_INTERVAL = 4000;

export const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-!?\'/: ';

export const SCRAMBLE_COLORS = [
  '#00AAFF', '#00FFCC', '#AA00FF',
  '#FF2D00', '#FFCC00', '#FFFFFF'
];

export const ACCENT_COLORS = [
  '#00FF7F', '#FF4D00', '#AA00FF',
  '#00AAFF', '#00FFCC'
];

// Portrait default messages — 9 cols × 12 rows, max 9 chars per line
export const DEFAULT_MESSAGES_PORTRAIT = [
  ['', '', 'FLIP', 'WEATHER', '', '', 'LIVE', 'UPDATES', '', '', '', ''],
  ['', '', 'ENABLE', 'LOCATION', '', '', 'TO SEE', 'YOUR', 'WEATHER', '', '', ''],
  ['', '', 'TEMP', 'WIND', 'HUMIDITY', '', 'UV INDEX', '', '', '', '', '']
];

export const DEFAULT_MESSAGES = [
  [
    '',
    'FLIP WEATHER',
    'LIVE CONDITIONS',
    'OLD-SCHOOL STYLE',
    ''
  ],
  [
    '',
    'ENABLE LOCATION',
    'TO SEE YOUR',
    'LOCAL WEATHER',
    ''
  ],
  [
    '',
    'TEMPERATURE',
    'WIND + HUMIDITY',
    'UV INDEX + MORE',
    ''
  ]
];
