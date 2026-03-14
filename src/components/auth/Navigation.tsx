import Button from "../ui/Button"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"

type NavigationProps = {
    step: number
    nextStep: () => void
    prevStep: () => void
    step1Valid: boolean
    step2Valid: boolean
    step3Valid: boolean
    isCheckingEmail: boolean
}

export default function Navigation({ step, nextStep, prevStep, step1Valid, step2Valid, step3Valid, isCheckingEmail }: NavigationProps) {
    return <div className="flex w-full gap-4">

        {step > 1 && (
            <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center gap-2 flex-1 border border-border/30 text-text-muted rounded-lg p-3 hover:border-white/50"
            >
                <ArrowLeftIcon sx={{ fontSize: 20 }} />
                Back
            </button>
        )}

        {step < 3 ? (
            <Button
                type="button"
                className="flex items-center justify-center gap-2 flex-1"
                onClick={nextStep}
                disabled={
                    step === 1
                        ? !step1Valid || isCheckingEmail
                        : step === 2
                            ? !step2Valid
                            : false
                }
            >
                {isCheckingEmail ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                    <>
                        Proceed
                        <ArrowRightIcon sx={{ fontSize: 20 }} />
                    </>
                )}
            </Button>
        ) : (
            <Button
                type="submit"
                className="flex items-center justify-center gap-2 flex-1"
                disabled={!step3Valid}
            >
                Sign Up
            </Button>
        )}

    </div>
}