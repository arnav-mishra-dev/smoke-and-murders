'use client'
import styled from "styled-components";
import { use, useEffect } from "react";
import { ConnectionContext } from "@/lib/context";
import { Page } from "@/lib/types";

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

export const HandShaft = ({ rotation, name } : {rotation: number, name: string}) =>
{
    return (
        <HandContainer
        className="pr-4"
        style={{rotate: `${rotation}deg`}}>
            <Hand />
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
                    context.SetPlayersValue(parsedData.Payload);
                    break;
            }
        };

        ws.onclose = () => {
            console.log("Connection closed");
            context.connection.current = null;
            context.SetPlayersValue({});
            context.SetRoomCode("");
            context.SwitchPage(Page.Home)
        };

        ws.onerror = () => {
            console.error("Connection lost");
            context.connection.current = null;
            context.SetPlayersValue({});
            context.SetRoomCode("");
            context.SwitchPage(Page.Home);
        };

        return () => {
            ws.onclose = null;
            ws.onerror = null;
            ws?.close();
        }
    }, []);

    const angleOffset = (320/Object.keys(context?.players).length);
    const items = Object.values(context?.players).map((name, index) => {
        return <HandShaft key={index} name={name} rotation={(angleOffset/2)+110+index*angleOffset} />;
    });

    return(
        <div
        className="flex flex-col pt-15 w-dvw h-dvh items-center gap-40">
            <Table>
                {items}
            </Table>
            <div className="text-5xl">
                {context.roomCode}
            </div>
        </div>
    );
}