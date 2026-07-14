import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause } from 'lucide-react';
import styles from './know_your_deen.module.css'
import Logo from '../../assets/logo.png'
import { LayoutDashboard, BookOpen, MessageCircleQuestion, FileText, ListChecks, CircleHelp, BookText, Wrench, FolderKanban, ShieldCheck, TerminalSquare, MoonStar, BadgeCheck } from 'lucide-react';
import V1 from '../scrolling_cards/v1'
import BookmarkIcon from '../../assets/bookmark_icon.png'
import QuranIcon from '../../assets/quran_icon.png'
import FirstKalimahIcon from '../../assets/first_kalimah.png';
import HadithIcon from '../../assets/muhammad_icon.png'
import BookmarkPage from '../bookmark_page/bookmark_page'
import knowYourDeenCards from '../../data/know_your_deen_cards.json';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, Link } from 'react-router-dom';
import AsmaulHusna from '../names_of_allah_page/AsmaulHusna';


import s2v2 from '/quran_recitation_audio/s2v2.mp3'
const know_your_deen = () => {

    const { isDarkMode, setIsDarkMode } = useTheme();


    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarks, setShowBookmarks] = useState(false);

    // 2. Handler passed into each V1 card
    const handleBookmark = (cardData) => {
        setBookmarks(prev => {
            const isAlreadyBookmarked = prev.find(
                item => item.title === cardData.title && item.question === cardData.question
            );
            if (!isAlreadyBookmarked) {
                const updated = [...prev, cardData];
                localStorage.setItem('bookmarks', JSON.stringify(updated));

                // Move card to end
                setShuffledCards(prevCards => {
                    const filtered = prevCards.filter(
                        c => !(c.title === cardData.title && c.question === cardData.question)
                    );
                    return [...filtered, cardData];
                });

                return updated;
            }
            return prev;
        });
    };
    const handleUnbookmark = (cardData) => {
        setBookmarks(prev => {
            const updated = prev.filter(
                item => !(item.title === cardData.title && item.question === cardData.question)
            );
            localStorage.setItem('bookmarks', JSON.stringify(updated));

            // Reinsert card at random position
            setShuffledCards(prevCards => {
                const filtered = prevCards.filter(
                    c => !(c.title === cardData.title && c.question === cardData.question)
                );
                const newCards = [...filtered];
                const insertAt = Math.floor(Math.random() * (newCards.length + 1));
                newCards.splice(insertAt, 0, cardData);
                return newCards;
            });

            return updated;
        });
    };




    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio) {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };


    // ---------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------
    const [hijriDate, setHijriDate] = useState('');
    const [nextNamaz, setNextNamaz] = useState('');
    const [countdown, setCountdown] = useState('');
    useEffect(() => {
        const getUserCoordinates = (callback) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        callback({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    },
                    () => callback({ lat: 21.4225, lon: 39.8262 }) // fallback
                );
            } else {
                callback({ lat: 21.4225, lon: 39.8262 });
            }
        };

        const fetchNamazAndHijri = async ({ lat, lon }) => {
            try {
                const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
                const data = await response.json();
                const timings = data.data.timings;
                const hijri = data.data.date.hijri;

                setHijriDate(`${hijri.day} ${hijri.month.en}, ${hijri.year} AH`);

                const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
                const now = new Date();

                for (let prayer of prayerOrder) {
                    const [h, m] = timings[prayer].split(":");
                    const prayerTime = new Date();
                    prayerTime.setHours(parseInt(h));
                    prayerTime.setMinutes(parseInt(m));
                    prayerTime.setSeconds(0);
                    if (prayerTime > now) {
                        const formattedTime = prayerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        setNextNamaz(`${prayer} at ${formattedTime}`);
                        // Start countdown interval
                        const interval = setInterval(() => {
                            const now = new Date();
                            const diff = prayerTime - now;

                            if (diff <= 0) {
                                clearInterval(interval);
                                setCountdown('Now');
                                return;
                            }

                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                            setCountdown(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s left`);
                        }, 1000);
                        return;
                    }
                }
                setNextNamaz(`Fajr at ${timings.Fajr} (tomorrow)`);
            } catch (error) {
                setHijriDate('Hijri unavailable');
                setNextNamaz('Namaz times unavailable');
            }
        };

        getUserCoordinates(fetchNamazAndHijri);
    }, []);

    // ---------------------------------------------------------------------------------------------------
    // Shuffle once when component mounts
    const [shuffledCards, setShuffledCards] = useState([]);

    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const bookmarkedKeys = new Set(bookmarks.map(card => card.title + card.question));

        const nonBookmarked = knowYourDeenCards.filter(card => !bookmarkedKeys.has(card.title + card.question));
        const bookmarked = knowYourDeenCards.filter(card => bookmarkedKeys.has(card.title + card.question));

        const shuffled = [...nonBookmarked];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setShuffledCards([...shuffled, ...bookmarked]);
    }, []);
    // inside your component
    const location = useLocation();
    const from = location.state?.from || '/'; // default to home

    // ---------------------------------------------------------------------------------------------------
    return (
        <>
            <div className={`${styles.basediv} ${isDarkMode ? styles.dark : styles.light}`}>

                {/* -------------Navigation Bar Starts------------- */}
                <div className={styles.top_horizontal_element_base}>
                    <div className={styles.logo}>
                        <img src={Logo} alt="Logo" />;
                        <h3>SAWT AL-RADD</h3>
                    </div>

                    {/* <div className={styles.ai_search}>
                        <input type="search" name="" id="" placeholder='Search' />
                    </div>

                    <div className={styles.chat_ai}>
                        <input type="text" name="" id="" placeholder='AI Chat Assistant' />
                    </div> */}

                    <div className={styles.hijri_namaz_wrapper}>

                        <div className={styles.namaz_time}>
                            Salatul {nextNamaz} {countdown && `( ${countdown} )`}
                        </div>

                        <div className={styles.hijri_date}>
                            <span>Hijri ( Islamic Date ) : </span>{hijriDate}
                        </div>

                    </div>


                    {/* <div className={styles.bookmark}>
                        <img src={BookmarkIcon} alt="Bookmark Icon" className={styles.bookmark_icon} style={{ width: 22 }} />
                    </div> */}

                    <div className={styles.kalimah_display}>
                        <img src={FirstKalimahIcon} alt="Quran" className={styles.first_kalimah_icon} />

                    </div>
                </div>
                {/* --------------Navigation Bar Ends-------------- */}


                {/* -------------Content Panel Starts------------- */}
                <div className={styles.content_panel_base}>

                    {/* -------------Left Panel Starts------------- */}
                    <div className={styles.left_panel_base}>
                        <div className={styles.button_set_top}>
                            <Link to="/"><button className={styles.left_panel_button}><BookOpen size={18} /> Back to Home</button></Link>
                            <button className={styles.left_panel_button}><LayoutDashboard size={18} /> Revelation of Qur'an</button>
                            <button className={styles.left_panel_button}><MessageCircleQuestion size={18} /> Compilation of Ahadith</button>
                            <button className={styles.left_panel_button}><ListChecks size={18} /> The Voice of Response</button>
                            <button className={styles.left_panel_button}><FileText size={18} /> Haalat-e-Muslimah</button>
                            <button className={styles.left_panel_button}><CircleHelp size={18} /> Ayat to Remember</button>
                            <button className={styles.left_panel_button}><BookText size={18} /> Must know Ahadith</button>
                            <Link to="/bookmarks" state={{ from: location.pathname }}><button className={styles.left_panel_button}><BookOpen size={18} /> Bookmarks</button></Link>
                            <button className={styles.left_panel_button}><Wrench size={18} /> Resources</button>
                        </div>
                        <div className={styles.button_set_bottom}>
                            <button className={styles.left_panel_button} onClick={() => setIsDarkMode(!isDarkMode)}><MoonStar size={18} /> Dark Light Adaptation</button>
                            {/* <button className={styles.left_panel_button}><ShieldCheck size={18} /> Admin Panel (Logout)</button> */}
                        </div>
                        <div className={styles.authenticityMark}> <strong>Sawt al-Radd</strong> &copy; 2025. All rights reserved.</div>
                    </div>
                    {/* -------------Left Panel Ends------------- */}

                    {/* -------------Center Panel Starts------------- */}
                    <div className={styles.center_panel_base}>

                        {shuffledCards.map((card, idx) => (
                            <V1
                                key={idx}
                                {...card}
                                onBookmark={handleBookmark}
                                onUnbookmark={handleUnbookmark}
                                isBookmarked={bookmarks.some(b => b.title === card.title && b.question === card.question)}
                            />
                        ))}
                    </div>
                    {/* -------------Center Panel Ends------------- */}

                    {/* -------------Center Panel Starts------------- */}
                    <div className={styles.right_panel_base}>
                        <AsmaulHusna />
                    </div>
                    {/* -------------Center Panel Ends------------- */}

                </div>
                {/* -------------Content Panel Ends------------- */}

            </div>
        </>
    )
}

export default know_your_deen
