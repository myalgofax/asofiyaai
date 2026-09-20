import { TutorResponse } from '@/types/chat';

type ChatHistory = { role: string; text: string }[];
type PendingRequest = { resolve: (value: TutorResponse) => void; reject: (error: Error) => void };

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
let socket: WebSocket | null = null;
let connection: Promise<WebSocket> | null = null;
const pending = new Map<string, PendingRequest>();

function resolvedBase(): URL {
    if (!BASE) throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured');
    const configured = new URL(BASE);
    const isBrowser = typeof window !== 'undefined';
    const isLocalhost = configured.hostname === 'localhost' || configured.hostname === '127.0.0.1';
    if (isBrowser && isLocalhost) {
        configured.hostname = window.location.hostname;
        configured.protocol = window.location.protocol;
    }
    return configured;
}

function socketUrl() {
    const u = resolvedBase();
    const socketProtocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${socketProtocol}//${u.host}/ws`;
}

function apiUrl() {
    const u = resolvedBase();
    return `${u.protocol}//${u.host}`;
}

function getSocket(): Promise<WebSocket> {
    if (socket?.readyState === WebSocket.OPEN) return Promise.resolve(socket);
    if (connection) return connection;

    connection = new Promise((resolve, reject) => {
        const next = new WebSocket(socketUrl());
        socket = next;
        next.onopen = () => {
            connection = null;
            resolve(next);
        };
        next.onmessage = (event) => {
            const response = JSON.parse(String(event.data)) as { id: string; result?: TutorResponse; error?: string };
            const request = pending.get(response.id);
            if (!request) return;
            pending.delete(response.id);
            if (response.error) request.reject(new Error(response.error));
            else if (response.result) request.resolve(response.result);
            else request.reject(new Error('Invalid tutor response'));
        };
        next.onerror = () => {
            socket = null;
            connection = null;
            reject(new Error('Tutor WebSocket connection failed'));
        };
        next.onclose = () => {
            socket = null;
            connection = null;
            for (const request of pending.values()) request.reject(new Error('Tutor WebSocket connection closed'));
            pending.clear();
        };
    });

    return connection;
}

export async function sendTutorMessage(message: string, targetLanguage: string, history: ChatHistory): Promise<TutorResponse> {
    try {
        const client = await getSocket();
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return await new Promise((resolve, reject) => {
            pending.set(id, { resolve, reject });
            client.send(JSON.stringify({ id, message, targetLanguage, history }));
        });
    } catch (socketError) {
        const response = await fetch(`${apiUrl()}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, targetLanguage, history })
        });
        if (!response.ok) throw socketError;
        return response.json() as Promise<TutorResponse>;
    }
}
