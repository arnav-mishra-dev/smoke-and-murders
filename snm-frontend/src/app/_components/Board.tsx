'use client'
import styled from "styled-components";
import { PlayerData } from '@/lib/types';

export const Table = styled.div`
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: 5rem;
    width: 35rem;
    height: 35rem;
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

export const HandShaft = ({ rotation } : {rotation: number}) =>
{
    return (
        <HandContainer style={{rotate: `${rotation}deg`}}>
            <Hand />
        </HandContainer>
    );
}

export default function Board({ playerData }: { playerData: PlayerData[] })
{
    const angleOffset = (320/playerData.length);
    return(
        <div className="flex flex-col pt-15 w-dvw h-dvh items-center">
        <Table>
            {playerData.map(({ uid }, index) => <HandShaft rotation={(angleOffset/2)+110+index*angleOffset} />)}
        </Table>
        </div>
    );
}