import { SearchX } from 'lucide-react';

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  description,
  action,
  icon: Icon = SearchX,
}) {
  const body = message || description;
  const actionNode =
    action ||
    (actionLabel && onAction ? (
      <button type="button" onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    ) : null);

  return (
    <div className="card-base text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {body ? <p className="mt-3 text-sm leading-6 text-gray-600">{body}</p> : null}
      {actionNode ? <div className="mt-6">{actionNode}</div> : null}
    </div>
  );
}
