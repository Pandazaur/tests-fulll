import styles from './CardUser.module.css'
import type {GitHubUser} from "../../types/response/github-api/SearchProfilesResponse.type.ts";
// import {useEffect, useState} from "react";

export type User = Pick<GitHubUser, 'id' | 'login' | 'avatar_url' | 'html_url'>

type Props = {
    user: User
    isSelectable?: boolean
    isSelected?: boolean
    onToggleSelect?: (user: User, isSelected: boolean) => unknown
}

export default function CardUser(props: Props) {
    // const [isSelected, setSelected] = useState(props.isSelected ?? false)

    // useEffect(() => {
    //     props.onToggleSelect?.(props.user, isSelected)
    // }, [isSelected]);

    return (
        <div className={styles.card}>
            <div className={styles.card__body}>
                {
                    props.isSelectable ? (
                        <input
                            className={styles.card__checkbox}
                            type="checkbox"
                            onChange={e => props.onToggleSelect?.(props.user, e.target.checked)}
                            checked={props.isSelected}
                        />
                    ) : null
                }
                <img className={styles.card__avatar} src={props.user.avatar_url} alt="Avatar"/>
                <p className={styles.card__text}>
                    <span className={styles.card__userId}>{props.user.id}</span>
                    <br/>
                    {props.user.login}
                </p>
                <a href={props.user.html_url} target={'_blank'} rel={'noopener noreferrer'}>
                    <button className={styles.card__button}>View profile</button>
                </a>

            </div>
        </div>
    )
}