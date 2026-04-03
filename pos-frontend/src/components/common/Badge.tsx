interface Props {
  stock: number;
}

const Badge = ({ stock }: Props) => {
  if (stock === 0) {
    return (
      <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
        Sin stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
        Stock bajo: {stock}
      </span>
    );
  }
  return (
    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
      Stock: {stock}
    </span>
  );
};

export default Badge;
