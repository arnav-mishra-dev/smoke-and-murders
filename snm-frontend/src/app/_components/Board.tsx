'use client'
import styled from "styled-components";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import { ConnectionContext } from "@/lib/context";
import { Page, PlayerData } from "@/lib/types";
import Button from "./Button";

export const Table = styled.div`
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: 5rem;
    background: green;
    border-radius: 50%;
    width: 30rem;
    height: 30rem;
    aspect-ratio: 1/1;
`

export const Hand = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10rem;
    height: 8rem;
    background-color: white;
`

export function CardHand()
{
    return(
        <div
        className="
        relative
        flex items-center justify-center
        rotate-90
        w-30 h-30">
            <Image
            className="
            absolute
            w-20 h-28
            -translate-x-1.5 rotate-6"
            src="/cards/card_back.svg"
            width={0} height={0}
            alt="Face down card" />
            <Image
            className="
            absolute
            w-20 h-28
            translate-x-1.5 -rotate-6"
            src="/cards/card_back.svg"
            width={0} height={0}
            alt="Face down card" />
        </div>
    );
}

export function HandShaft({ rotation, name } : {rotation: number, name: string})
{
    return(
        <div
        className="absolute flex justify-end w-full"
        style={{rotate: `${rotation}deg`}}>
            <CardHand />
            <span
            className="fixed p-2 rounded-xl translate-x-15 text-2xl font-bold bg-gray-900/80"
            style={{rotate: `${-rotation}deg`}}>
                {name}
            </span>
        </div>
    );
}

export default function Board()
{
    const context = use(ConnectionContext);
    if (!context) return;

    const [selfUID, SetUID] = useState<string>("");
    const [hostUID, SetHostUID] = useState<string>("");
    const [players, SetPlayersValue] = useState<PlayerData>({});
    const [gameStarted, SetGameStarted] = useState<boolean>(false);

    useEffect(() => {
        const ws = context.roomCode
        ? new WebSocket(`ws://localhost:5000/api/ws?username=${context.username}&room=${context.roomCode}`)
        : new WebSocket(`ws://localhost:5000/api/ws?username=${context.username}`);

        context.connection.current = ws;
        console.log(`Connected to room ${context.connection.current.url}`);

        ws.onmessage = (ev: MessageEvent) => {
            const parsedData = JSON.parse(ev.data);
            console.log(parsedData);
            switch(parsedData.Type)
            {
                case "room-code":
                    context.SetRoomCode(parsedData.Payload);
                    break;
                case "player-list":
                    SetPlayersValue(parsedData.Payload);
                    const playerUID: string | undefined = Object.keys(parsedData.Payload).find((key) => parsedData.Payload[key] === context.username);
                    SetUID(playerUID? playerUID : "");
                    break;
                case "new-host":
                    SetHostUID(parsedData.Payload);
                    break;
            }
        };

        ws.onclose = () => {
            console.log("Connection closed");
            context.connection.current = null;
            context.SetRoomCode("");
            context.SwitchPage(Page.Home)
        };

        ws.onerror = () => {
            console.error("Connection lost");
            context.connection.current = null;
            context.SetRoomCode("");
            context.SwitchPage(Page.Home);
        };

        return () => {
            ws.onclose = null;
            ws.onerror = null;
            ws?.close();
        }
    }, []);

    const angleOffset: number = (320/Object.keys(players).length);
    const items: React.JSX.Element[] = Object.values(players).map((name, index) => {
        return <HandShaft key={index} name={name} rotation={(angleOffset/2)+110+index*angleOffset} />;
    });

    return(
        <div className="fixed flex flex-col justify-center items-center w-dvw h-dvh gap-5">
            { gameStarted
            ?
            <span className="text-6xl p-5">00:00</span>
            : null}
            <Table>
                {items}
            </Table>
            
            { gameStarted
            ?
                <div className="relative flex justify-center items-center w-70 h-75">
                    <Image
                    className="absolute w-40 h-56 -rotate-10 -translate-x-10"
                    src={`/cards/ace_spades.svg`}
                    width={0} height={0}
                    alt="First hand card" />

                    <Image
                    className="absolute w-40 h-56 rotate-10 translate-x-10"
                    src={`/cards/ace_spades.svg`}
                    width={0} height={0}
                    alt="Second hand card" />
                </div>
            :
                <div className="flex flex-col w-dvw items-center gap-15">
                    <div className="text-5xl">Room code: <span className="leading-none p-3 rounded-xl bg-black/10">{context.roomCode}</span></div>
                    {
                    selfUID === hostUID
                    ? <Button onClick={() => SetGameStarted(true)}>Start Game</Button>
                    : <span>Waiting for host to start the game...</span>
                    }
                </div> }
        </div>
    );
}