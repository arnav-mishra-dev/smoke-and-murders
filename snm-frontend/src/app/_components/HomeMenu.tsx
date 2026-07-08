'use client'
import { use, useState } from "react";
import { ConnectionContext } from "@/lib/context";
import { Page } from "@/lib/types";
import Image from "next/image";
import Button from "./Button";
import PopupMenu from "./PopupMenu";
import InputField from "./InputField";
import styles from './mainmenu.module.css';

function UsernameSetter()
{
    const context = use(ConnectionContext);

    return (
        <div className="flex flex-column top-0 left-0 items-center justify-center gap-2">
            <Image
            className="w-20 h-20"
            width={0} height={0}
            src="/ui/profile-icon.svg"
            alt="Profile icon"
            />
            <InputField value={context?.username} onChange={ (username) => context?.SetUsername(username) } />
        </div>
    );
}

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
            submitAction={() => {
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