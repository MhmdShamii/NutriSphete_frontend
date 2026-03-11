import Input from "../ui/Input"
import Button from "../ui/Button"
import GoogleIcon from "@mui/icons-material/Google"
import FacebookIcon from "@mui/icons-material/Facebook"
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

            <Input id="email" label="Email" type="email" placeholder="Enter your email" />
            <PasswordInput
                id="password"
                label="Password"
                placeholder="********"
            />

            <Button type="submit">Login</Button>

            <div className="flex items-center gap-3 text-text-muted text-xs">
                <div className="flex-1 h-px bg-border/30"></div>
                <span>OR</span>
                <div className="flex-1 h-px bg-border/30"></div>
            </div>

            <div className="flex gap-3">

                <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 border border-border/30 p-3 rounded-lg transition-all duration-200 hover:bg-surface hover:shadow-md active:scale-[0.98]"
                >
                    <GoogleIcon sx={{ fontSize: 20 }} />
                    Google
                </button>

                <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 border border-border/30 p-3 rounded-lg transition-all duration-200 hover:bg-surface hover:shadow-md active:scale-[0.98]"
                >
                    <FacebookIcon sx={{ fontSize: 20 }} />
                    Facebook
                </button>

            </div>

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

        </form>
    )
}

export default LoginForm