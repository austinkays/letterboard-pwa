interface TextDisplayProps {
  text: string;
}

export function TextDisplay({ text }: TextDisplayProps) {
  return (
    <section className="text-display" aria-label="Current message" aria-live="polite" tabIndex={0}>
      {text.length > 0 ? text : "No message yet"}
    </section>
  );
}
