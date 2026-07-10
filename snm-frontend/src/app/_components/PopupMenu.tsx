'use client'

import styled from "styled-components";
import Button from "./Button";
import React from "react";
import MenuButton from "./MenuButton";

const Overlay = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100dvw;
    height: 100dvh;
    z-index: 999;
`

const MenuPanel = styled.div`
    position: absolute;
    display: flex;
    background-color: var(--primary-bg-color);
    width: 40rem;
    height: 50rem;
    gap: 5rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5rem;
    z-index: 1000;

    @media (max-aspect-ratio: 1/1) {
        width: 28rem;
    }
`

export default function PopupMenu({ children, visible, closeAction, submitAction } :
    { children? : React.ReactNode,
        visible : boolean,
        closeAction : () => void,
        submitAction : () => void })
{
    return(
        visible ?
        <Overlay>
            <MenuPanel>
                <form className="flex flex-col gap-15" id="menu-form" action={submitAction}>
                    {children}
                </form>
                <Button form="menu-form">Apply</Button>
                <MenuButton
                className="top-8 right-8"
                onClick={closeAction}
                $iconUrl="/ui/close-icon.svg"
                $imgSize={24} />
            </MenuPanel>
        </Overlay>
        : null
    );
}