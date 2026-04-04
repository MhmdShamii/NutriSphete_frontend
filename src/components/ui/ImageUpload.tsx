import UploadIcon from "@mui/icons-material/Upload"

type ImageUploadProps = {
    label?: string
    value?: string | null
    onChange?: (file: File | null) => void
    className?: string
    boxClassName?: string
    previewClassName?: string
}

function ImageUpload({
    label = "Upload Image",
    value = null,
    onChange,
    className = "",
    boxClassName = "",
    previewClassName = ""
}: ImageUploadProps) {

    function handleFile(file: File | null) {
        if (!file) return
        if (onChange) onChange(file)
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>

            {label && (
                <label className="text-sm text-text-muted">
                    {label}
                </label>
            )}

            <label
                className={`
          flex flex-col items-center justify-center
          h-16
          border-2 border-dashed border-border/40
          rounded-lg
          cursor-pointer
          bg-surface/20
          hover:border-primary
          transition-all
          ${boxClassName}
        `}
            >

                {value ? (
                    <img
                        src={value}
                        alt="preview"
                        className={`object-cover ${previewClassName}`}
                    />
                ) : (
                    <div className="flex items-center gap-1">
                        <UploadIcon className="text-primary" />

                        <p className="text-xs text-text-muted">
                            <span className="text-primary font-medium">
                                Upload
                            </span>
                        </p>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                />

            </label>

        </div>
    )
}

export default ImageUpload