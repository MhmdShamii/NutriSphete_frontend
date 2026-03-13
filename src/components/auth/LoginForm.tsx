import Input from "../ui/Input"
import Button from "../ui/Button"
import PasswordInput from "../ui/PasswordInput"

type LoginFormProps = {
    onSwitchToSignup: () => void
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
    return (
        <form className="w-1/2 flex flex-col p-8 gap-7 ">

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
                <p className="text-sm text-text-muted">
                    Your meals, progress and insights are waiting
                </p>
            </div>


            <div className="flex flex-col gap-7 flex-1 justify-center">

                <Input id="email" label="Email" type="email" placeholder="Enter your email" />
                <div className="flex flex-col gap-1">

                    <PasswordInput
                        id="password"
                        label="Password"
                        placeholder="********"
                    />
                    <span className="text-sm w-full text-right text-text-muted hover:text-primary cursor-pointer ">Forgot password ?</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 justify-end">

                <Button type="submit">Login</Button>

                <p className="text-sm text-text-muted w-full text-center">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-primary font-medium hover:underline transition-colors"
                    >
                        Sign up
                    </button>
                </p>
            </div>

        </form>
    )
}

export default LoginForm