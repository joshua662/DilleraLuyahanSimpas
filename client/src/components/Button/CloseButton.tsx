import type { FC } from "react";

interface CloseButtonProps {
    label: string
    onClose: () => void
    newClassName?: string;
    className?: string
}

const CloseButton: FC<CloseButtonProps> = ({ label, onClose, newClassName, className }) => {
    return (
        <>
            <button
                type="button"
                className={
                    newClassName
                        ? newClassName
                        : `px-4 py-3 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 hover:text-gray-700 dark:text-slate-200 dark:hover:text-slate-100 text-sm font-medium cursor-pointer rounded-lg shadow-lg ${className}`
                }
                onClick={onClose}
            >
                {label}
            </button>
        </>
    )
}

export default CloseButton