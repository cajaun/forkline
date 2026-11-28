import type { SettingsInfo } from '@/components/trays/settings/info-content';

import type { PLAYER_CARDS } from './player-stat-pages';

type CardKey = (typeof PLAYER_CARDS)[number]['key'];

// one explainer per card and only your games against the AI with at least one move count
export const PLAYER_CARD_INFO: Record<CardKey, Pick<SettingsInfo, 'items'>> = {
  advanced: {
    items: [
      { body: 'How many times you started a game over', title: 'Restarts' },
      { body: 'The most moves in one game, counting both sides', title: 'Longest' },
      { body: 'Finished games that ended level or that you lost', title: 'Draws and losses' },
    ],
  },
  board: {
    items: [
      { body: 'Every move you made across your games', title: 'Moves' },
      { body: 'The share of your finished games that you won', title: 'Win rate' },
      {
        body: 'The pieces you took from the AI and the pieces it took from you',
        title: 'Captures and pieces lost',
      },
    ],
  },
  games: {
    items: [
      {
        body: 'Your games against the AI with at least one move. Games where the two AIs play each other stay out',
        title: 'Started',
      },
      { body: 'The games you won and how many of those ended in checkmate', title: 'Won and checkmates' },
      { body: 'The share of your started games that reached an end', title: 'Completed' },
    ],
  },
  speed: {
    items: [
      { body: 'The least time a won game took on its clock', title: 'Fastest win' },
      { body: 'The time a finished game took on average', title: 'Average' },
      { body: 'The time across all your games', title: 'Total' },
      { body: 'Your total time spread over the moves you made', title: 'Per move' },
    ],
  },
};
