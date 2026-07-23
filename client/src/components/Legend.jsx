import categories from '../data/categories';

function Legend() {
  return (
    <div className="legend">
      <p className="legend-title">Legend</p>
      {categories.map((cat) => (
        <div key={cat.id} className="legend-item">
          <span className="legend-swatch" style={{ backgroundColor: cat.color }}></span>
          {cat.name}
        </div>
      ))}
      <p className="legend-note">Larger text = higher priority</p>
    </div>
  );
}

export default Legend;