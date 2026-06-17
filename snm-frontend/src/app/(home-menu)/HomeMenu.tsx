'use client'

import { useState } from "react";
import Button from "@/components/button/Button";
import PopupMenu from "@/components/PopupMenu";
import styles from './mainmenu.module.css';
import InputField from "@/components/inputfield/InputField";

export default function HomeMenu()
{
    const [optionsMenuShown, SetOptionsShown] = useState(false);
    const [createRoomMenuShown, SetRoomCreationShown] = useState(false);

    function handleOptionsApply(event)
    {
        event.preventDefault();
    }

    return(
        <>
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>
            <Button>Create Room</Button>
            <Button>Join Room</Button>
            <Button onClick={() => SetOptionsShown(true)}>Options</Button>

            <PopupMenu
            visible={optionsMenuShown}
            closeAction={() => SetOptionsShown(false)}
            submitAction={handleOptionsApply}>
                <InputField label="Username:" />
            </PopupMenu>
        </>
    );
}