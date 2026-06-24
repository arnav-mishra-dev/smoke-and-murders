'use client'
import styled from "styled-components";
import './types';

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

export const HandShaft = ({ rotation  } : {rotation: number}) => <HandContainer style={{rotate: `${rotation}deg`}}>Ace of spades<Hand /></HandContainer>;

interface PlayerData
{
    uuid: string,
    username: string
}

export default function Board({ playerData } : { playerData: PlayerData[] })
{
    const angleOffset = (320/playerData.length);
    return(
        <Table>
            {playerData.map((_, index) => <HandShaft rotation={(angleOffset/2)+110+index*angleOffset} key={index} />)}
        </Table>
    );
}