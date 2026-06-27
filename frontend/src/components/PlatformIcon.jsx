// Maps a service category string (e.g. "Instagram Followers") to a
// recognizable platform glyph + brand-tinted background, with a sensible
// fallback for anything we don't explicitly recognize.

const PLATFORMS = [
  {
    key: 'instagram',
    match: /instagram|insta\b|ig\b/i,
    bg: 'bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-4 h-4">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="white" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    match: /youtube|yt\b/i,
    bg: 'bg-red-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z"/>
      </svg>
    ),
  },
  {
    key: 'facebook',
    match: /facebook|\bfb\b/i,
    bg: 'bg-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5h1.3V5.1C16 5 15 5 13.9 5c-2.3 0-3.9 1.4-3.9 4v2H8v3h2v7h3.5Z"/>
      </svg>
    ),
  },
  {
    key: 'tiktok',
    match: /tiktok|tik tok/i,
    bg: 'bg-slate-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M16.5 3c.4 2 1.8 3.4 4 3.7v2.6a6.7 6.7 0 0 1-4-1.3v6.4a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1V12a2.9 2.9 0 1 0 2 2.7V3h2.4Z"/>
      </svg>
    ),
  },
  {
    key: 'twitter',
    match: /twitter|\bx\b/i,
    bg: 'bg-black',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
        <path d="M3 3l7.5 9.3L3.3 21H6l5.8-6.8L17 21h4l-7.9-9.8L20.6 3h-2.7l-5.3 6.2L7.7 3H3Z"/>
      </svg>
    ),
  },
  {
    key: 'telegram',
    match: /telegram/i,
    bg: 'bg-sky-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M21 4.5 3.4 11.2c-1 .4-1 1.8.1 2.1l4.2 1.3 1.6 5c.3.9 1.5 1.1 2.1.3l2.2-2.8 4.3 3.2c.8.6 1.9.1 2.1-.8L22 5.6c.2-.9-.7-1.6-1-1.1Z"/>
      </svg>
    ),
  },
  {
    key: 'spotify',
    match: /spotify/i,
    bg: 'bg-green-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 9.8c2.8-.8 5.7-.6 8 .7M7.8 12.6c2.3-.6 4.8-.5 6.8.6M8.2 15.3c1.9-.5 3.9-.4 5.5.5" stroke="#1db954" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'linkedin',
    match: /linkedin/i,
    bg: 'bg-blue-700',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M5 9h2.8v9H5V9Zm1.4-4.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM10.2 9H13v1.3c.5-.8 1.4-1.6 2.9-1.6 2.2 0 3.6 1.5 3.6 4.2V18h-2.8v-4.4c0-1.2-.5-2-1.6-2-1 0-1.6.7-1.9 1.4-.1.3-.1.6-.1 1V18h-2.8V9Z"/>
      </svg>
    ),
  },
  {
    key: 'whatsapp',
    match: /whatsapp/i,
    bg: 'bg-emerald-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.3 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1a14.5 14.5 0 0 1-6.6-5.4c-.5-.7-.9-1.5-.9-2.4 0-.8.4-1.6 1-2.1.2-.2.5-.3.8-.3h.5c.2 0 .5 0 .7.5l.8 1.9c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.4 0 .6.5.9 1.6 2 2.5 2.5.2.1.4.1.6 0l.5-.5c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.3.4.6.1.4 0 1-.2 1.5Z"/>
      </svg>
    ),
  },
  {
    key: 'discord',
    match: /discord/i,
    bg: 'bg-indigo-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M19 5.5A17 17 0 0 0 15 4l-.3.6a13 13 0 0 1 3.7 1.4A14.5 14.5 0 0 0 12 5a14.5 14.5 0 0 0-6.4 1-13 13 0 0 1 3.7-1.4L9 4a17 17 0 0 0-4 1.5C2.8 9 2.3 12.4 2.5 15.8A12 12 0 0 0 6.7 18l.7-1.1a8 8 0 0 1-1.6-.8c.1-.1.3-.2.4-.3a11 11 0 0 0 11.6 0l.4.3c-.5.3-1 .6-1.6.8l.7 1.1a12 12 0 0 0 4.2-2.2c.3-3.8-.6-7.2-2.1-10.2ZM9.3 13.8c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6Zm5.4 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6Z"/>
      </svg>
    ),
  },
  {
    key: 'pinterest',
    match: /pinterest/i,
    bg: 'bg-red-700',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 .1-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.5-.3 1 .5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.2 0-2.2-1.5-3.8-4.2-3.8-3 0-4.9 2.2-4.9 4.7 0 .9.3 1.5.7 2 .2.2.2.3.1.5l-.3 1c0 .2-.2.3-.4.2-1.3-.5-1.9-2-1.9-3.6 0-2.7 2.3-5.9 6.8-5.9 3.6 0 6 2.6 6 5.4 0 3.7-2 6.5-5 6.5-1 0-1.9-.5-2.2-1.2l-.6 2.4c-.2.8-.7 1.8-1 2.4A10 10 0 1 0 12 2Z"/>
      </svg>
    ),
  },
  {
    key: 'snapchat',
    match: /snapchat/i,
    bg: 'bg-yellow-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="#1f2937" className="w-4 h-4">
        <path d="M12 3c2.7 0 4.4 2 4.5 4.3 0 .8 0 1.6-.1 2.2.4.2.9.2 1.3 0 .4-.1.9.1 1 .5.1.4 0 .8-.4 1-.5.3-1 .6-1.2 1 0 .4.5 1.1 1.5 1.7.3.2.4.6.2.9-.4.7-1.4.9-2.2 1-.1.3-.2.7-.4 1-.5.6-1.4.6-2.2.6-.6 0-1 .2-1.5.6-.6.4-1.2.9-2.5.9s-1.9-.5-2.5-.9c-.5-.4-.9-.6-1.5-.6-.8 0-1.7 0-2.2-.6-.2-.3-.3-.7-.4-1-.8-.1-1.8-.3-2.2-1a.7.7 0 0 1 .2-.9c1-.6 1.5-1.3 1.5-1.7-.2-.4-.7-.7-1.2-1-.4-.2-.5-.6-.4-1 .1-.4.6-.6 1-.5.4.2.9.2 1.3 0-.1-.6-.1-1.4-.1-2.2C7.6 5 9.3 3 12 3Z"/>
      </svg>
    ),
  },
  {
    key: 'threads',
    match: /threads/i,
    bg: 'bg-neutral-800',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
        <path d="M12.2 2C7 2 4 5.4 4 10.7v2.6C4 18.6 7 22 12.2 22c4.6 0 7.5-2.7 7.7-6.6h-2.6c-.2 2.5-1.9 4.2-5.1 4.2-3.3 0-5-2.1-5-5v-.5c.7.6 2 1.1 3.6 1.1 3 0 5-1.7 5-4.3 0-2.7-2.1-4.4-5.1-4.4-3 0-5.1 1.7-5.4 4.4h2.5c.2-1.3 1.2-2.1 2.8-2.1 1.5 0 2.6.8 2.6 2 0 1.3-1.2 2-2.8 2-1.3 0-2.3-.4-2.9-1.1H9.4c.5-3.6 3-5.6 6.6-5.6 3.9 0 6.6 2.4 6.6 6.4v2.5C22.6 19.6 18.6 22 13.9 22"/>
      </svg>
    ),
  },
  {
    key: 'soundcloud',
    match: /soundcloud/i,
    bg: 'bg-orange-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
        <path d="M3 13.5v3.8h13.4c2.6 0 4.6-1.9 4.6-4.4 0-2.4-1.9-4.3-4.3-4.4-.4-2.8-2.8-5-5.8-5-2.2 0-4.1 1.2-5.1 3-1.7.2-3 1.7-3 3.5 0 .3 0 .7.1 1H3v2.5Z"/>
      </svg>
    ),
  },
  {
    key: 'website',
    match: /website|traffic|seo|backlink/i,
    bg: 'bg-cyan-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-4 h-4">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
]

const FALLBACK = {
  bg: 'bg-slate-500',
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-4 h-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
}

export function getPlatform(category = '') {
  return PLATFORMS.find(p => p.match.test(category)) || FALLBACK
}

export default function PlatformIcon({ category, size = 'md', className = '' }) {
  const platform = getPlatform(category)
  const sizeClasses = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8'
  return (
    <span className={`inline-flex items-center justify-center rounded-lg shrink-0 ${sizeClasses} ${platform.bg} ${className}`}>
      {platform.icon}
    </span>
  )
}
