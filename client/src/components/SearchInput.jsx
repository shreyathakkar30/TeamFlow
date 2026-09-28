export default function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      type="text"
      className="input max-w-xs"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
