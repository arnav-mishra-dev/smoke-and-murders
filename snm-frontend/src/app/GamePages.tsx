'use client'
import { useRef, useState } from 'react';
import { ConnectionContext } from '@/lib/context';
import { Page } from '@/lib/types';
import HomeMenu from './_components/HomeMenu';
import Board from './_components/Board';

export default function GamePages()
{
    const connection = useRef<WebSocket | null>(null);
    const [currentPage, SwitchPage] = useState(Page.Home);
    const [username, SetUsername] = useState("");

    const contextValue = {
        username,
        connection,
        players: [],
        SwitchPage,
        SetUsername,
    };

    function getPage(page: Page)
    {
        switch(page)
        {
            case Page.Home:
                return <HomeMenu />;
            case Page.Game:
                return <Board playerData={contextValue.players} />;
        }
    }

    return (
        <ConnectionContext value={contextValue}>
            {getPage(currentPage)}
        </ConnectionContext>
    );
}