type LoadingSpinnerProps = {
    size?: 'sm' | 'md';
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
    return <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />;
}

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="skeleton skeleton-line w-25" />
                <div className="skeleton skeleton-line w-25" />
            </div>
            <div className="skeleton skeleton-block" />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="skeleton skeleton-line w-25" style={{ marginBottom: 0 }} />
            </div>
        </div>
    );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
    return (
        <div className="posts-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
