interface Props {
  message: string;
  details?: { field: string; message: string }[];
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, details, onDismiss }: Props) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-red-800 text-sm font-medium">{message}</p>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-500 hover:text-red-700 flex-shrink-0 text-lg leading-none">&times;</button>
        )}
      </div>
      {details && details.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-1">
          {details.map((d, i) => (
            <li key={i} className="text-red-700 text-xs">{d.field ? `${d.field}: ` : ''}{d.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
