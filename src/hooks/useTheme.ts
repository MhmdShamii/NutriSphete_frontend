import { useState } from "react"

export function useTheme() {
    const [isDark, setIsDark] = useState(
        () => document.documentElement.classList.contains("dark")
    )

    function setTheme(dark: boolean) {
        setIsDark(dark)
        document.documentElement.classList.toggle("dark", dark)
        localStorage.setItem("theme", dark ? "dark" : "light")
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.setAttribute("content", dark ? "#0A0B0A" : "#e6e6e6")
    }

    return { isDark, setTheme }
}
