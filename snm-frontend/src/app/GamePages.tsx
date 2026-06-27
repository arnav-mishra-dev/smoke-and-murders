'use client'
import HomeMenu from './_components/HomeMenu';
import Board from './_components/Board';
import { ConnectionContext } from '@/lib/context';
import { Page } from '@/lib/types';
import { useRef, useState } from 'react';

export default function GamePages()
{
    const connection = useRef<WebSocket | null>(null);
    const [currentPage, SwitchPage] = useState(Page.Home);
    const [username, SetUsername] = useState("");
    const [players, SetPlayersValue] = useState({});
    const [roomCode, SetRoomCode] = useState("");

    const contextValue = {
        username,
        connection,
        players,
        roomCode,
        SetRoomCode,
        SwitchPage,
        SetUsername,
        SetPlayersValue
    };

    function getPage(page: Page)
    {
        switch(page)
        {
            case Page.Home:
                return <HomeMenu />;
            case Page.Game:
                return <Board />;
        }
    }

    return (
        <ConnectionContext value={contextValue}>
            {getPage(currentPage)}
        </ConnectionContext>
    );
}