import AuthCover from "./AuthCover"

export default function AuthPage() {
    return (
        <div className="bg-background text-text h-screen flex items-center justify-center relative overflow-hidden">

            <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/25 blur-[200px] rounded-full animate-energy"></div>
            <div className="absolute bottom-[-250px] left-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>
            <div className="absolute bottom-[-250px] right-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>

            <div className="backdrop-blur-xl p-4 rounded-4xl shadow-xl w-full max-w-[900px] h-[600px] flex gap-4 overflow-hidden relative z-10" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/15"></div>

                <AuthCover />

                <div className="w-1/2 flex flex-col p-8 justify-center">
                    <h1 className="text-2xl font-bold">Welcome to NutriSphere</h1>
                </div>

            </div>
        </div>
    )
}
