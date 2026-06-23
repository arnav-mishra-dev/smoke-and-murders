'use client'
import Button from "@/components/Button";
import UsernameSetter from "./UsernameSetter";
import styles from './mainmenu.module.css';
import { useState } from "react";
import PopupMenu from "@/components/PopupMenu";
import InputField from "@/components/InputField";

export default function HomeMenu()
{
    const [roomJoinActive, SetRoomJoinShown] = useState(false);

    return(
        <>
            <PopupMenu
            visible={roomJoinActive}
            closeAction={() => SetRoomJoinShown(false)}
            submitAction={(e) => {e.preventDefault()}}>
                <p className="text-2xl/10">Room code:</p>
                <InputField />
            </PopupMenu>
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>
            <Button>Create Room</Button>
            <Button onClick={() => SetRoomJoinShown(true)}>Join Room</Button>
            <UsernameSetter />
        </>
    );
}