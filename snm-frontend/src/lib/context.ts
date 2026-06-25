import { createContext, RefObject } from "react";
import { Page, PlayerData } from "./types";

interface ConnectionContextType
{
    username: string,
    connection: RefObject<WebSocket | null>,
    players: PlayerData[],
    SwitchPage: (page: Page) => void,
    SetUsername: (username: string) => void
}

export const ConnectionContext = createContext<ConnectionContextType | null>(null);