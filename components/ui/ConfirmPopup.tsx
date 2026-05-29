"use client";

type ConfirmPopupProps = {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmPopup({
    isOpen,
    title,
    description,
    confirmLabel = "Tiếp tục",
    cancelLabel = "Ở lại",
    onConfirm,
    onCancel,
}: ConfirmPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                    Confirm
                </p>

                <h2 className="mt-3 text-2xl font-bold">{title}</h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                    {description}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}