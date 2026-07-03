'use client'

import styled from "styled-components";
import Button from "./Button";
import React from "react";

export const Overlay = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100dvw;
    height: 100dvh;
    z-index: 999;
`

export const MenuPanel = styled.div`
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
`

export const CloseIcon = styled.button`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 2rem;
    right: 2rem;
    background-color: rgb(25, 25, 25);
    color: var(--primary-color);
    font-size: 5rem;
    height: 6rem;
    width: 6rem;
    border-radius: 50%;

    transition: background-color var(--transition-time);

    &::after{
        content: '';
        background-image: url('/close-icon.svg');
        width: 3rem;
        height: 3rem;

        background-size: contain;
    }

    &:hover{
        background-color: rgb(30, 30, 30);
    }

    &:active{
        background-color: rgb(20, 20, 20);
    }
`

export default function PopupMenu({ children, visible, closeAction, submitAction } :
    { children? : React.ReactNode,
        visible : boolean,
        closeAction : () => void,
        submitAction : (event: React.SubmitEvent) => void })
{
    return(
        visible ?
        <Overlay>
            <MenuPanel>
                <form id="menu-form" onSubmit={submitAction}>
                    {children}
                </form>
                <Button form="menu-form">Apply</Button>
                <CloseIcon onClick={closeAction} />
            </MenuPanel>
        </Overlay>
        : null
    );
}