import React from 'react';
import style from './button.module.css'

export default function Button({ children } : { children : React.ReactNode})
{
    return(
        <button className={style['snm-button']}>{ children }</button>
    );
}