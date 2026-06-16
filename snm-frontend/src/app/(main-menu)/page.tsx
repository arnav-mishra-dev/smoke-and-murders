'use client'

import { useState } from 'react';
import styles from './mainmenu.module.css';
import Button from '@/components/Button';
import PopupMenu from '@/components/PopupMenu';

export default function MainMenu()
{
    const [optionsShown, SetOptions] = useState(false);
    const ToggleOptions = () => SetOptions(!optionsShown);

    function handleSubmit(event: Event)
    {
        event.preventDefault();
    }

    return(
        <>
        {optionsShown ?
        <PopupMenu closeAction={ToggleOptions} submitAction={handleSubmit}>
            <label>Username:
                <input type="text"/>
            </label>
        </PopupMenu>
        : null}

        <div className={styles.container}>
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>
            <Button>Create Room</Button>
            <Button>Join Room</Button>
            <Button onClick={ToggleOptions}>Options</Button>
        </div>
        </>
    );
}