import styles from './App.module.css'
import IconDuplicate from "./components/ui/icons/IconDuplicate.tsx";
import IconTrash from "./components/ui/icons/IconTrash.tsx";
import CardUser, { type User as CardUserType } from "./components/user/CardUser.tsx";
import {type ChangeEvent, useEffect, useRef, useState} from "react";
import useDebouncedValue from "./hooks/useDebouncedValue.ts";
import GithubApi from "./services/api/Github.api.ts";
import type { GitHubSearchUsersResponse } from "./types/response/github-api/SearchProfilesResponse.type.ts";

function App() {
    const checkAllCheckbox = useRef<HTMLInputElement>(null)
    const [search, setSearch] = useState('panda')
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
    const [searchResult, setSearchResult] = useState<GitHubSearchUsersResponse | null>(null)
    const delayedSearch = useDebouncedValue(search, 500)

    useEffect(() => {
        setSelectedUserIds([])

        if (delayedSearch.length) {
            searchUsers(delayedSearch)
        } else {
            setSearchResult(null)
        }
    }, [delayedSearch]);

    useEffect(() => {
        if (!checkAllCheckbox.current) {
            return
        }

        if (!searchResult) {
            checkAllCheckbox.current.indeterminate = false
            checkAllCheckbox.current.checked = false
            return
        }

        checkAllCheckbox.current.checked = selectedUserIds.length > 0 && selectedUserIds.length === searchResult.items.length
        checkAllCheckbox.current.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length !== searchResult.items.length
    }, [selectedUserIds]);

    const searchUsers = async (search: string) => {
        try {
            const searchResult = await GithubApi.searchProfiles(search)
            setSearchResult(searchResult)
        } catch (e) {
            console.error(e)
        }
    }

    const onToggleUser = (user: CardUserType, isNowSelected: boolean) => {
        if (isNowSelected) {
            setSelectedUserIds(previousSelectedUserIds => [...previousSelectedUserIds, user.id])
        } else {
            setSelectedUserIds(previousSelectedUserIds => previousSelectedUserIds.filter(id => id !== user.id))
        }
    }

    const onToggleAllUsers = (e: ChangeEvent<HTMLInputElement>) => {
        if (!searchResult?.items) {
            return null
        }

        if (e.target.checked) {
            setSelectedUserIds(
                searchResult.items.map(user => user.id)
            )
        } else {
            setSelectedUserIds([])
        }

    }

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <h1 className={styles.header__title}>Github Search</h1>
            </header>
            <main className={styles.main}>
                <div className={styles.searchWrapper}>
                    <input
                        className={styles.search}
                        placeholder={"Search user"}
                        type="text"
                        name={'search'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <div className={styles.actions}>
                    <div>
                        <input type="checkbox" ref={checkAllCheckbox} onChange={onToggleAllUsers}/>
                        <label>{selectedUserIds.length} elements selected</label>
                    </div>

                    <div className={styles.actions__buttons}>
                        <button className={styles.actions__button} type={'button'}>
                            <IconDuplicate size={24} color={'#333'} />
                        </button>
                        <button className={styles.actions__button} type={'button'}>
                            <IconTrash size={24} color={'#333'} />
                        </button>
                    </div>
                </div>
                <div className={styles.userGrid}>
                    {
                        searchResult?.items.length
                            ? searchResult?.items.map(user =>
                                <CardUser user={user} isSelectable isSelected={selectedUserIds.includes(user.id)} onToggleSelect={onToggleUser}/>
                            )
                            : null
                    }
                </div>
            </main>
        </div>
    )
}

export default App
