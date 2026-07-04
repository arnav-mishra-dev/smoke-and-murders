'use client'
import HomeMenu from './_components/HomeMenu';
import Board from './_components/Board';
import { ConnectionContext } from '@/lib/context';
import { Page } from '@/lib/types';
import { useState } from 'react';

export default function GamePages()
{
    const [currentPage, SwitchPage] = useState<Page>(Page.Home);
    const [username, SetUsername] = useState<string>("");
    const [roomCode, SetRoomCode] = useState<string>("");

    const contextValue = {
        username,
        roomCode,
        SetRoomCode,
        SwitchPage,
        SetUsername
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