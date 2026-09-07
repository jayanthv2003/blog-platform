const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-16 text-center dark:border-line-dark">
    <h3 className="font-display text-xl font-medium text-ink dark:text-paper">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm text-slate">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
