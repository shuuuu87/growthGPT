export const defaultAvatars = [
  '/avatars/Male_avatar_casual_style_00787740.png',
  '/avatars/Bearded_man_avatar_df2715c1.png',
  '/avatars/Young_man_in_hoodie_ffa0562b.png',
  '/avatars/Man_with_spiky_hair_6027b831.png',
  '/avatars/Man_with_fade_haircut_a0ef8d35.png',
  '/avatars/Professional_man_in_suit_a0fba37b.png',
  '/avatars/Man_with_tied_hair_0d4bc5bf.png',
  '/avatars/Man_with_afro_8aee14d9.png',
  '/avatars/Man_with_undercut_b1e80f23.png',
];

export function getRandomAvatar(): string {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return defaultAvatars[randomIndex];
}
