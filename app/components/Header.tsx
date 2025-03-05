"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../styles/Header.module.css';

const Header = () => {
    const router = useRouter();

    const handleSignOut = () => {
        window.location.href = "https://www.lighthouse247.com/lighthouse/provider/login.php"; // ✅ Redirects to login page
    };

    return (
        <header className={styles.header}>
            <Image src="/images/lighthouse-logo.png" alt="Lighthouse Logo" width={364} height={73} />
            <button className={styles.signOutButton} onClick={handleSignOut}>
                <Image src="/images/sign-out.png" alt="Sign Out" width={200} height={57} />
            </button>
        </header>
    );
};

export default Header;