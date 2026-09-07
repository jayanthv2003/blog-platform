const StatCard = ({ icon, label, value }) => (
  <div className="rounded-lg border border-line p-5 dark:border-line-dark">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate">{label}</p>
      <span className="text-accent">{icon}</span>
    </div>
    <p className="mt-2 font-display text-3xl font-medium text-ink dark:text-paper">{value}</p>
  </div>
);

export default StatCard;
