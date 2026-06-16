import styled from "styled-components";

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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5rem;
    z-index: 1000;
`

export default function PopupMenu({ children } : { children? : React.ReactNode })
{
    return(
        <Overlay>
            <MenuPanel>
                {children}
            </MenuPanel>
        </Overlay>
    );
}