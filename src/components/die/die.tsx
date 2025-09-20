interface IDieProps {
  value: number;
  sides: number;
}

export const Die = (props: IDieProps) => {
  return (
    <div className="die-container">
      <div className="die">
        <span className="die-value">{props.value}</span>
      </div>
      <span className="die-caption">D{props.sides}</span>
    </div>
  );
};
