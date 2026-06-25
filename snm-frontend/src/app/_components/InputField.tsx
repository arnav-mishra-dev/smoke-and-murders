'use client'
import Image from 'next/image';
import styled from 'styled-components';

export const StyledInput = styled.input`
    position: relative;
    background-color: transparent;
    width: 20rem;
    color: var(--primary-color);
    text-align: center;
    line-height: 1;
    padding: 0.5rem 2.5rem 0.5rem 0.5rem;
    font-size: 2rem;
    border-radius: 0.4rem;
    border: 0;
    outline: 0;
    border-bottom: 1px solid var(--primary-color);

    display: flex;
    justify-content: center;
    align-items: center;

    transition: background-color var(--transition-time), border-color var(--transition-time), box-shadow var(--transition-time);

    &:focus {
        text-align: left;
        border-bottom: 1px solid white;
        background-color: rgb(25, 25, 25);
        box-shadow: 0 0 10px 1px rgb(32, 32, 32);
    }
`

export default function InputField({ onChange } : { onChange? : (value: string) => void } )
{
    return(
        <div className='flex flex-col relative justify-center items-end'>
            <Image
            className="w-10 h-10 p-1 absolute"
            src="/edit-icon.svg"
            width={0}
            height={0}
            alt="Edit icon"
            />
            <StyledInput
            id='input-field'
            type="text"
            maxLength={20}
            onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    )
}