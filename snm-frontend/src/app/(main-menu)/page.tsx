'use client'

import { useState } from 'react';
import styles from './mainmenu.module.css';
import Button from './_components/Button';
import PopupMenu from './_components/PopupMenu';

export default function MainMenu()
{
    const [optionsShown, SetOptions] = useState(false);
    const ToggleOptions = () => optionsShown ? SetOptions(false) : SetOptions(true);

    return(
        <>
        {optionsShown ?
        <PopupMenu>
            <form>
                {/* Input form code */}
            </form>

            <div style={{display: 'flex', flexDirection: 'row', gap: '3rem'}}>
                <Button onClick={ToggleOptions}>Apply</Button>
                <Button onClick={ToggleOptions}>Close</Button>
            </div>
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