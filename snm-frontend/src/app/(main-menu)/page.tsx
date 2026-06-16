'use client'

import { useState } from 'react';
import styles from './mainmenu.module.css';
import Button from '@components/Button';
import PopupMenu from './PopupMenu';

export default function MainMenu()
{
    const [optionsShown, SetOptions] = useState(false);
    const ToggleOptions = () => optionsShown ? SetOptions(false) : SetOptions(true);

    return(
        <>
        {optionsShown ?
        <PopupMenu>
            <Button onClick={ToggleOptions}>Close</Button>
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