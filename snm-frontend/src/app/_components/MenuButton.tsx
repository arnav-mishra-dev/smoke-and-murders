import styled from "styled-components"

const PADDING = 3;

const MenuButton = styled.button<{ $iconUrl: string, $imgSize: number }>`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(25, 25, 25);
    color: var(--primary-color);
    font-size: 5rem;
    border-radius: 50%;

    width: ${p => p.$imgSize/4}rem;
    height: ${p => p.$imgSize/4}rem;
    padding: ${PADDING}rem;

    transition: background-color var(--transition-time);

    &::after{
        content: '';
        position: absolute;
        background-image: url(${p => p.$iconUrl});
        background-repeat: no-repeat;

        width: ${p => (p.$imgSize/4)-PADDING}rem;
        height: ${p => (p.$imgSize/4)-PADDING}rem;

        background-size: contain;
    }

    &:hover{
        background-color: rgb(30, 30, 30);
    }

    &:active{
        background-color: rgb(20, 20, 20);
    }
`

export default MenuButton;