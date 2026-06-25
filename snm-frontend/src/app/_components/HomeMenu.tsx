'use client'
import { use, useState } from "react";
import { ConnectionContext } from "@/lib/context";
import { Page } from "@/lib/types";
import Button from "./Button";
import PopupMenu from "./PopupMenu";
import InputField from "./InputField";
import UsernameSetter from "./UsernameSetter";
import styles from './mainmenu.module.css';

export default function HomeMenu()
{
    const context = use(ConnectionContext);
    const [roomJoinActive, SetRoomJoinShown] = useState(false);

    return(
        <div className={styles.container}>
            <PopupMenu
            visible={roomJoinActive}
            closeAction={() => SetRoomJoinShown(false)}
            submitAction={(e) => {e.preventDefault()}}>
                <p className="text-2xl/10">Room code:</p>
                <InputField />
            </PopupMenu>
            
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>

            <Button onClick={() => {
                if (!(context === null) && context.username)
                {
                    context.connection.current = new WebSocket(`ws://localhost:5206/api/ws?username=${context.username}`);

                    context.connection.current?.addEventListener("message", (ev: MessageEvent) => {
                        console.log(ev.data);
                        context.players.push(ev.data);
                    });

                    context.connection.current?.addEventListener("close", (ev: CloseEvent) => {
                        console.log(`Connection closed: ${ev}`);
                        context.connection.current = null;
                        context.SwitchPage(Page.Home)
                    })

                    context.connection.current?.addEventListener("error", (ev: Event) => {
                        context.SwitchPage(Page.Home)
                        console.error(`Connection lost: ${ev}`);
                    })

                    context.SwitchPage(Page.Game)
                }
            }}>
                Create Room
            </Button>

            <Button onClick={() => SetRoomJoinShown(true)}>Join Room</Button>
            <UsernameSetter />
        </div>
    );
}