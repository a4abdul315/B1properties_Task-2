const dayOptions = [7, 14, 30, 90];
const groupOptions = ['day', 'week', 'month'];

function FilterBar({ filters, options, onFilterChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="area">Area</label>
        <select
          id="area"
          value={filters.area}
          onChange={(event) => onFilterChange('area', event.target.value)}
        >
          <option value="">All areas</option>
          {options.areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="competitor">Competitor</label>
        <select
          id="competitor"
          value={filters.competitor}
          onChange={(event) => onFilterChange('competitor', event.target.value)}
        >
          <option value="">All competitors</option>
          {options.competitors.map((competitor) => (
            <option key={competitor._id} value={competitor._id}>
              {competitor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={filters.category}
          onChange={(event) => onFilterChange('category', event.target.value)}
        >
          <option value="">All categories</option>
          {options.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="days">Window</label>
        <select
          id="days"
          value={filters.days}
          onChange={(event) => onFilterChange('days', Number(event.target.value))}
        >
          {dayOptions.map((days) => (
            <option key={days} value={days}>
              Last {days} days
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="groupBy">Resolution</label>
        <select
          id="groupBy"
          value={filters.groupBy}
          onChange={(event) => onFilterChange('groupBy', event.target.value)}
        >
          {groupOptions.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FilterBar;
