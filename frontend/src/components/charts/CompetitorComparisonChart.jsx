import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';
import ChartEmptyState from './ChartEmptyState';

function CompetitorComparisonChart({ data }) {
  const series = data?.series || [];

  return (
    <ChartCard title="Competitor Comparison" subtitle="New listing velocity by competitor">
      {series.length === 0 ? (
        <ChartEmptyState
          title="No listing velocity found"
          hint="There are no listings matching the current window and filters."
          command="Try All areas and All categories"
        />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7dddc" />
            <XAxis dataKey="competitor" stroke="#4c635a" />
            <YAxis stroke="#4c635a" />
            <Tooltip />
            <Bar dataKey="newListings" fill="#14532d" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export default CompetitorComparisonChart;
