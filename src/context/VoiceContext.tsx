import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import * as Speech from 'expo-speech';
import {Language} from '@/constants/languages';

export type VoiceGender='auto'|'female'|'male';
export type VoiceSettings={gender:VoiceGender;rate:number;pitch:number;voiceId?:string};
type Ctx={settings:VoiceSettings;setSettings:React.Dispatch<React.SetStateAction<VoiceSettings>>;voices:Speech.Voice[];refreshVoices:()=>Promise<void>;resolveVoice:(language:Language)=>Speech.Voice|undefined};
const VoiceContext=createContext<Ctx|null>(null);

export function VoiceProvider({children}:{children:React.ReactNode}){
 const [settings,setSettings]=useState<VoiceSettings>({gender:'auto',rate:0.9,pitch:1});
 const [voices,setVoices]=useState<Speech.Voice[]>([]);
 const refreshVoices=async()=>{try{setVoices(await Speech.getAvailableVoicesAsync())}catch{setVoices([])}};
 useEffect(()=>{refreshVoices()},[]);
 const resolveVoice=(language:Language)=>{
   const matches=voices.filter(v=>v.language.toLowerCase().startsWith(language.code.toLowerCase()));
   if(settings.voiceId){const exact=matches.find(v=>v.identifier===settings.voiceId);if(exact)return exact;}
   // OS voice metadata does not reliably expose gender. Prefer enhanced quality, then locale match.
   return [...matches].sort((a,b)=>Number(b.quality==='Enhanced')-Number(a.quality==='Enhanced'))[0];
 };
 const value=useMemo(()=>({settings,setSettings,voices,refreshVoices,resolveVoice}),[settings,voices]);
 return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
export function useVoice(){const v=useContext(VoiceContext);if(!v)throw new Error('useVoice must be used inside VoiceProvider');return v}
