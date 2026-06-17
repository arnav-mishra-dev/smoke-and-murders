import styles from './inputfield.module.css';

export default function InputField({ label } : { label : string})
{
    return(
        <div className={styles["container"]}>
        <label className={styles["label"]} htmlFor='input-field'>{label}</label>
        <input className={styles["input-field"]} id='input-field' type="text" />
        </div>
    )
}