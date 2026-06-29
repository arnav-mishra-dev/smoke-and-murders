import { createContext, RefObject } from "react";
import { Page, PlayerData } from "./types";

export interface ConnectionContextType
{
    username: string,
    connection: RefObject<WebSocket | null>,
    roomCode: string,
    SetRoomCode: (val: string) => void,
    SwitchPage: (page: Page) => void,
    SetUsername: (username: string) => void,
}

export const ConnectionContext = createContext<ConnectionContextType | null>(null);