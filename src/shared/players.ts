export const players = {
  b: { name: 'enzo', rating: '???' },
  w: { name: 'magnus', rating: '2841' },
} as const;

export const playerAvatars = {
  w: require('../../assets/avatars/avatar-magnus.jpg'),
  b: require('../../assets/avatars/avatar-enzo.jpg'),
} as const;
