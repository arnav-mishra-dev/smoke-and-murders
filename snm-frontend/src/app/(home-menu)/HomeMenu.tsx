'use client'
import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { redirect } from 'next/navigation';
import Button from "@/components/Button";
import PopupMenu from "@/components/PopupMenu";
import InputField from "@/components/InputField";
import UsernameSetter from "./UsernameSetter";
import styles from './mainmenu.module.css';

export default function HomeMenu()
{
    const username = useAppSelector((state) => state.username.value);

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

            <Button onClick={() => {username ? redirect("/room") : console.log("Empty username")}}>
                Create Room
            </Button>

            <Button onClick={() => SetRoomJoinShown(true)}>Join Room</Button>
            <UsernameSetter />
        </>
    );
}