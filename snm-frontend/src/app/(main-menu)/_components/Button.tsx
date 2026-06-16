import React from 'react';
import style from './button.module.css'

type ButtonProps = {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function Button(props : ButtonProps)
{
    return(
        <button onClick={props.onClick} className={style['snm-button']}>{props.children}</button>
    );
}