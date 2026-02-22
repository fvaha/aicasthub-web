"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import EN from '../dictionaries/EN.json';
import SR from '../dictionaries/SR.json';
import DE from '../dictionaries/DE.json';

type LanguageDict = typeof EN;

interface I18nContextProps {
    lang: string;
    setLang: (lang: string) => void;
    t: (key: string) => string;
}

const dictionaries: Record<string, any> = { EN, SR, DE };

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState('EN');

    // Try to load language from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('i18n-lang');
        if (saved && dictionaries[saved]) {
            setLangState(saved);
        }
    }, []);

    const setLang = (l: string) => {
        setLangState(l);
        localStorage.setItem('i18n-lang', l);
    };

    // Simple nested key parser (e.g. "nav.dashboard" -> value)
    const t = (key: string): string => {
        const keys = key.split('.');
        let dict = dictionaries[lang];
        for (const k of keys) {
            if (dict && dict[k] !== undefined) {
                dict = dict[k];
            } else {
                return key; // return key if not found
            }
        }
        return dict as any;
    };

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
