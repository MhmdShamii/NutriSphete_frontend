import { useState } from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"

type PasswordInputProps = {
    id: string
    label: string
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
}

function PasswordInput({ id, label, placeholder, value, onChange }: PasswordInputProps) {

    const [show, setShow] = useState(false)

    return (
        <div className="flex flex-col gap-2">

            <label htmlFor={id} className="text-sm text-text-muted">
                {label}
            </label>

            <div className="relative">

                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    className="bg-surface border border-border/30 rounded-lg p-3 pr-10 outline-none w-full transition-all duration-300
                    focus:border-primary/60
                    focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                >
                    {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </button>

            </div>

        </div>
    )
}

export default PasswordInput