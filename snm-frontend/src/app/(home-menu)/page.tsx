import styles from './mainmenu.module.css';
import HomeMenu from './HomeMenu';

export default function MainMenu()
{
    return(
        <div className={styles.container}>
            <HomeMenu />
        </div>
    );
}