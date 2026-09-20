export type Correction={original:string;corrected:string;explanation:string}|null;
export type TutorResponse={reply:string;correction:Correction};
export type ChatMessage={id:string;role:'user'|'assistant';text:string;correction?:Correction};
