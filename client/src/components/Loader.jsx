const Loader = ({ label = 'Loading', fullscreen = false }) => {
  const content = (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-accent dark:border-paper/15" />
      <p className="text-sm text-slate">{label}…</p>
    </div>
  );

  if (fullscreen) {
    return <div className="flex min-h-[60vh] items-center justify-center">{content}</div>;
  }
  return content;
};

export default Loader;
