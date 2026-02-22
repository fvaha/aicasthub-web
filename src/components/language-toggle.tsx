"use client"

import * as React from "react"
import { DropdownMenu, IconButton } from "@medusajs/ui"
import { Globe } from "@medusajs/icons"
import { useTranslation } from "../providers/i18n-provider"

export function LanguageToggle() {
    const { lang, setLang } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger asChild>
                <IconButton variant="transparent">
                    <Globe />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => setLang("EN")} className={lang === "EN" ? "font-bold" : ""}>
                    English
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => setLang("SR")} className={lang === "SR" ? "font-bold" : ""}>
                    Srpski
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => setLang("DE")} className={lang === "DE" ? "font-bold" : ""}>
                    Deutsch
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    )
}
