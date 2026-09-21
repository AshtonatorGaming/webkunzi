export default function Crest({
  color,
  size = 28,
  title,
}: {
  color: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 24 28"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 1.4 L22 5.2 V14.2 C22 20.2 12 26.6 12 26.6 C12 26.6 2 20.2 2 14.2 V5.2 Z"
        fill={color}
        stroke="#c4a574"
        strokeWidth="1.2"
      />
      <path d="M12 4.2 L19 7 V14 C19 18.4 12 23.2 12 23.2 C12 23.2 5 18.4 5 14 V7 Z" fill="none" stroke="#0e0c0a" strokeOpacity="0.35" />
    </svg>
  );
}
