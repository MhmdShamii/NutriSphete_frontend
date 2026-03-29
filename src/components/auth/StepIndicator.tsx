export default function StepIndicator({ step }: { step: number }) {
    return <div className="flex gap-2 mb-2">
        {[1, 2].map(s => (
            <div
                key={s}
                className={`h-1 flex-1 rounded ${step >= s ? "bg-primary" : "bg-border/30"}`}
            />
        ))}
    </div>
}
