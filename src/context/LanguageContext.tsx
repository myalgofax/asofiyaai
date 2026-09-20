import React, { createContext, useContext, useState } from 'react'; import { LANGUAGES, Language } from '@/constants/languages';
const C = createContext<{ language: Language; setLanguage: (x: Language) => void } | null>(null);
export function LanguageProvider({ children }: { children: React.ReactNode }) { const [language, setLanguage] = useState<Language>(LANGUAGES.find(x => x.code === 'en') ?? LANGUAGES[0]); return <C.Provider value={{ language, setLanguage }}>{children}</C.Provider> }
export function useLanguage() { const v = useContext(C); if (!v) throw new Error('LanguageProvider missing'); return v }
