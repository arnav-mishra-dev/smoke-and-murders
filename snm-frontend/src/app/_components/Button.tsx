'use client'
import styled from 'styled-components';

const Button = styled.button`
    position: relative;
    background-color: rgb(25, 25, 25);
    color: var(--primary-color);
    line-height: 1.5;
    font-size: 3.5rem;
    padding: 1.4rem;
    border: 0px;
    border-radius: 0.8rem;

    display: flex;
    justify-content: center;
    align-items: center;

    transition: background-color var(--transition-time);

    &:active{
        background-color: rgb(20, 20, 20);
    }

    &::after{
        content: '';
        position: absolute;
        height: 110%;
        width: 103%;
        border-radius: 0.5em;
        background-image: url(/ui/noise.svg);
        z-index: -1;

        transition: width var(--transition-time), height var(--transition-time);
    }

    &:hover::after{
        height: 115%;
        width: 107%;
    }
`

export default Button;