import styled from "styled-components";
import Button from "./Button";
import React, { SubmitEventHandler } from "react";

export const Overlay = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100vw;
    height: 100vh;
    z-index: 999;
`

export const MenuPanel = styled.div`
    position: absolute;
    display: flex;
    background-color: var(--primary-bg-color);
    width: 75vw;
    height: 90vh;
    gap: 5rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5rem;
    z-index: 1000;
`

export const CloseIcon = styled.button`
    position: absolute;
    top: 2rem;
    right: 2rem;
    background-color: rgb(25, 25, 25);
    color: var(--primary-color);
    font-family: noir;
    font-size: 5rem;
    height: 6rem;
    width: 6rem;
    border: 0px;
    border-radius: 100%;

    transition: background-color var(--transition-time);

    &:hover{
        background-color: rgb(30, 30, 30);
    }

    &:active{
        background-color: rgb(20, 20, 20);
    }
`

export default function PopupMenu({ children, closeAction, submitAction } :
    { children? : React.ReactNode,
        closeAction : () => void,
        submitAction : (event) => void })
{
    return(
        <Overlay>
            <MenuPanel>
                <form id="menu-form" onSubmit={submitAction}>
                    {children}
                </form>
                <Button form="menu-form">Apply</Button>
                <CloseIcon onClick={closeAction}>×</CloseIcon>
            </MenuPanel>
        </Overlay>
    );
}