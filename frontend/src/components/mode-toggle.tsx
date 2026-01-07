import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    if (theme === "system") {
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setResolvedTheme(systemIsDark ? "dark" : "light")
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(systemIsDark ? "light" : "dark")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-[40px] w-[40px] md:h-[48px] md:w-auto md:px-4 rounded-full transition-all duration-300 ease-in-out hover:bg-muted"
      onClick={toggleTheme}
    >
      <div className="relative h-[1.2rem] w-[1.2rem]">
        <Sun className="absolute h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 duration-300 ease-in-out" />
        <Moon className="absolute h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 duration-300 ease-in-out" />
      </div>
      <span className="hidden md:inline-block ml-2 font-medium">
        {resolvedTheme === "dark" ? "Dark" : "Light"}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
