// BookmarksPage.jsx
import React, { useEffect, useState } from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import V1 from '../scrolling_cards/v1';
import styles from './bookmark_page.module.css';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, Link } from 'react-router-dom';


export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState([]);

    const { isDarkMode } = useTheme();

    useEffect(() => {
        const saved = localStorage.getItem('bookmarks');
        if (saved) {
            setBookmarks(JSON.parse(saved));
        }
    }, []);


    // ✅ This will be called by V1 when unbookmark happens
    const handleUnbookmark = (title, question) => {
        const updated = bookmarks.filter(
            b => !(b.title === title && b.question === question)
        );
        localStorage.setItem('bookmarks', JSON.stringify(updated));
        setBookmarks(updated); // re-render!
    };
    // inside your component
    const location = useLocation();
    const from = location.state?.from || '/'; // default to home

    return (
        <div className={`${styles.pageWrapper} ${isDarkMode ? styles.dark : styles.light}`}>
            <div className={styles.header}>
                <Link to={from} className={styles.backBtn}>
                    <ArrowLeftCircle size={20} />
                    <span>Back{from}</span>
                </Link>
                <h1 className={styles.title}>Bookmarked Cards</h1>
            </div>

            {bookmarks.length === 0 ? (
                <div className={styles.emptyBox}>
                    <p className={styles.emptyText}>🕊️ No bookmarks yet.</p>
                    <p className={styles.helperText}>Bookmark your favorite responses/cards to revisit them later.</p>
                </div>
            ) : (

                <div className={styles.wrapper}>
                    {/* First Scroll Column */}
                    <div className={styles.scrollColumn}>
                        <div className={styles.cardGrid}>
                            {bookmarks
                                .filter((_, i) => i % 2 === 0) // even index bookmarks
                                .map((card, idx) => (
                                    <V1
                                        key={`bookmark-left-${idx}`}
                                        {...card}
                                        isBookmarked={true}
                                        onUnbookmark={handleUnbookmark}
                                    />
                                ))}
                        </div>
                    </div>

                    {/* Second Scroll Column */}
                    <div className={styles.scrollColumn}>
                        <div className={styles.cardGrid}>
                            {bookmarks
                                .filter((_, i) => i % 2 !== 0) // odd index bookmarks
                                .map((card, idx) => (
                                    <V1
                                        key={`bookmark-right-${idx}`}
                                        {...card}
                                        isBookmarked={true}
                                        onUnbookmark={handleUnbookmark}
                                    />
                                ))}
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
}