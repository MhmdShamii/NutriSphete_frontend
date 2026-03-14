import CountryDropdown from "../ui/CountryDropdown"
import PhoneInput from "../ui/PhoneInput"

type Country = {
    name: string
    "alpha-3": string
    phone_code: string
}

type formDataType = {
    country_code: string
    phone: string
    accept_terms: boolean
    accept_privacy: boolean
}

type SignUpStepThreeProps = {
    formData: formDataType
    handleChange: (field: keyof formDataType, value: string | boolean) => void
    country: Country | null
    setCountry: (c: Country) => void
    phoneCountry: Country | null
    setPhoneCountry: (c: Country) => void
}


export default function SignUpStepThree({ formData, handleChange, country, setCountry, phoneCountry, setPhoneCountry }: SignUpStepThreeProps) {

    return <>
        <div className="flex flex-col gap-2">
            <label className="text-sm text-text-muted">
                Country
            </label>

            <CountryDropdown
                show="name"
                selected={country}
                onSelect={(c) => {
                    setCountry(c)
                    handleChange("country_code", c["alpha-3"])

                    if (!phoneCountry) {
                        setPhoneCountry(c)
                    }
                }}
            />
        </div>

        <PhoneInput
            phone={formData.phone}
            country={phoneCountry}
            onPhoneChange={(v) => handleChange("phone", v)}
            onCountryChange={(c) => setPhoneCountry(c)}
        />

        {/* TERMS */}

        <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
            <input
                type="checkbox"
                checked={formData.accept_terms}
                onChange={(e) => handleChange("accept_terms", e.target.checked)}
                className="w-4 h-4 accent-primary"
            />
            I agree to the
            <span className="text-white font-bold"> Terms of Service </span>
        </label>

        <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
            <input
                type="checkbox"
                checked={formData.accept_privacy}
                onChange={(e) => handleChange("accept_privacy", e.target.checked)}
                className="w-4 h-4 accent-primary"
            />
            I agree to the
            <span className="text-white font-bold"> Privacy Policy </span>
        </label>
    </>
}