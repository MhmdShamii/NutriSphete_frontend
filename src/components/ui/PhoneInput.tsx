import CountryDropdown from "./CountryDropdown"
import Input from "./Input"

type Country = {
    name: string
    "alpha-3": string
    phone_code: string
}

type PhoneInputProps = {
    phone: string
    country: Country | null
    onPhoneChange: (phone: string) => void
    onCountryChange: (country: Country) => void
}

export default function PhoneInput({
    phone,
    country,
    onPhoneChange,
    onCountryChange
}: PhoneInputProps) {

    return (
        <div className="flex flex-col gap-2">

            <label className="text-sm text-text-muted">
                Phone Number
            </label>

            <div className="flex items-stretch gap-3">

                <div className="w-32">
                    <CountryDropdown
                        show="code"
                        selected={country}
                        onSelect={onCountryChange}
                    />
                </div>

                <div className="flex-1">
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="76 123 456"
                        value={phone}
                        onChange={onPhoneChange}
                        label=""
                        className="h-11"
                    />
                </div>

            </div>

        </div>
    )
}