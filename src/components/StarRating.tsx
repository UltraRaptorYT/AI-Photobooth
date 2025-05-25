export default function StarRating({
  rating,
  setRating,
}: {
  rating: number | null;
  setRating: (value: number) => void;
}) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5, 6].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`text-4xl ${
            rating && star <= rating ? "text-yellow-400" : "text-gray-400"
          } hover:scale-110 transition`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
