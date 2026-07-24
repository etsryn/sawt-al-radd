import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import styles from './landing.module.css'
import Logo from '../../assets/logo.png'
import { LayoutDashboard, BookOpen, MessageCircleQuestion, FileText, ListChecks, CircleHelp, BookText, Wrench, FolderKanban, ShieldCheck, TerminalSquare, MoonStar, BadgeCheck } from 'lucide-react';
import V1 from '../scrolling_cards/v1'
import QuranIcon from '../../assets/quran_icon.png'
import FirstKalimahIcon from '../../assets/first_kalimah.png';
import HadithIcon from '../../assets/muhammad_icon.png'
import landingCards from '../../data/landing_cards.json';
import s2v2 from '/quran_recitation_audio/s2v2.mp3'

import { useTheme } from '../../context/ThemeContext';

const landing = () => {

    const { isDarkMode, setIsDarkMode } = useTheme();

    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarks, setShowBookmarks] = useState(false);

    // 2. Handler passed into each V1 card
    const handleBookmark = (cardData) => {
        setBookmarks(prev => {
            const already = prev.find(item => item.title === cardData.title && item.question === cardData.question);
            if (!already) {
                const updated = [...prev, cardData];
                localStorage.setItem('bookmarks', JSON.stringify(updated));

                // Move to bottom
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

            // Reinsert at random position
            setShuffledCards(prevCards => {
                const filtered = prevCards.filter(
                    c => !(c.title === cardData.title && c.question === cardData.question)
                );
                const insertAt = Math.floor(Math.random() * (filtered.length + 1));
                const newCards = [...filtered];
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

        const nonBookmarked = landingCards.filter(card => !bookmarkedKeys.has(card.title + card.question));
        const bookmarked = landingCards.filter(card => bookmarkedKeys.has(card.title + card.question));

        const shuffled = [...nonBookmarked];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setShuffledCards([...shuffled, ...bookmarked]);
    }, []);

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
                            <Link to="/know-your-deen"><button className={styles.left_panel_button}><BookOpen size={18} /> Know your Deen</button></Link>
                            <button className={styles.left_panel_button}><LayoutDashboard size={18} /> Revelation of Qur'an</button>
                            <button className={styles.left_panel_button}><MessageCircleQuestion size={18} /> Architectures by Ummah</button>
                            <button className={styles.left_panel_button}><ListChecks size={18} /> The Voice of Response</button>
                            <button className={styles.left_panel_button}><FileText size={18} /> Haalat-e-Muslimah</button>
                            <button className={styles.left_panel_button}><CircleHelp size={18} /> Ayat to Remember</button>
                            <button className={styles.left_panel_button}><BookText size={18} /> Must know Ahadith</button>
                            <Link to="/bookmarks" state={{ from: location.pathname }}><button className={styles.left_panel_button}><BookOpen size={18} /> Bookmarks</button></Link>
                            <button className={styles.left_panel_button}><Wrench size={18} /> Resources</button>
                        </div>
                        <div className={styles.button_set_bottom}>
                            <button className={styles.left_panel_button} onClick={() => setIsDarkMode(prev => !prev)}><MoonStar size={18} /> Dark Light Adaptation</button>
                            <button className={styles.left_panel_button}><ShieldCheck size={18} /> Admin Panel (Logout)</button>
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
                        <div className={styles.right_panel_top_quran}>
                            <div className={styles.container}>
                                <div className={styles.header_label}>
                                    <h3><img src={QuranIcon} alt="Quran" className={styles.quran_icon} style={{ width: '1.4vw' }} />Quranic Verse</h3>
                                </div>
                                <div className={styles.content_quran}>
                                    <p className={styles.content_arabic}>ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ٢</p>
                                    <p className={styles.content_english}>This is the Book! There is no doubt about it—a guide for those mindful ˹of Allah˺.</p>

                                    <div className={styles.customAudioContainer}>
                                        <audio
                                            ref={audioRef}
                                            src={s2v2}
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={() => {
                                                if (audioRef.current) {
                                                    setDuration(audioRef.current.duration);
                                                }
                                            }}
                                            onEnded={() => {
                                                setIsPlaying(false);
                                                setProgress(0);
                                                setCurrentTime(0);
                                                if (audioRef.current) {
                                                    audioRef.current.currentTime = 0;
                                                }
                                            }}
                                        />

                                        <div className={styles.controls}>
                                            <button onClick={togglePlay} className={styles.playPauseBtn}>
                                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                            </button>

                                            <div className={styles.progressBar}>
                                                <div className={styles.progress} style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <div className={styles.audioTime}>
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className={styles.right_panel_middle_hadith}>
                            <div className={styles.container}>
                                <div className={styles.header_label}>
                                    <h3><img src={HadithIcon} alt="Quran" className={styles.muhammad_icon} style={{ width: '1.8vw' }} />Hadith of the day</h3>
                                </div>
                                <div className={styles.content_hadith}>
                                    <p className={styles.content_arabic}>الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ</p>
                                    <p className={styles.content_english}>The Prophet (ﷺ) said, "A Muslim is the one who avoids harming Muslims with his tongue and hands. And a Muhajir (emigrant) is the one who gives up (abandons) all what Allah has forbidden."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* -------------Center Panel Ends------------- */}

                </div>
                {/* -------------Content Panel Ends------------- */}

            </div>
        </>
    )
}

export default landing
