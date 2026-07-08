'use client'
import styled from "styled-components";
import Image from "next/image";
import { JSX, use, useEffect, useEffectEvent, useRef, useState } from "react";
import { ConnectionContext } from "@/lib/context";
import { Card, CardSuit, CardValue, Page, PlayerData, Role } from "@/lib/types";
import Button from "./Button";
import PopupMenu from "./PopupMenu";
import InputField from "./InputField";
import MenuButton from "./MenuButton";

export const TableContainer = styled.div`
    position: relative;
    display: flex;
    background-image: url(/game/centre_table.svg);
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: 5rem;
    border-radius: 50%;
    width: 30rem;
    height: 30rem;
    aspect-ratio: 1/1;
    transform: translateZ(-1px);
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

function SelfHand({cards, isDead} : {cards: Card[], isDead: boolean})
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

            {isDead && <div className="
            absolute flex
            justify-center items-center
            w-full h-full
            rounded-full
            [background:radial-gradient(#000000,#000000c1,#00000000,#00000000)]">
                <Image
                className="w-20 h-20"
                width={0} height={0}
                src="/game/death-icon.svg"
                alt="Death icon" />
            </div>}
        </div>
    );
}

function OtherPlayerHand({ rotation, name, isSelected, isDead, cardsDealt, SelectAction } : {
    rotation: number,
    name: string,
    isSelected: boolean,
    isDead: boolean,
    cardsDealt: boolean,
    SelectAction: () => void})
{
    const selectionElementStyle = "absolute pointer-events-auto w-20 h-20 scale-150 "+(isSelected ? "opacity-100" : "opacity-0 hover:opacity-50");
    return(
        <div
        className="absolute flex justify-end w-11/12"
        style={{rotate: `${rotation}deg`}}>
            {cardsDealt &&
            <div
            className="
            relative
            flex items-center justify-center
            rotate-90
            w-25 h-25">
                <Image
                className="
                absolute
                w-17.5 h-24.5
                -translate-x-1.5 rotate-6"
                src="/cards/card_back.svg"
                width={0} height={0}
                alt="Face down card" />
                <Image
                className="
                absolute
                w-17.5 h-24.5
                translate-x-1.5 -rotate-6"
                src="/cards/card_back.svg"
                width={0} height={0}
                alt="Face down card" />
            </div>}

            <div
            style={{
                position: 'absolute',
                display: 'flex',
                right: '-7rem',
                rotate: `${-rotation}deg`,
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <span className="absolute -translate-y-10 flex text-2xl/10 justify-center items-center p-2 h-10 rounded-xl bg-gray-900/95">{name}</span>
                <Image
                className="w-25 h-25"
                width={0} height={0}
                src="/ui/profile-icon.svg"
                alt="Profile icon" />
                <Image
                className={selectionElementStyle}
                onClick={SelectAction}
                width={0} height={0}
                src="/game/player-selection-icon.svg"
                alt="Selection icon" />

                {isDead &&
                <div className="
                absolute flex
                justify-center items-center
                w-25 h-25
                rounded-full
                [background:radial-gradient(#000000,#000000c1,#00000000,#00000000)]">
                    <Image
                    className="w-20 h-20"
                    width={0} height={0}
                    src="/game/death-icon.svg"
                    alt="Death icon" />
                </div>
                }
            </div>
        </div>
    );
}

function WinnerScreen({ winners, deadPlayers, text, CloseAction } : { winners: PlayerData, deadPlayers: string[], text: string, CloseAction: () => void})
{
    return(
        <div className="fixed flex w-dvw h-dvh flex-col justify-center items-center gap-20 bg-[#0f0f0f]">
            <span className="text-9xl font-[misproject]">{text} win</span>
            <div className="flex flex-row gap-10">
                {Object.keys(winners).map((uid, key) => {
                    return(
                        <div className="flex flex-row items-center gap-30" key={key}>
                            <div className="flex flex-col items-center text-5xl">
                                <span className="p-2 rounded-xl bg-gray-900/95">{winners[uid]}</span>
                                <Image
                                className="w-50 h-50"
                                width={0} height={0}
                                src="/ui/profile-icon.svg"
                                alt="Profile icon" />
                            </div>
                            { deadPlayers.includes(uid) &&
                                <div className="
                                absolute flex
                                justify-center items-center
                                w-50 h-50
                                rounded-full
                                [background:radial-gradient(#000000,#000000c1,#00000000,#00000000)]">
                                    <Image
                                    className="w-20 h-20"
                                    width={0} height={0}
                                    src="/game/death-icon.svg"
                                    alt="Death icon" />
                                </div>
                            }
                        </div>
                    );
                })}
            </div>
            <Button style={{position: "absolute", right: '2rem', bottom: '2rem'}} onClick={CloseAction}>Continue</Button>
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
    const [selectionPending, SetSelectionPending] = useState<boolean>(true);

    const [players, SetPlayersValue] = useState<PlayerData>({});
    const [gameStarted, SetGameStarted] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);
    const roomCodeRef = useRef<string>(roomCode);

    const [isMafia, SetMafiaState] = useState<boolean>(false);
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
    const [winnerScreen, SetWinnerScreen] = useState<{winners: PlayerData, deadPlayers: string[], winnerVal: string} | null>(null);

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
                SetWinnerScreen(null);
                break;
            case "mafia-state":
                SetMafiaState(parsedData.Payload);
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
                SetDeadPlayers(new Set<string>([...deathUpdates, ...deadPlayers]))
                if (deathUpdates.includes(selfUID)) SetDeathState(true);

                SetNightfallState(false);
                SetJailedState(false);
                SelectPlayer("");
                SetSelectionPending(true);
                break;
            }
            case "jailed":
                SetJailedState(true);
                break;
            case "round-over":
                SelectPlayer("");
                SetSelectionPending(true);
                SetNightfallState(true);
                break;
            case "game-over":
                SetWinnerScreen({
                    winners: parsedData.Payload.WinnerList,
                    deadPlayers: [...deadPlayers],
                    winnerVal: parsedData.Payload.Winner
                });
                console.log(parsedData.Payload.WinnerList);
                console.log([...deadPlayers]);

                SetMafiaState(false);
                SetGameStarted(false);
                SetCommunityCards([]);
                SetPlayerHand([]);
                SetDeadPlayers(new Set<string>([]))
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
        console.log("Sent game start message");
    }

    function sendSelectedPlayer()
    {
        SetSelectionPending(false);
        wsRef.current?.send(JSON.stringify(
            {
                Type: isNightfall ? "target" : "vote",
                Payload: selectedUID
            }
        ));
        console.log(isNightfall ? "Sent targeting message" : "Sent vote");
    }

    function getGameOptionsMenu()
    {
        const playerCount = Object.keys(players).length;
        const maxMafiaCount = playerCount<1 ? 1 : Math.floor(playerCount/4);
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
                    <span className="text-2xl">Mafia Count:</span>
                    <InputField integral={true} maxVal={maxMafiaCount} value={MafiaCount.toString()} onChange={(value) => SetMafiaCount(parseInt(value))} />
                </div>
                <div>
                    <span className="text-2xl">Nightfall duration:</span>
                    <InputField integral={true} maxVal={600} value={TurnPlayTime.toString()} onChange={(value) => SetTurnPlayTime(parseInt(value))} />
                </div>
                <div>
                    <span className="text-2xl">Vote time:</span>
                    <InputField integral={true} maxVal={600} value={VoteTime.toString()} onChange={(value) => SetVoteTime(parseInt(value))} />
                </div>
            </PopupMenu>
        </>
        );
    }

    function getRenderedTable()
    {
        const playerCount: number = Object.keys(players).length-1;
        const angleCovered: number = 320/playerCount;
        let currentIndex: number = -1;

        const selectionElementStyle = "absolute pointer-events-auto w-15 h-15 scale-150 "
        +(selectedUID=="skip" ? "opacity-100" : "opacity-0 hover:opacity-50");

        return(
            <TableContainer className="pointer-events-none">
                { Object.keys(players).map((uid) => {
                    if (uid == selfUID) return;
                    currentIndex++;
                    return(
                        <OtherPlayerHand
                        isSelected={uid==selectedUID}
                        cardsDealt={gameStarted}
                        isDead={deadPlayers.has(uid)}
                        key={uid}
                        SelectAction={() => {
                            if (gameStarted && selectionPending && !isDead && !isJailed && !deadPlayers.has(uid))
                            {
                                return isNightfall
                                ? ((currentRole != Role.None && currentRole != Role.Mayor) || isMafia) && SelectPlayer(uid)
                                : SelectPlayer(uid);
                            }
                        }}
                        name={players[uid]}
                        rotation={90+20+(angleCovered*currentIndex)+(angleCovered/2)} />
                    );
                })}

                <div className="absolute w-full h-full flex flex-row items-center justify-center">
                    {communityCards.map((card, index) =>
                        <Image
                        className="w-20 h-28 -m-7"
                        key={index}
                        src={getCardPath(card)}
                        width={0} height={0}
                        alt={`Community card ${index+1}`} />
                    )}
                </div>

                {!playerCount && <div className="absolute w-full h-full flex flex-row items-center justify-center">
                    <p className="text-4xl font-bold text-white">Empty room</p>
                </div>}

                { selectedUID && selectionPending &&
                <div className="absolute w-full h-80 flex flex-col-reverse items-center">
                    <Button
                    style={{pointerEvents: "auto", padding: '0.8rem', fontSize: '2.2rem', outline: '0.3rem solid rgba(0, 0, 0, 0.3)'}}
                    onClick={sendSelectedPlayer}>
                        Confirm
                    </Button>
                </div>
                }
                {gameStarted && !isNightfall &&
                    <div className="absolute w-full h-130 flex flex-col-reverse items-center">
                        <span className="
                        rounded-full
                        text-4xl
                        outline-[0.4rem]
                        outline-black
                        p-3 bg-[#191919]">Skip</span>
                        <Image
                        className={selectionElementStyle}
                        onClick={() => selectionPending && !isDead && SelectPlayer("skip")}
                        width={0} height={0}
                        src="/game/player-selection-icon.svg"
                        alt="Selection icon" />
                    </div>
                }
            </TableContainer>
        )
    }

    function getHandAndRole()
    {
        return(
            <div className="flex flex-col flex-wrap justify-center items-center gap-2">
                <SelfHand isDead={isDead} cards={playerHand} />
                <div>
                    <div className="flex flex-col gap-4 py-5 px-3 text-6xl rounded-xl bg-black/10">
                        <div>
                            <span>Role: </span>
                            <span className="border-2 border-white rounded-2xl p-2">{Role[currentRole]}</span>
                        </div>
                        {isMafia && <div className="flex flex-row items-center justify-center gap-3 text-4xl text-red-600">
                            <p>Mafia</p>
                            <Image
                            className="w-10 h-10"
                            width={0} height={0}
                            src="/game/mafia-icon.svg"
                            alt="Mafia icon" />
                        </div>}
                        {isJailed && <div className="flex flex-row items-center justify-center gap-3 text-4xl text-gray-400">
                            <p>Jailed</p>
                            <Image
                            className="w-10 h-10"
                            width={0} height={0}
                            src="/game/jail-icon.svg"
                            alt="Jail icon" />
                        </div>}
                    </div>
                </div>
            </div>
        )
    }

    function getStartingInfo()
    {
        return(
            <div className="flex flex-col items-center gap-15">
                <div className="text-5xl">Room code: <span className="leading-none p-3 rounded-xl bg-black/10">{roomCode}</span></div>
                { selfUID === hostUID
                ? <Button onClick={() => sendStartMessage({MafiaCount, TurnPlayTime, VoteTime})}>Start Game</Button>
                : <span className="text-xl">Waiting for host to start the game...</span>
                }
            </div>
        );
    }

    function getTimeIcon()
    {
        return(
            <Image
            className="w-15 h-15"
            width={0} height={0}
            src={`/game/${isNightfall ? "moon" : "sun"}.svg`}
            alt={`${isNightfall ? "Moon icon" : "Sun icon"}`} />
        );
    }

    return(
        <div className="flex flex-row justify-evenly items-center w-dvw h-dvh gap-3">
            { gameStarted
            ? <div className="flex flex-col gap-5 items-center w-30 text-6xl">
                {getTimeIcon()}
                {time}
            </div>
            : (selfUID==hostUID) && getGameOptionsMenu()
            }

            {getRenderedTable()}
            
            { gameStarted
            ? getHandAndRole()
            : getStartingInfo()
            }

            {winnerScreen && 
            <WinnerScreen
            CloseAction={() => SetWinnerScreen(null)}
            winners={winnerScreen.winners}
            deadPlayers={winnerScreen.deadPlayers}
            text={winnerScreen.winnerVal} />}
        </div>
    );
}