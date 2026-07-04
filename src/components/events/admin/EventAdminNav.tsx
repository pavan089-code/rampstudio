import Link from "next/link";
const links=[ ["","Builder"],["/gallery","Gallery"],["/livestream","Live Stream"],["/rsvp","RSVP & Guestbook"],["/analytics","Analytics"] ];
export default function EventAdminNav({id}:{id:string}){return <nav className="flex gap-2 overflow-x-auto border-b border-white/10 pb-3">{links.map(([suffix,label])=><Link key={label} href={`/admin/events/${id}${suffix}`} className="whitespace-nowrap border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-[var(--accent-gold)]/40 hover:text-white">{label}</Link>)}</nav>}
