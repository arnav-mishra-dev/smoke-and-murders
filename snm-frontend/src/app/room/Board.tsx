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

export const HandShaft = ({ rotation } : {rotation: number}) => <HandContainer style={{rotate: `${rotation}deg`}}><Hand /></HandContainer>;

export default function Board({ data } : { data: string[] })
{
    const angleOffset = (320/data.length);
    return(
        <Table>
            {data.map((_, index) => <HandShaft rotation={(angleOffset/2)+110+index*angleOffset} key={index} />)}
        </Table>
    );
}