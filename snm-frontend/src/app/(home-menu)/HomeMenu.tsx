'use client'
import Button from "@/components/Button";
import UsernameSetter from "./UsernameSetter";
import styles from './mainmenu.module.css';

export default function HomeMenu()
{
    return(
        <>
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>
            <Button>Create Room</Button>
            <Button>Join Room</Button>
            <UsernameSetter />
        </>
    );
}