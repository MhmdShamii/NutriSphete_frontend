import GoogleIcon from '@mui/icons-material/Google';

type SocialButtonProps = {
    label: string
    onClick?: () => void
}

export default function SocialButton({ label, onClick }: SocialButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center justify-center gap-2 border border-border/40 text-text rounded-lg py-3 px-4 hover:bg-surface hover:border-primary/60 cursor-pointer transition-colors"
            onClick={onClick}
        >
            <GoogleIcon fontSize="small" />
            {label}
        </button>
    )
}
