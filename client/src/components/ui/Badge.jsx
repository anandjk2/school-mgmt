const variants = {
  active:    'bg-green-100 text-green-800',
  inactive:  'bg-gray-100 text-gray-700',
  graduated: 'bg-purple-100 text-purple-800',
  present:   'bg-green-100 text-green-800',
  absent:    'bg-red-100 text-red-800',
  late:      'bg-yellow-100 text-yellow-800',
  excused:   'bg-blue-100 text-blue-800',
  pending:   'bg-yellow-100 text-yellow-800',
  partial:   'bg-orange-100 text-orange-800',
  paid:      'bg-green-100 text-green-800',
  waived:    'bg-gray-100 text-gray-700',
  default:   'bg-gray-100 text-gray-700',
};

export default function Badge({ label, variant }) {
  const cls = variants[variant] || variants[label?.toLowerCase()] || variants.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
