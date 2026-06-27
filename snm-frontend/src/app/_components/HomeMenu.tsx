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
    const [enteredCode, SetEnteredCode] = useState("");

    return(
        <div className={styles.container}>
            <PopupMenu
            visible={roomJoinActive}
            closeAction={() => SetRoomJoinShown(false)}
            submitAction={(e) => {
                e.preventDefault();
                if (context && (enteredCode.length === 6))
                {
                    context.SetRoomCode(enteredCode);
                    context.SwitchPage(Page.Game);
                }
            }}>
                <p className="text-2xl/10">Room code:</p>
                <InputField onChange={SetEnteredCode}/>
            </PopupMenu>
            
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>

            <Button onClick={() => {
                if (context && context.username)
                {
                    context.SwitchPage(Page.Game);
                }
            }}>
                Create Room
            </Button>

            <Button onClick={() => SetRoomJoinShown(true)}>Join Room</Button>
            <UsernameSetter />
        </div>
    );
}