import { Fragment, type CSSProperties } from "react";

/**
 * Split text into individually animatable letters, grouped by word so lines
 * only ever break between words. Screen readers get one plain copy.
 */
export function Letters({ text, className = "", style }: { text: string; className?: string; style?: CSSProperties }) {
  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, i) => (
              <span key={i} className="letter">
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
