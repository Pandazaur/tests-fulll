import styles from './App.module.css'
import IconDuplicate from "./components/ui/icons/IconDuplicate.tsx";
import IconTrash from "./components/ui/icons/IconTrash.tsx";
import CardUser, { type User as CardUserType } from "./components/user/CardUser.tsx";
import {type ChangeEvent, useEffect, useRef, useState} from "react";
import useDebouncedValue from "./hooks/useDebouncedValue.ts";
import GithubApi from "./services/api/Github.api.ts";
import type {GitHubSearchUsersResponse, GitHubUser} from "./types/response/github-api/SearchProfilesResponse.type.ts";
import Spinner from "./components/ui/Spinner.tsx";

export default function App() {
    const checkAllCheckbox = useRef<HTMLInputElement>(null)
    const [isEditModeActivated, activateEditMode] = useState(false)
    const [search, setSearch] = useState('')
    const [searchError, setSearchError] = useState('')
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
    const [isLoadingResults, setLoadingResults] = useState(false)
    const [searchResult, setSearchResult] = useState<GitHubSearchUsersResponse | null>(null)
    // The delayed value is here to prevent to trigger to many requests. The request starts after the user stopped writing 500ms
    const delayedSearch = useDebouncedValue(search, 500)

    useEffect(() => {
        setSelectedUserIds([])

        if (delayedSearch.length) {
            searchUsers(delayedSearch)
        } else {
            setSearchResult(null)
        }
    }, [delayedSearch]);

    /**
     * Manage the checkbox states.
     * After each changement of the selected users in the list, we recalculate the state of the global checkbox
     */
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

    /**
     * Call the Github API to get the search results.
     * Manage loading, error and success data in React states.
     */
    const searchUsers = async (search: string) => {
        try {
            setLoadingResults(true)
            setSearchError('')
            const searchResult = await GithubApi.searchProfiles(search)
            setSearchResult(searchResult)
        } catch (e) {
            console.error(e)
            if ((e as Response).status === 403) {
                setSearchError("Rate limit exceeded: You're triggering to many requests. Please try again in a few seconds.")
            } else {
                setSearchError('An error occurred: Please try again in a few seconds.')
            }
        } finally {
            setLoadingResults(false)
        }
    }

    /**
     * Add/Remove user in the selected user list.
     */
    const onToggleUser = (user: CardUserType, isNowSelected: boolean) => {
        if (isNowSelected) {
            setSelectedUserIds(previousSelectedUserIds => [...previousSelectedUserIds, user.id])
        } else {
            setSelectedUserIds(previousSelectedUserIds => previousSelectedUserIds.filter(id => id !== user.id))
        }
    }

    /**
     * Select/unselect all the users directly from the global checkbox.
     */
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

    /**
     * Remove the selected users of the list.
     * @note: even if we don't use the `total_count` we change it in an optimistic update
     */
    const removeSelection = () => {
        setSearchResult(previousSearchResults => {
            if (!previousSearchResults) {
                return previousSearchResults
            }

            return {
                ...previousSearchResults,
                total_count: previousSearchResults.total_count - selectedUserIds.length,
                items: previousSearchResults.items.filter(item => !selectedUserIds.includes(item.id))
            }
        })
        setSelectedUserIds([])
    }

    /**
     * Duplicate selected items of the list
     * @note: we change `login` (to see a difference in the card between the original and the duplicated) and `id` (because
     *  we use it as `key` when rendering the user list and we need a different key from the original. The `id` is also used for the selection).
     */
    const duplicateSelection = () => {
        setSearchResult(previousSearchResults => {

            if (!previousSearchResults) {
                return previousSearchResults
            }

            const itemsToDuplicate: GitHubUser[] = previousSearchResults.items
                .filter(item => selectedUserIds.includes(item.id))
                .map(item => {
                    return {
                        ...item,
                        id: item.id + Math.random(),
                        login: item.login + ' (bis)',
                    }
                })

            return {
                ...previousSearchResults,
                total_count: previousSearchResults.total_count + itemsToDuplicate.length,
                items: [...previousSearchResults.items, ...itemsToDuplicate]
            }
        })
        setSelectedUserIds([])
    }

    /**
     * Show the correct result state depending on the loading, error, success state of the API call
     */
    const renderResults = () => {
        if (!search.length) {
            return (
                <div className={styles.centerContent}>
                    <p>Search a Github user by typing something in the search bar.</p>
                </div>
            )
        }

        if (isLoadingResults) {
            return (
                <div className={styles.centerContent}>
                    <Spinner/>
                </div>
            )
        }

        if (searchError) {
            return (
                <div className={styles.centerContent}>
                    <p>{searchError}</p>
                    <button onClick={() => searchUsers(delayedSearch)}>Retry</button>
                </div>
            )
        }

        if (searchResult?.items.length === 0) {
            return (
                <div className={styles.centerContent}>
                    <p>No result for "{delayedSearch}". Please type something else.</p>
                </div>
            )
        }

        return (
            <div className={styles.userGrid}>
                {
                    searchResult?.items.length
                        ? searchResult?.items.map(user =>
                            <CardUser user={user} isSelectable={isEditModeActivated} isSelected={selectedUserIds.includes(user.id)} onToggleSelect={onToggleUser} key={user.id}/>
                        )
                        : null
                }
            </div>
        )
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
                    <label className={styles.editMode}>
                        <input type="checkbox" checked={isEditModeActivated} onChange={e => activateEditMode(e.target.checked)}/> Edit mode ?
                    </label>
                </div>

                {
                    isEditModeActivated && (
                        <div className={styles.actions}>
                            <div>
                                <input type="checkbox" ref={checkAllCheckbox} onChange={onToggleAllUsers}/>
                                <label>{selectedUserIds.length} elements selected</label>
                            </div>

                            <div className={styles.actions__buttons}>
                                <button className={styles.actions__button} type={'button'} onClick={() => duplicateSelection()}>
                                    <IconDuplicate size={24} color={'#333'} />
                                </button>
                                <button className={styles.actions__button} type={'button'} onClick={() => removeSelection()}>
                                    <IconTrash size={24} color={'#333'} />
                                </button>
                            </div>
                        </div>
                    )
                }
                {renderResults()}
            </main>
        </div>
    )
}
