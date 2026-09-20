import * as Speech from 'expo-speech';
import {VoiceSettings} from '@/context/VoiceContext';

export function stopSpeaking(){return Speech.stop();}
export function speak(text:string,language:string,settings:VoiceSettings,voiceId?:string,callbacks?:{onDone?:()=>void;onError?:()=>void}){
 Speech.stop();
 Speech.speak(text,{language,voice:voiceId,rate:settings.rate,pitch:settings.pitch,volume:1,useApplicationAudioSession:false,onDone:callbacks?.onDone,onStopped:callbacks?.onDone,onError:callbacks?.onError});
}
