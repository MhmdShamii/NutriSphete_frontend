import CountryDropdown, { type Country } from "./CountryDropdown"
import Input from "./Input"
import countriesData from "../../assets/data/countries.json"

const countries = countriesData as Country[]

type PhoneInputProps = {
    phone: string
    country: Country | null
    onPhoneChange: (v: string) => void
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
                        countries={countries}
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