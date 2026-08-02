import { Link } from "react-router";
import styles from "./Header.module.css";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/">
          <Logo />
        </Link>
      </div>
    </header>
  );
};

export default Header;
