import Image from 'next/image';

const iconSources = {
  'arrow-brand': { height: 48, src: '/icons/arrow-brand.png', width: 48 },
  'arrow-light': { height: 48, src: '/icons/arrow-light.png', width: 48 },
  award: { height: 80, src: '/icons/award.png', width: 80 },
  'cancel-light': { height: 80, src: '/icons/cancel-light.png', width: 80 },
  history: { height: 48, src: '/icons/history.png', width: 48 },
  home: { height: 48, src: '/icons/home.png', width: 48 },
  lock: { height: 48, src: '/icons/lock.png', width: 48 },
  logout: { height: 48, src: '/icons/logout.png', width: 48 },
  'manage-account': {
    height: 180,
    src: '/icons/manage-account.png',
    width: 180,
  },
  'switch-user': { height: 48, src: '/icons/switch-user.png', width: 48 },
  trash: { height: 48, src: '/icons/trash.png', width: 48 },
  'user-dark': { height: 48, src: '/icons/user-dark.png', width: 48 },
  'user-access': { height: 150, src: '/icons/user-access.png', width: 150 },
  'user-light': { height: 80, src: '/icons/user-light.png', width: 80 },
  'visibility-off': {
    height: 48,
    src: '/icons/visibility-off.png',
    width: 48,
  },
} as const;

export type IconName = keyof typeof iconSources;

type IconProps = {
  className?: string;
  name: IconName;
};

export function Icon({ className, name }: IconProps) {
  const icon = iconSources[name];

  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={icon.height}
      src={icon.src}
      width={icon.width}
    />
  );
}
