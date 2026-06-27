import { createContext, RefObject } from "react";
import { Page, PlayerData } from "./types";

export interface ConnectionContextType
{
    username: string,
    connection: RefObject<WebSocket | null>,
    players: PlayerData,
    roomCode: string,
    SetRoomCode: (val: string) => void,
    SwitchPage: (page: Page) => void,
    SetUsername: (username: string) => void,
    SetPlayersValue: (players: PlayerData) => void
}

export const ConnectionContext = createContext<ConnectionContextType | null>(null);