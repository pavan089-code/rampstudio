import type { ReactNode } from "react";

export default function EventSection({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 border-t border-white/10 px-5 py-20 sm:px-8 md:px-12 lg:px-16 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {(eyebrow || title) ? (
          <div className="mb-10 max-w-3xl">
            {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-[#d0ad72]">{eyebrow}</p> : null}
            {title ? <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">{title}</h2> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
