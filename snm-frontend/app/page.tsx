import styles from './mainmenu.module.css'

export default function MainMenu()
{
    return(
        <div className={styles.container}>
            <div className={styles['title-font']}>Smoke and Murders</div>
            <button>Join Room</button>
            <button>Create Room</button>
            <button>Options</button>
        </div>
    );
}