import Button from "../ui/Button"
import Input from "../ui/Input"

type SignupFormProps = {
    onSwitchToLogin: () => void
}

function SignupForm({ onSwitchToLogin }: SignupFormProps) {
    return (
        <form className="w-1/2 flex flex-col p-8 gap-7 justify-center">

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">Create Account</h1>
                <p className="text-sm text-text-muted">
                    Join us and start your nutrition journey today
                </p>
            </div>

            <Input id="email" label="Email" type="email" placeholder="Enter your email" />
            <Input id="password" label="Password" type="password" placeholder="********" />
            <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="********" />

            <Button type="submit">Sign Up</Button>

            <p className="text-sm text-text-muted w-full text-center">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary font-medium hover:underline transition-colors"
                >
                    Log in
                </button>
            </p>

        </form>
    )
}