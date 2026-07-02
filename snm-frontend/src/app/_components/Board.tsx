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
    width: 35rem;
    height: 35rem;
    background: green;
    border-radius: 50%;
`

export const HandContainer = styled.div`
    position: absolute;
    display: flex;
    justify-content: flex-end;
    width: 100%;
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
        rotate-90
        relative pt-2
        w-35 h-40">
            <Image
            className="
            absolute
            left-0 right-0
            ml-auto mr-auto
            w-25 h-35
            -translate-x-1.5 rotate-6"
            src="/cards/card_back.svg"
            width={0} height={0}
            alt="Face down card" />
            <Image
            className="
            absolute
            left-0 right-0
            ml-auto mr-auto
            w-25 h-35
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
        <HandContainer
        className="pr-4"
        style={{rotate: `${rotation}deg`}}>
            <CardHand />
            <span
            className="fixed p-2 rounded-xl translate-x-15 text-2xl font-bold bg-gray-900/80"
            style={{rotate: `${-rotation}deg`}}>
                {name}
            </span>
        </HandContainer>
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
        <>
            <Table className="absolute mt-15 my-0 mx-auto">
                {items}
            </Table>
            
            {
            gameStarted
            ?
                <div className="flex flex-row justify-center w-dvw mt-10">
                    <div className="relative flex justify-center w-70 h-70 bg-amber-600">
                        <Image
                        className="absolute w-50 h-70 -rotate-10 -translate-x-15"
                        src={`/cards/ace_spades.svg`}
                        width={0} height={0}
                        alt="First hand card" />

                        <Image
                        className="absolute w-50 h-70 rotate-10 translate-x-15"
                        src={`/cards/ace_spades.svg`}
                        width={0} height={0}
                        alt="Second hand card" />
                    </div>
                </div>
            :
                <div className="flex flex-col mt-15 w-dvw items-center gap-15">
                    <div className="text-5xl">Room code: <span className="leading-none p-3 rounded-xl bg-black/10">{context.roomCode}</span></div>
                    {
                    selfUID === hostUID
                    ? <Button onClick={() => SetGameStarted(true)}>Start Game</Button>
                    : <span>Waiting for host to start the game...</span>
                    }
                </div>
            }
        </>
    );
}