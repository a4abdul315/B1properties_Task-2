function ChartCard({ title, subtitle, children }) {
  return (
    <article className="chart-card">
      <div className="chart-card__header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="chart-card__body">{children}</div>
    </article>
  );
}

export default ChartCard;
