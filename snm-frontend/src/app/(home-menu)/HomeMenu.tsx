'use client'
import Button from "@/components/Button";
import UsernameSetter from "./_components/UsernameSetter";
import styles from './mainmenu.module.css';

export default function HomeMenu()
{
    return(
        <>
            <UsernameSetter />
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>
            <Button>Create Room</Button>
            <Button>Join Room</Button>
        </>
    );
}