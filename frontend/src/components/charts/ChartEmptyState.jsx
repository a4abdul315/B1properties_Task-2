function ChartEmptyState({ title = 'No data yet', hint, command }) {
  return (
    <div className="chart-empty-state">
      <strong>{title}</strong>
      {hint ? <p>{hint}</p> : null}
      {command ? <code>{command}</code> : null}
    </div>
  );
}

export default ChartEmptyState;
