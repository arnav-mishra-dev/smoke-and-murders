'use client'
import styled from "styled-components";
import Image from "next/image";
import React, { use, useEffect, useEffectEvent, useRef, useState } from "react";
import { ConnectionContext } from "@/lib/context";
import { Card, CardSuit, CardValue, Page, PlayerData } from "@/lib/types";
import Button from "./Button";
import PopupMenu from "./PopupMenu";
import InputField from "./InputField";

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

export function OtherPlayerHand()
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

export function SelfHand({cards} : {cards: Card[]})
{
    if (cards.length === 0) return null;

    const nameGetter: (card: Card) => string = (card: Card) => `${CardValue[card.Value]}_${CardSuit[card.Suit]}`.toLowerCase();
    const pathFirst: string = `/cards/${nameGetter(cards[0])}.svg`;
    const pathSecond: string = `/cards/${nameGetter(cards[1])}.svg`;

    return(
        <div className="relative flex flex-col justify-center items-center w-60 h-60 aspect-square">
            <Image
            className="absolute w-40 h-56 -rotate-10 -translate-x-10"
            src={pathFirst}
            width={0} height={0}
            alt="First hand card" />

            <Image
            className="absolute w-40 h-56 rotate-10 translate-x-10"
            src={pathSecond}
            width={0} height={0}
            alt="Second hand card" />
        </div>
    );
}

export function HandShaft({ rotation, name } : {rotation: number, name: string})
{
    return(
        <div
        className="absolute flex justify-end w-full"
        style={{rotate: `${rotation}deg`}}>
            <OtherPlayerHand />
            <span
            className="fixed p-2 rounded-xl translate-x-15 text-2xl font-bold bg-gray-900/80"
            style={{rotate: `${-rotation}deg`}}>
                {name}
            </span>
        </div>
    );
}

interface GameSettings
{
    MafiaCount: number,
    TurnPlayTime: number,
    VoteTime: number
}

export default function Board()
{
    const context = use(ConnectionContext);
    const { roomCode, username, SetRoomCode, SwitchPage } = context || {};

    const [selfUID, SetUID] = useState<string>("");
    const [hostUID, SetHostUID] = useState<string>("");
    const [players, SetPlayersValue] = useState<PlayerData>({});
    const [gameStarted, SetGameStarted] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);

    const [communityCards, SetCommunityCards] = useState<Card[]>([]);
    const [playerHand, SetPlayerHand] = useState<Card[]>([]);

    const [settingsVisible, SetSettingsVisible] = useState<boolean>(false);
    const [MafiaCount, SetMafiaCount] = useState<number>(1);
    const [TurnPlayTime, SetTurnPlayTime] = useState<number>(30);
    const [VoteTime, SetVoteTime] = useState<number>(60);

    const firstConnection = useEffectEvent(() => {
        if (!SetRoomCode || !SwitchPage) return;

        console.log("Connecting...");
        const ws = roomCode
        ? new WebSocket(`ws://localhost:5000/api/ws?username=${username}&room=${roomCode}`)
        : new WebSocket(`ws://localhost:5000/api/ws?username=${username}`);

        wsRef.current = ws;
        console.log(`Connected to room ${wsRef.current.url}`);

        ws.onmessage = (ev: MessageEvent) => {
            const parsedData = JSON.parse(ev.data);
            console.log(parsedData);
            switch(parsedData.Type)
            {
                case "room-code":
                    SetRoomCode(parsedData.Payload);
                    break;
                case "player-list":
                    SetPlayersValue(parsedData.Payload);
                    const playerUID: string | undefined = Object.keys(parsedData.Payload).find((key) => parsedData.Payload[key] === username);
                    SetUID(playerUID? playerUID : "");
                    break;
                case "new-host":
                    SetHostUID(parsedData.Payload);
                    break;
                case "start-game":
                    SetGameStarted(true);
                    break;
                case "card-hand":
                    SetPlayerHand(parsedData.Payload);
                    console.log(parsedData.Payload)
                    break;
                case "community-cards":
                    SetCommunityCards(parsedData.Payload);
                    break;
            }
        };

        ws.onclose = () => {
            console.log("Connection closed");
            wsRef.current = null;
            SetRoomCode("");
            SwitchPage(Page.Home)
        };

        ws.onerror = () => {
            console.error("Connection lost");
            wsRef.current = null;
            SetRoomCode("");
            SwitchPage(Page.Home);
        };
    })

    useEffect(() => {
        firstConnection();
        return () => {
            if (wsRef.current)
            {
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.close();
            }
        }
    }, []);

    if (!context) return null;

    function sendStartMessage(message: GameSettings)
    {
        wsRef.current?.send(JSON.stringify(
            {
                Type: "game-settings",
                Payload: message
            }
        ));
        console.log("sent message");
    }

    const angleOffset: number = (320/Object.keys(players).length);
    const items: React.JSX.Element[] = Object.values(players).map((name, index) => {
        return <HandShaft key={index} name={name} rotation={(angleOffset/2)+110+index*angleOffset} />;
    });

    return(
        <div className="fixed flex flex-col justify-center items-center w-dvw h-dvh gap-3">
            { gameStarted
            ?   <span className="text-6xl p-5">00:00</span>
            :   <>
                { selfUID == hostUID ?
                
                <>
                <div onClick={() => SetSettingsVisible(true)} className="fixed text-7xl top-0 left-0 bg-gray-700">
                    <span>Options</span>
                </div>

                <PopupMenu
                visible={settingsVisible}
                closeAction={() => SetSettingsVisible(false)}
                submitAction={() => SetSettingsVisible(false)}>
                    <div>
                        <span>Mafia Count:</span>
                        <InputField value={MafiaCount.toString()} onChange={(value) => SetMafiaCount(parseInt(value))} />
                    </div>
                    <div>
                        <span>Nightfall duration:</span>
                        <InputField integral={true} value={TurnPlayTime.toString()} onChange={(value) => SetTurnPlayTime(parseInt(value))} />
                    </div>
                    <div>
                        <span>Vote time:</span>
                        <InputField integral={true} value={VoteTime.toString()} onChange={(value) => SetVoteTime(parseInt(value))} />
                    </div>
                </PopupMenu>
                </>

                : null }
                </>
            }

            <Table>
                {items}
            </Table>
            
            { gameStarted
            ?   <div className="flex flex-row flex-wrap justify-center items-center gap-2">
                    <SelfHand cards={playerHand} />
                    <div className="py-5 px-3 text-6xl rounded-xl bg-black/10">
                        <span>Role: </span>
                        <span className="border-2 border-white rounded-2xl p-2">None</span>
                    </div>
                </div>
            :   <div className="flex flex-col w-dvw items-center gap-15">
                    <div className="text-5xl">Room code: <span className="leading-none p-3 rounded-xl bg-black/10">{context.roomCode}</span></div>
                    {
                    selfUID === hostUID
                    ? <Button onClick={() => sendStartMessage({MafiaCount, TurnPlayTime, VoteTime})}>Start Game</Button>
                    : <span className="text-xl">Waiting for host to start the game...</span>
                    }
                </div> }
        </div>
    );
}