import styles from './CardUser.module.css'
import type {GitHubUser} from "../../types/response/github-api/SearchProfilesResponse.type.ts";

type Props = {
    isSelectable?: boolean
    user: Pick<GitHubUser, 'id' | 'login' | 'avatar_url' | 'html_url'>
}

export default function CardUser(props: Props) {
    return (
        <div className={styles.card}>
            <div className={styles.card__body}>
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