import React, { useState, useEffect } from 'react';
import styles from './asmaul_husna.module.css';
import { useTheme } from '../../context/ThemeContext';

const names = [
    { arabic: 'ٱلرَّحْمَـٰنُ', translit: 'Ar-Raḥmān', meaning: 'The Most Compassionate' },
    { arabic: 'ٱلرَّحِيمُ', translit: 'Ar-Raḥīm', meaning: 'The Most Merciful' },
    { arabic: 'ٱلْمَلِكُ', translit: 'Al-Malik', meaning: 'The Absolute Ruler' },
    { arabic: 'ٱلْقُدُّوسُ', translit: 'Al-Quddūs', meaning: 'The Pure, The Holy' },
    { arabic: 'ٱلسَّلَامُ', translit: 'As-Salām', meaning: 'The Source of Peace, Safety' },
    { arabic: 'ٱلْمُؤْمِنُ', translit: 'Al-Mu’min', meaning: 'The Giver of Faith and Security' },
    { arabic: 'ٱلْمُهَيْمِنُ', translit: 'Al-Muhaymin', meaning: 'The Guardian, The Witness, The Overseer' },
    { arabic: 'ٱلْعَزِيزُ', translit: 'Al-ʿAzīz', meaning: 'The Almighty' },
    { arabic: 'ٱلْجَبَّارُ', translit: 'Al-Jabbār', meaning: 'The Compeller, The Restorer' },
    { arabic: 'ٱلْمُتَكَبِّرُ', translit: 'Al-Mutakabbir', meaning: 'The Supreme, The Majestic' },
    { arabic: 'ٱلْخَالِقُ', translit: 'Al-Khāliq', meaning: 'The Creator, The Maker' },
    { arabic: 'ٱلْبَارِئُ', translit: 'Al-Bāriʾ', meaning: 'The Evolver' },
    { arabic: 'ٱلْمُصَوِّرُ', translit: 'Al-Muṣawwir', meaning: 'The Fashioner' },
    { arabic: 'ٱلْغَفَّارُ', translit: 'Al-Ghaffār', meaning: 'The Constant Forgiver' },
    { arabic: 'ٱلْقَهَّارُ', translit: 'Al-Qahhār', meaning: 'The All-Subduer' },
    { arabic: 'ٱلْوَهَّابُ', translit: 'Al-Wahhāb', meaning: 'The Supreme Bestower' },
    { arabic: 'ٱلرَّزَّاقُ', translit: 'Ar-Razzāq', meaning: 'The Provider' },
    { arabic: 'ٱلْفَتَّاحُ', translit: 'Al-Fattāḥ', meaning: 'The Supreme Opener' },
    { arabic: 'ٱلْعَلِيمُ', translit: 'Al-ʿAlīm', meaning: 'The All-Knowing' },
    { arabic: 'ٱلْقَابِضُ', translit: 'Al-Qābiḍ', meaning: 'The Withholder' },
    { arabic: 'ٱلْبَاسِطُ', translit: 'Al-Bāsiṭ', meaning: 'The Extender' },
    { arabic: 'ٱلْخَافِضُ', translit: 'Al-Khāfiḍ', meaning: 'The Reducer' },
    { arabic: 'ٱلرَّافِعُ', translit: 'Ar-Rāfiʿ', meaning: 'The Exalter, the Elevator' },
    { arabic: 'ٱلْمُعِزُّ', translit: 'Al-Muʿizz', meaning: 'The Honourer, the Bestower' },
    { arabic: 'ٱلْمُذِلُّ', translit: 'Al-Mudhill', meaning: 'The Dishonourer' },
    { arabic: 'ٱلسَّمِيعُ', translit: 'As-Samīʿ', meaning: 'The All-Hearing' },
    { arabic: 'ٱلْبَصِيرُ', translit: 'Al-Baṣīr', meaning: 'The All-Seeing' },
    { arabic: 'ٱلْحَكَمُ', translit: 'Al-Ḥakam', meaning: 'The Impartial Judge' },
    { arabic: 'ٱلْعَدْلُ', translit: 'Al-ʿAdl', meaning: 'The Utterly Just' },
    { arabic: 'ٱلْلَّطِيفُ', translit: 'Al-Laṭīf', meaning: 'The Subtle One, the Most Gentle' },
    { arabic: 'ٱلْخَبِيرُ', translit: 'Al-Khabīr', meaning: 'The All-Aware' },
    { arabic: 'ٱلْحَلِيمُ', translit: 'Al-Ḥalīm', meaning: 'The Most Forbearing' },
    { arabic: 'ٱلْعَظِيمُ', translit: 'Al-ʿAẓīm', meaning: 'The Magnificent, the Infinite' },
    { arabic: 'ٱلْغَفُورُ', translit: 'Al-Ghafūr', meaning: 'The Great Forgiver' },
    { arabic: 'ٱلشَّكُورُ', translit: 'Ash-Shakūr', meaning: 'The Most Appreciative' },
    { arabic: 'ٱلْعَلِيُّ', translit: 'Al-ʿAliyy', meaning: 'The Most High, the Exalted' },
    { arabic: 'ٱلْكَبِيرُ', translit: 'Al-Kabīr', meaning: 'The Most Great' },
    { arabic: 'ٱلْحَفِيظُ', translit: 'Al-Ḥafīẓ', meaning: 'The Preserver' },
    { arabic: 'ٱلْمُقِيتُ', translit: 'Al-Muqīt', meaning: 'The Sustainer' },
    { arabic: 'ٱلْحسِيبُ', translit: 'Al-Ḥasīb', meaning: 'The Reckoner' },
    { arabic: 'ٱلْجَلِيلُ', translit: 'Al-Jalīl', meaning: 'The Majestic' },
    { arabic: 'ٱلْكَرِيمُ', translit: 'Al-Karīm', meaning: 'The Most Generous, the Most Esteemed' },
    { arabic: 'ٱلرَّقِيبُ', translit: 'Ar-Raqīb', meaning: 'The Watchful' },
    { arabic: 'ٱلْمُجِيبُ', translit: 'Al-Mujīb', meaning: 'The Responsive One' },
    { arabic: 'ٱلْوَاسِعُ', translit: 'Al-Wāsiʿ', meaning: 'The All-Encompassing, the Boundless' },
    { arabic: 'ٱلْحَكِيمُ', translit: 'Al-Ḥakīm', meaning: 'The All-Wise' },
    { arabic: 'ٱلْوَدُودُ', translit: 'Al-Wadūd', meaning: 'The Most Loving' },
    { arabic: 'ٱلْمَجِيدُ', translit: 'Al-Majīd', meaning: 'The Glorious, the Most Honorable' },
    { arabic: 'ٱلْبَاعِثُ', translit: 'Al-Bāʿith', meaning: 'The Infuser of New Life' },
    { arabic: 'ٱلشَّهِيدُ', translit: 'Ash-Shahīd', meaning: 'The All-and-Ever Witnessing' },
    { arabic: 'ٱلْحَقُ', translit: 'Al-Ḥaqq', meaning: 'The Absolute Truth' },
    { arabic: 'ٱلْوَكِيلُ', translit: 'Al-Wakīl', meaning: 'The Trustee, the Disposer of Affairs' },
    { arabic: 'ٱلْقَوِيُ', translit: 'Al-Qawwiyy', meaning: 'The All-Strong' },
    { arabic: 'ٱلْمَتِينُ', translit: 'Al-Matīn', meaning: 'The Firm One' },
    { arabic: 'ٱلْوَلِيُّ', translit: 'Al-Waliyy', meaning: 'The Sole Provider' },
    { arabic: 'ٱلْحَمِيدُ', translit: 'Al-Ḥamīd', meaning: 'The Praiseworthy' },
    { arabic: 'ٱلْمُحْصِي', translit: 'Al-Muḥṣī', meaning: 'The All-Enumerating, the Counter' },
    { arabic: 'ٱلْمُبْدِئُ', translit: 'Al-Mubdiʾ', meaning: 'The Originator, the Initiator' },
    { arabic: 'ٱلْمُعِيدُ', translit: 'Al-Muʿīd', meaning: 'The Restorer, the Reinstater' },
    { arabic: 'ٱلْمُحْيِي', translit: 'Al-Muḥyī', meaning: 'The Giver of Life' },
    { arabic: 'ٱلْمُمِيتُ', translit: 'Al-Mumīt', meaning: 'The Creator of Death' },
    { arabic: 'ٱلْحَيُّ', translit: 'Al-Ḥayy', meaning: 'The Ever-Living' },
    { arabic: 'ٱلْقَيُّومُ', translit: 'Al-Qayyūm', meaning: 'The Sustainer, The Self-Subsisting' },
    { arabic: 'ٱلْوَاجِدُ', translit: 'Al-Wājid', meaning: 'The Perceiver' },
    { arabic: 'ٱلْمَاجِدُ', translit: 'Al-Mājid', meaning: 'The Glorious, the Most Honorable' },
    { arabic: 'ٱلْواحِدُ', translit: 'Al-Wāḥid', meaning: 'The Indivisible, the One' },
    { arabic: 'ٱلْأَحَدُ', translit: 'Al-Aḥad', meaning: 'The Infinite, the Only' },
    { arabic: 'ٱلصَّمَدُ', translit: 'As-Ṣamad', meaning: 'The Self-Sufficient, the Impregnable' },
    { arabic: 'ٱلْقَادِرُ', translit: 'Al-Qādir', meaning: 'The Omnipotent' },
    { arabic: 'ٱلْمُقْتَدِرُ', translit: 'Al-Muqtadir', meaning: 'The Creator of All Power' },
    { arabic: 'ٱلْمُقَدِّمُ', translit: 'Al-Muqaddim', meaning: 'The Expediter' },
    { arabic: 'ٱلْمُؤَخِّرُ', translit: 'Al-Muʾakhkhir', meaning: 'The Delayer' },
    { arabic: 'ٱلأوَّلُ', translit: 'Al-ʾAwwal', meaning: 'The First' },
    { arabic: 'ٱلآخِرُ', translit: 'Al-ʾĀkhir', meaning: 'The Last' },
    { arabic: 'ٱلظَّاهِرُ', translit: 'Aẓ-Ẓāhir', meaning: 'The Manifest' },
    { arabic: 'ٱلْبَاطِنُ', translit: 'Al-Bāṭin', meaning: 'The Hidden One, Knower of the Hidden' },
    { arabic: 'ٱلْوَالِي', translit: 'Al-Wālī', meaning: 'The Sole Governor' },
    { arabic: 'ٱلْمُتَعَالِي', translit: 'Al-Mutaʿālī', meaning: 'The Self Exalted' },
    { arabic: 'ٱلْبَرُّ', translit: 'Al-Barr', meaning: 'The Source of All Goodness' },
    { arabic: 'ٱلتَّوَّابُ', translit: 'At-Tawwāb', meaning: 'The Ever-Accepter of Repentance' },
    { arabic: 'ٱلْمُنْتَقِمُ', translit: 'Al-Muntaqim', meaning: 'The Avenger' },
    { arabic: 'ٱلْعَفُوُ', translit: 'Al-ʿAfūw', meaning: 'The Supreme Pardoner' },
    { arabic: 'ٱلرَّؤُوفُ', translit: 'Ar-Raʾūf', meaning: 'The Most Kind' },
    { arabic: 'مَالِكُ ٱلْمُلْكِ', translit: 'Mālik-ul-Mulk', meaning: 'Master and King of the Kingdom' },
    { arabic: 'ذُوالْجَلَالِ وَالإكْرَامِ', translit: 'Dhū-al-Jalāl wa-al-Ikrām', meaning: 'Lord of Glory and Honour, Lord of Majesty and Generosity' },
    { arabic: 'ٱلْمُقْسِطُ', translit: 'Al-Muqsiṭ', meaning: 'The Just One' },
    { arabic: 'ٱلْجَامِعُ', translit: 'Al-Jāmiʿ', meaning: 'The Gatherer, the Uniter' },
    { arabic: 'ٱلْغَنِيُّ', translit: 'Al-Ghaniyy', meaning: 'The Self-Sufficient, the Wealthy' },
    { arabic: 'ٱلْمُغْنِيُّ', translit: 'Al-Mughnī', meaning: 'The Enricher' },
    { arabic: 'ٱلْمَانِعُ', translit: 'Al-Māniʿ', meaning: 'The Withholder' },
    { arabic: 'ٱلضَّارَ', translit: 'Aḍ-Ḍārr', meaning: 'Distresser' },
    { arabic: 'ٱلنَّافِعُ', translit: 'An-Nāfiʿ', meaning: 'The Propitious, the Benefactor' },
    { arabic: 'ٱلنُّورُ', translit: 'An-Nūr', meaning: 'The Light, the Illuminator' },
    { arabic: 'ٱلْهَادِي', translit: 'Al-Hādī', meaning: 'The Guide' },
    { arabic: 'ٱلْبَدِيعُ', translit: 'Al-Badīʿ', meaning: 'The Incomparable Originator' },
    { arabic: 'ٱلْبَاقِي', translit: 'Al-Bāqī', meaning: 'The Everlasting' },
    { arabic: 'ٱلْوَارِثُ', translit: 'Al-Wārith', meaning: 'The Inheritor, the Heir' },
    { arabic: 'ٱلرَّشِيدُ', translit: 'Ar-Rashīd', meaning: 'The Guide, Infallible Teacher, and Knower' },
    { arabic: 'ٱلصَّبُورُ', translit: 'Aṣ-Ṣabūr', meaning: 'The Timeless, the Patient' }
];


const AsmaulHusna = () => {
    const { isDarkMode, setIsDarkMode } = useTheme();

    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // Start fade-out
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % names.length);
                setFade(true); // Fade-in new name
            }, 300); // fade duration matches CSS
        }, 6000); // 6 seconds

        return () => clearInterval(interval);
    }, []);

    const current = names[index];

    return (
        <div className={`${styles.right_panel_base} ${isDarkMode ? styles.dark : styles.light}`}>
            <div className={styles.right_panel_top}>
                <h2>Al-Asma al-Husna</h2>
                <p>Names of Allah</p>
                <div className={`${styles.name_block} ${fade ? styles.fadeIn : styles.fadeOut}`}>
                    <p className={styles.arabic}>{current.arabic}</p>
                    <p className={styles.translit}>{current.translit}</p>
                    <p className={styles.meaning}>{current.meaning}</p>
                </div>
            </div>
        </div>
    );
};

export default AsmaulHusna;
