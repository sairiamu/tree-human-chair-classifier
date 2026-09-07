interface Props {
  confidence: number;
  uncertain: boolean;
  ood: boolean;
}

export default function ConfidenceBadge({ confidence, uncertain, ood }: Props) {
  const pct = Math.round(confidence * 100);

  if (ood) {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
        Out of distribution
      </span>
    );
  }

  if (uncertain) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
        Uncertain · {pct}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
      Confident · {pct}%
    </span>
  );
}

