import ImageUpload from "../ui/ImageUpload";
import Input from "../ui/Input";

type formDataType = {
    first_name: string
    last_name: string
}

type SignUpStepTwoProps = {
    formData: formDataType
    handleChange: (field: keyof formDataType, value: string | File | null) => void
    imagePreview: string | null
    handleImageUpload: (file: File | null) => void
}

export default function SignUpStepTwo({ formData, handleChange, imagePreview, handleImageUpload }: SignUpStepTwoProps) {

    return <>
        <ImageUpload
            label="Profile Picture (Optional)"
            value={imagePreview}
            boxClassName="h-16"
            previewClassName="h-10 w-10 rounded-full"
            onChange={handleImageUpload}
        />

        <Input
            id="firstName"
            label="First Name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={(v) => handleChange("first_name", v)}
        />

        <Input
            id="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={(v) => handleChange("last_name", v)}
        />
    </>
}