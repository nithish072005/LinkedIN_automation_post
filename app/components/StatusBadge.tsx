type StatusBadgeProps = {
    status: 'published' | 'validated' | 'draft' | 'error' | 'warning';
    label: string;
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
    return (
        <span className={`badge badge-${status}`}>
            <span className="badge-dot" />
            {label}
        </span>
    );
}
