import Image from 'next/image';

type IconProps = { className?: string };

function SocialPng({ src, className }: { src: string; className?: string }) {
  return <Image src={src} alt="" width={32} height={32} className={className} aria-hidden />;
}

export function FacebookIcon({ className }: IconProps) {
  return <SocialPng src="/brand/social/facebook.png" className={className} />;
}

export function InstagramIcon({ className }: IconProps) {
  return <SocialPng src="/brand/social/instagram.png" className={className} />;
}

export function YoutubeIcon({ className }: IconProps) {
  return <SocialPng src="/brand/social/youtube.png" className={className} />;
}

export function ThreadsIcon({ className }: IconProps) {
  return <SocialPng src="/brand/social/threads-logo-main.png" className={className} />;
}
