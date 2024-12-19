interface FilterMenuProps {
  setCategory: (category: string) => void;
}

export default function FilterMenu({ setCategory }: FilterMenuProps) {
  const categories = ["movies", "series", "documentaries"];

  return (
    <div className="flex gap-4 my-4 text-white">
      {categories.map((category) => (
        <button
          key={category}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          onClick={() => setCategory(category)}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  );
}
