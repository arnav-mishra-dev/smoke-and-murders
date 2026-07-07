'use client'
import styled from "styled-components";
import Image from "next/image";
import { use, useEffect, useEffectEvent, useRef, useState } from "react";
import { ConnectionContext } from "@/lib/context";
import { Card, CardSuit, CardValue, Page, PlayerData, Role } from "@/lib/types";
import Button from "./Button";
import PopupMenu from "./PopupMenu";
import InputField from "./InputField";
import MenuButton from "./MenuButton";

export const Table = styled.div`
    position: relative;
    display: flex;
    background-image: url(/centre_table.svg);
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: 5rem;
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

function getCardPath(card: Card)
{
    const name = `${CardValue[card.Value]}_${CardSuit[card.Suit]}`.toLowerCase();
    return `/cards/${name}.svg`;
}

function SelfHand({cards} : {cards: Card[]})
{
    if (cards.length === 0) return null;

    const pathFirst: string = getCardPath(cards[0]);
    const pathSecond: string = getCardPath(cards[1]);

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

function OtherPlayerHand({ rotation, name, isSelected, SelectAction } : {rotation: number, name: string, isSelected: boolean, SelectAction: () => void})
{
    const selectionElementStyle = "absolute pointer-events-auto w-full h-full scale-150 "+(isSelected ? "opacity-100" : "opacity-0 hover:opacity-50");
    return(
        <div
        className="absolute flex justify-end w-11/12"
        style={{rotate: `${rotation}deg`}}>
            <div
            className="
            relative
            group/selector
            flex items-center justify-center
            rotate-90
            w-25 h-25">
                <Image
                className="
                absolute
                w-20 h-30
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

                <Image
                className={selectionElementStyle}
                onClick={SelectAction}
                width={0} height={0}
                src="/player-selection-icon.svg"
                alt="Selection icon" />
            </div>

            <div
            style={{position: 'absolute', translate: "2rem 0", rotate: `${-rotation}deg`}}>
                <span className="text-2xl/10 p-2 h-10 rounded-xl bg-gray-900/95">{name}</span>
            </div>
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
    const [selectedUID, SelectPlayer] = useState<string>("");

    const [players, SetPlayersValue] = useState<PlayerData>({});
    const [gameStarted, SetGameStarted] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);
    const roomCodeRef = useRef<string>(roomCode);

    const [isNightfall, SetNightfallState] = useState<boolean>(true);
    const [deadPlayers, SetDeadPlayers] = useState<Set<string>>(new Set<string>([]));
    const [communityCards, SetCommunityCards] = useState<Card[]>([]);
    const [playerHand, SetPlayerHand] = useState<Card[]>([]);
    const [currentRole, SetRole] = useState<Role>(Role.None);
    const [time, SetTime] = useState<string>("0:00");
    const [isDead, SetDeathState] = useState<boolean>(false);
    const [isJailed, SetJailedState] = useState<boolean>(false);

    const [settingsVisible, SetSettingsVisible] = useState<boolean>(false);
    const [MafiaCount, SetMafiaCount] = useState<number>(1);
    const [TurnPlayTime, SetTurnPlayTime] = useState<number>(30);
    const [VoteTime, SetVoteTime] = useState<number>(60);

    const onSocketMessage = useEffectEvent((event: MessageEvent) => {
        if (!SetRoomCode) return;

        const parsedData = JSON.parse(event.data);
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
            case "mafia-state":
                break;
            case "card-hand":
                SetPlayerHand(parsedData.Payload);
                break;
            case "community-cards":
                SetCommunityCards(parsedData.Payload);
                break;
            case "role-message":
                SetRole(parsedData.Payload as Role);
                break;
            case "time":
            {
                const totalTime: number = parsedData.Payload;
                const minutes: number = Math.floor(totalTime/60);
                const seconds: number = totalTime - (minutes*60);

                SetTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                break;
            }
            case "death-updates":
            {
                const deathUpdates = parsedData.Payload;
                SetDeadPlayers(new Set<string>(...deathUpdates, ...deadPlayers))
                if (selfUID in deadPlayers) SetDeathState(true);

                SetNightfallState(false);
                SetJailedState(false);
                SelectPlayer("");
                break;
            }
            case "jailed":
                SetJailedState(true);
                break;
            case "round-over":
                SelectPlayer("");
                SetNightfallState(true);
                break;
            case "game-over":
                SetGameStarted(false);
                SetDeadPlayers(new Set<string>([]));
                SetCommunityCards([]);
                SetPlayerHand([]);
                SetRole(Role.None);
                SetTime("0:00");
                SetDeathState(false);
                SetJailedState(false);
                SetNightfallState(true);
                break;
        }
    });

    const onSocketClose = useEffectEvent(() => {
        if (!SetRoomCode || !SwitchPage) return;

        console.log("Connection closed");
        wsRef.current = null;
        SetRoomCode("");
        SwitchPage(Page.Home);
    });

    const onSocketError = useEffectEvent(() => {
        if (!SetRoomCode || !SwitchPage) return;

        console.error("Connection lost");
        wsRef.current = null;
        SetRoomCode("");
        SwitchPage(Page.Home);
    });

    const socketCleanup = useEffectEvent(() => {
        if (wsRef.current)
        {
            wsRef.current.onclose = null;
            wsRef.current.onerror = null;
            wsRef.current.close();
        }
    });

    useEffect(() => {
        console.log("Connecting...");

        const ws = roomCodeRef.current
        ? new WebSocket(`ws://localhost:5000/api/ws?username=${username}&room=${roomCodeRef.current}`)
        : new WebSocket(`ws://localhost:5000/api/ws?username=${username}`);

        wsRef.current = ws;
        console.log(`Connected to room ${wsRef.current.url}`);

        ws.onmessage = (ev: MessageEvent) => {
            onSocketMessage(ev);
        };

        ws.onclose = () => {
            onSocketClose();
        };

        ws.onerror = () => {
            onSocketError();
        };

        return socketCleanup;
    }, [username, SetRoomCode, SwitchPage]);

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

    function getGameOptionsMenu()
    {
        if (selfUID == hostUID)
        {
            return (
            <>
                <MenuButton
                className="top-3 right-3 lg:top-10 lg:left-10 "
                onClick={() => SetSettingsVisible(true)}
                $iconUrl="/ui/cogwheel.svg"
                $imgSize={30} />

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
            );
        }
        else
        {
            return null;
        }
    }

    function getRenderedTable()
    {
        const angleOffset: number = (320/Object.keys(players).length);

        return(
            <Table className="pointer-events-none">
                {
                Object.keys(players).map((uid, index) =>
                    !(uid == selfUID) &&
                    <OtherPlayerHand
                    isSelected={uid==selectedUID}
                    key={uid}
                    SelectAction={() => {
                        if (gameStarted)
                        {
                            return isNightfall
                            ? currentRole != Role.None && currentRole != Role.Mayor && SelectPlayer(uid)
                            : SelectPlayer(uid);
                        }
                    }}
                    name={players[uid]}
                    rotation={(angleOffset/2)+110+index*angleOffset} />)
                }
                <div className="absolute w-full h-full flex flex-row items-center justify-center">
                    {
                        communityCards.map((card, index) =>
                            <Image
                            className="w-20 h-28 -m-7"
                            key={index}
                            src={getCardPath(card)}
                            width={0} height={0}
                            alt={`Community card ${index+1}`} />
                        )
                    }
                </div>
            </Table>
        )
    }

    function getHandAndRole()
    {
        return(
            <div className="flex flex-row flex-wrap justify-center items-center gap-2">
                <SelfHand cards={playerHand} />
                <div className="py-5 px-3 text-6xl rounded-xl bg-black/10">
                    <span>Role: </span>
                    <span className="border-2 border-white rounded-2xl p-2">{Role[currentRole]}</span>
                </div>
            </div>
        )
    }

    function getStartingInfo()
    {
        return(
            <div className="flex flex-col w-dvw items-center gap-15">
                <div className="text-5xl">Room code: <span className="leading-none p-3 rounded-xl bg-black/10">{roomCode}</span></div>
                { selfUID === hostUID
                ? <Button onClick={() => sendStartMessage({MafiaCount, TurnPlayTime, VoteTime})}>Start Game</Button>
                : <span className="text-xl">Waiting for host to start the game...</span>
                }
            </div>
        );
    }

    return(
        <div className="fixed flex flex-col justify-center items-center w-dvw h-dvh gap-3">
            { gameStarted
            ? <span className="text-6xl p-5">{time}</span>
            : getGameOptionsMenu()
            }

            {getRenderedTable()}
            {selectedUID && <Button>Confirm</Button>}
            
            { gameStarted
            ? getHandAndRole()
            : getStartingInfo()
            }
        </div>
    );
}