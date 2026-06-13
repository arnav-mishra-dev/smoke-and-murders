import styles from './mainmenu.module.css'
import Button from '@components/Button';

export default function MainMenu()
{
    return(
        <div className={styles.container}>
            <div className={styles['title-font']}>Smoke<br/>and<br/>Murders</div>
            <Button>Create Room</Button>
            <Button>Join Room</Button>
            <Button>Options</Button>
        </div>
    );
}