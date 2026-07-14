import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import styles from './v1.module.css';
import QuranIcon from '../../assets/quran_icon.png';
import MuhammadIcon from '../../assets/muhammad_icon.png';
import LogicBulbIcon from '../../assets/logic_bulb_icon.png';
import VideoIcon from '../../assets/video_icon.png';
import NarratorIcon from '../../assets/Narrator_icon.png';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';


export default function V1({
    title,
    question,
    chain_of_narrator,
    authentic_hadith,
    authentic_hadith_arabic,
    clear_answer,
    clear_answer_tag,
    reference_number,
    in_book_reference_number,
    verify_on,
    verification_method,
    logic_source,
    logic_authenticity,
    logic_statement,
    bismillah,
    ayah_references = [],
    hadith,
    quran,
    logic,
    video,
    default_tab_priority,
    onUnbookmark
}) {
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('');
    const [bookmarked, setBookmarked] = useState(false);
    const [isUnbookmarking, setIsUnbookmarking] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [hasEnded, setHasEnded] = useState(false);

    const [selectedAyahIndex, setSelectedAyahIndex] = useState(0);
    const selectedAyah = ayah_references[selectedAyahIndex] || null;
    useEffect(() => {
        if (ayah_references.length > 0 && selectedAyahIndex >= ayah_references.length) {
            setSelectedAyahIndex(0); // fallback to 0 if out of range
        }
    }, [ayah_references]);

    const { isDarkMode } = useTheme();





    const tabs = [];
    if (quran === 'true') tabs.push({ name: 'Quran', icon: <img src={QuranIcon} alt="Quran" className={styles.quran_icon} style={{ width: '1.4vw' }} /> });
    if (hadith === 'true') tabs.push({ name: 'Hadith', icon: <img src={MuhammadIcon} alt="Muhammad" className={styles.muhammad_icon} style={{ width: '1.6vw' }} /> });
    if (logic === 'true') tabs.push({ name: 'Logic', icon: <img src={LogicBulbIcon} alt="LogicBulbIcon" className={styles.logic_bulb_icon} style={{ width: '1.6vw' }} /> });
    if (video === 'true') tabs.push({ name: 'Video', icon: <img src={VideoIcon} alt="Video Icon" className={styles.video_icon} style={{ width: '1.6vw' }} /> });

    useEffect(() => {
        if (!activeTab) {
            const availableTabs = {
                Quran: quran === 'true',
                Hadith: hadith === 'true',
                Logic: logic === 'true',
                Video: video === 'true'
            };

            const priorityList = Array.isArray(default_tab_priority)
                ? default_tab_priority
                : ['Quran', 'Hadith', 'Logic', 'Video']; // fallback

            for (let tab of priorityList) {
                if (availableTabs[tab]) {
                    setActiveTab(tab);
                    break;
                }
            }
        }
    }, [quran, hadith, logic, video, default_tab_priority]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev < 1 ? prev + 0.0025 : 1));
        }, 150);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const exists = saved.some((c) => c.title === title && c.question === question);
        setBookmarked(exists);
    }, [title, question]);

    const handleToggleBookmark = () => {
        const cardData = {
            title,
            question,
            chain_of_narrator,
            authentic_hadith,
            authentic_hadith_arabic,
            clear_answer,
            clear_answer_tag,
            reference_number,
            in_book_reference_number,
            verify_on,
            verification_method,
            logic_source,
            logic_authenticity,
            logic_statement,
            bismillah,
            ayah_references,
            hadith,
            quran,
            logic,
            video,
            default_tab_priority,
        };

        const saved = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const exists = saved.some((c) => c.title === title && c.question === question);

        if (exists) {
            setIsUnbookmarking(true);
            setTimeout(() => {
                const updated = saved.filter((c) => !(c.title === title && c.question === question));
                localStorage.setItem('bookmarks', JSON.stringify(updated));
                setBookmarked(false);
                setIsUnbookmarking(false);
                if (onUnbookmark) onUnbookmark(title, question); // ✅ FIXED LINE
            }, 600);
        } else {
            setIsBookmarking(true); // start buffering
            setTimeout(() => {
                const updated = [...saved, cardData];
                localStorage.setItem('bookmarks', JSON.stringify(updated));
                setBookmarked(true);
                setIsBookmarking(false); // stop buffering
            }, 600);
        }
    };



    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, audioSetProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
            setHasEnded(false);
        }
        setIsPlaying(!isPlaying);
    };
    const handleRestart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setIsPlaying(true);
            setHasEnded(false);
            setHighlightedIndex(null);
        }
    };

    const timestamp_from = useMemo(() => {
        const times = selectedAyah?.segments_time;
        if (!Array.isArray(times) || times.length === 0 || !Array.isArray(times[0]) || times[0].length < 2) return 0;
        return times[0][1];
    }, [selectedAyah]);


    const adjustedSegments = useMemo(() => {
        const times = Array.isArray(selectedAyah?.segments_time) ? selectedAyah.segments_time : [];
        return times
            .filter(seg => Array.isArray(seg) && seg.length >= 3)
            .map(([idx, start, end]) => [
                idx - 1,
                start - timestamp_from,
                end - timestamp_from,
            ]);
    }, [selectedAyah, timestamp_from]);



    const handleTimeUpdate = () => {
        if (hasEnded) return;
        const audio = audioRef.current;
        if (!audio) return;

        const current = audio.currentTime;
        const currentMs = current * 1000;

        // update progress bar & time state
        setCurrentTime(current);
        audioSetProgress((current / audio.duration) * 100);

        // find the last word whose start time is <= currentMs
        let idx = null;
        for (let [i, start/*, end*/] of adjustedSegments) {
            if (currentMs >= start) {
                idx = i;
            } else {
                break;
            }
        }

        setHighlightedIndex(idx);
    };


    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };


    const handleWordClick = (index) => {
        const [_, start] = adjustedSegments[index];
        if (audioRef.current) {
            audioRef.current.currentTime = start / 1000;

            audioRef.current.play();
            setIsPlaying(true);
            setHasEnded(false);
        }
    };
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                if (highlightedIndex !== null && highlightedIndex < adjustedSegments.length - 1) {
                    handleWordClick(highlightedIndex + 1);
                }
            }
            if (e.key === 'ArrowLeft') {
                if (highlightedIndex !== null && highlightedIndex > 0) {
                    handleWordClick(highlightedIndex - 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [highlightedIndex, adjustedSegments]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', onEnded);
        return () => audio.removeEventListener('ended', onEnded);
    }, []);

    return (
        <div className={`${styles.cardWrapper} ${isDarkMode ? styles.darkCard : styles.light}`}>
            <h2 className={styles.question}>{question}</h2>

            <div className={styles.tabRow}>
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        className={`${styles.tab} ${activeTab === tab.name ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.name)}
                    >
                        {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
                        {tab.name}
                    </button>
                ))}
            </div>

            {activeTab === 'Hadith' && (
                <div className={styles.answerBox}>
                    <div className={styles.sectionLabel}>
                        <img src={NarratorIcon} alt="Narrator Icon" className={styles.narrator_icon} style={{ width: 20 }} />
                        {chain_of_narrator}
                    </div>
                    <div className={styles.mainText}>
                        {(authentic_hadith || '').split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </div>
                    <p className={styles.mainText_arabic}>{authentic_hadith_arabic}</p>
                    {clear_answer_tag !== "none" && (
                        <div className={styles.conclusion}>
                            <div className={styles.sectionLabel}><img src={LogicBulbIcon} alt="LogicBulbIcon" className={styles.logic_bulb_icon} style={{ width: '1.3vw', top: '2px' }} />{clear_answer_tag}</div>
                            {(clear_answer || '').split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                            {/* {clear_answer} */}
                        </div>
                    )}
                    <div className={styles.references}>
                        <table className={styles.invisibleTable}>
                            <tbody>
                                <tr>
                                    <td><b>Reference</b></td>
                                    <td><b>:</b> <span style={{ color: '#50A3A3', fontWeight: 600 }}>{reference_number}</span></td>
                                </tr>
                                <tr>
                                    <td><b>In-book reference</b></td>
                                    <td><b>:</b> {in_book_reference_number}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.verificationBox}>
                        <a
                            href={verify_on}
                            className={styles.verifyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Verify Hadith Source
                        </a>
                        <p className={styles.verificationMethod}>({verification_method})</p>
                    </div>
                </div>
            )}

            {activeTab === 'Logic' && logic === 'true' && (
                <div className={styles.logicBox}>

                    <div className={styles.sectionLabel}>{logic_source}</div>

                    <div className={styles.logicSource}>{logic_authenticity}</div>

                    <div className={styles.logic_design}
                        dangerouslySetInnerHTML={{ __html: logic_statement.replace(/\n/g, '<br />') }}
                    />

                </div>
            )}

            {activeTab === 'Quran' && (
                <>
                    {ayah_references.length > 1 && (
                        <div className={styles.subTabRow}>
                            {ayah_references.map((ayah, index) => (
                                <button
                                    key={index}
                                    className={`${styles.subTab} ${index === selectedAyahIndex ? styles.activeSubTab : ''}`}
                                    onClick={() => setSelectedAyahIndex(index)}
                                >
                                    <span>
                                        {ayah.surah_name} ({ayah.surah_number}:{ayah.ayah_number})
                                    </span>

                                </button>
                            ))}
                        </div>
                    )}
                    < div className={styles.answerBox}>
                        <div className={styles.sectionLabel_quran}>
                            {bismillah} {/* Bismillah Hir Rahman nir Rahim */}<img src={NarratorIcon} alt="Narrator Icon" className={styles.narrator_icon} style={{ width: 20 }} />
                        </div>

                        <p className={styles.mainText_arabic}>
                            {Array.isArray(selectedAyah?.segment_word) &&
                                selectedAyah.segment_word.map((wordArray, index) => (
                                    Array.isArray(wordArray) && wordArray.length > 0 ? (
                                        <span
                                            key={index}
                                            onClick={() => handleWordClick(index)}
                                            className={`${styles.word} ${highlightedIndex === index ? styles.highlight : ''}`}
                                        >
                                            {wordArray[0]}{" "}

                                        </span>
                                    ) : null
                                ))}

                        </p>



                        <div className={styles.mainText}> {/* English Translation */}
                            {(selectedAyah?.ayah_translation_english || '').split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </div>

                        {selectedAyah?.ayah_audio && (
                            <div className={styles.customAudioContainer}>
                                <audio
                                    ref={audioRef}
                                    src={selectedAyah.ayah_audio}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={() => {
                                        if (audioRef.current) {
                                            setDuration(audioRef.current.duration);
                                        }
                                    }}
                                    onPlay={() => {
                                        setHasEnded(false); // ✅ always enable updates when audio starts
                                    }}
                                    onEnded={() => {
                                        setIsPlaying(false);
                                        audioSetProgress(0);
                                        setCurrentTime(0);
                                        setHasEnded(true); // flag it as ended
                                        setHighlightedIndex(null)
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = 0;
                                        }
                                    }}
                                />


                                <div className={styles.controls}>
                                    <button onClick={togglePlay} className={styles.playPauseBtn}>
                                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                    </button>

                                    {/* <div className={styles.progressBar}>
                                    <div className={styles.progress} style={{ width: `${audioProgress}%` }}></div>
                                </div> */}
                                    <div
                                        className={styles.progressBar}
                                        onClick={(e) => {
                                            if (!audioRef.current) return;

                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickX = e.clientX - rect.left;
                                            const clickedRatio = clickX / rect.width;
                                            const newTime = clickedRatio * audioRef.current.duration;

                                            audioRef.current.currentTime = newTime;
                                            audioSetProgress(clickedRatio * 100);
                                            setCurrentTime(newTime);

                                            if (!isPlaying) {
                                                audioRef.current.play();
                                                setIsPlaying(true);
                                            }
                                        }}
                                    >
                                        <div className={styles.progress} style={{ width: `${audioProgress}%` }}></div>
                                    </div>


                                    <div className={styles.audioTime}>
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </div>
                                    <button onClick={handleRestart} className={styles.restartButton}>
                                        <RotateCcw size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.references}>
                            <table className={styles.invisibleTable}>
                                <tbody>
                                    <tr>
                                        <td>
                                            <b>Reference</b>
                                        </td>
                                        <td>
                                            <b>:</b>{' '}
                                            <span style={{ color: '#50A3A3', fontWeight: 600 }}>
                                                Surah {selectedAyah?.surah_name} ({selectedAyah?.surah_number}), Ayah {selectedAyah?.ayah_number}
                                                {selectedAyah?.ayah_name_if_any?.toLowerCase() !== 'none' && (
                                                    <> — Ayah Name: {selectedAyah?.ayah_name_if_any}</>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>


                        <div className={styles.verificationBox}> {/* Verify Quran source */}
                            <a
                                href={selectedAyah?.ayah_verify_on}
                                className={styles.verifyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Verify Ayah Source
                            </a>
                            <p className={styles.verificationMethod}>({selectedAyah?.ayah_verification_method})</p>
                        </div>
                    </div>
                </>
            )
            }

            {
                activeTab === 'Video' && (
                    <div className={styles.videoBox}>
                        <p className={styles.placeholder}>Video section content goes here.</p>
                    </div>
                )
            }

            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={handleToggleBookmark} disabled={isUnbookmarking || isBookmarking}>
                    {isUnbookmarking ? (
                        <span className={styles.loadingDots}>⏳ Unbookmarking...</span>
                    ) : isBookmarking ? (
                        <span className={styles.loadingDots}>⏳ Bookmarking...</span>
                    ) : (
                        <>
                            {bookmarked ? (
                                <>
                                    <BookmarkCheck className={styles.bookmarkcheck_icon} />
                                    Un-Bookmark
                                </>
                            ) : (
                                <>
                                    <Bookmark className={styles.bookmark_icon} />
                                    Bookmark
                                </>
                            )}
                        </>
                    )}
                </button>

            </div>

            <p className={styles.disclaimer}>
                Content displayed above is from authentic sources only, yet lacks some context. Be aware when using it from your own perspective <span style={{ color: 'maroon' }}>*</span>
            </p>
        </div >
    );
}