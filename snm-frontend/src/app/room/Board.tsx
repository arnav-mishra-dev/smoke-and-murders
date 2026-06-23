'use client'
import styled from "styled-components";

export const Table = styled.div`
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: 5rem;
    width: 50rem;
    height: 50rem;
    background: green;
    border-radius: 50%;
`

export const HandContainer = styled.div`
    position: absolute;
    display: flex;
    justify-content: flex-end;
    background-color: rgba(255, 0, 0, 0.4);
    width: 100%;
`

export const Hand = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10rem;
    height: 8rem;
    background-color: white;
`

export const HandShaft = () => <HandContainer><Hand /></HandContainer>;

interface playerData
{

};

export default function Board({ data } : { data: playerData[] })
{
    const playerHands = data.map((elem, index) => <HandShaft key={index.toString()} />)

    return(
        <Table>
            {playerHands}
        </Table>
    );
}