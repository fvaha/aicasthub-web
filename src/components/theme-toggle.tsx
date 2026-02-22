"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IconButton } from "@medusajs/ui"
import { Moon, Sun } from "@medusajs/icons"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <IconButton variant="transparent">
                <div className="h-[15px] w-[15px]" />
            </IconButton>
        )
    }

    return (
        <IconButton
            variant="transparent"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </IconButton>
    )
}
