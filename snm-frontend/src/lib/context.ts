import { createContext } from "react";
import { Page } from "./types";

export interface ConnectionContextType
{
    username: string,
    roomCode: string,
    SetRoomCode: (val: string) => void,
    SwitchPage: (page: Page) => void,
    SetUsername: (username: string) => void,
}

export const ConnectionContext = createContext<ConnectionContextType | null>(null);