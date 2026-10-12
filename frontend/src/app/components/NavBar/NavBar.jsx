import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Menu, SlidersHorizontal, SunMoon, X } from "lucide-react";
import NavLogo from "../NavLogo/NavLogo";
import { toggleTheme } from "../../../state-management/theme/themeSlice";
import "./NavBar.css";

const MOBILE_BREAKPOINT = 1000;
const DROPDOWN_CLOSE_DELAY = 200;

const NavBar = ({ onIntroDone }) => {
    const dispatch = useDispatch();
    const NAV = useSelector((state) => state.navBar);
    const { pathname, hash } = useLocation();

    const [openMenu, setOpenMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileGroup, setMobileGroup] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const closeTimer = useRef(null);

    const isActive = ({ to, paths }) =>
        to !== undefined
            ? pathname === to
            : Boolean(paths?.some((p) => pathname === p || pathname.startsWith(`${p}/`)));

    const isChildActive = ({ to }) => {
        const [path, anchor] = to.split("#");
        return pathname === path && (!anchor || hash === `#${anchor}`);
    };

    const handleEnter = (label) => {
        clearTimeout(closeTimer.current);
        setOpenMenu(label);
    };

    const handleLeave = () => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpenMenu(null), DROPDOWN_CLOSE_DELAY);
    };

    const handleNavigation = () => {
        clearTimeout(closeTimer.current);
        setOpenMenu(null);
        setMobileOpen(false);
    };

    const toggleMobile = () => {
        if (!mobileOpen) {
            const activeGroup = NAV.find((item) => item.children && isActive(item));
            setMobileGroup(activeGroup?.label ?? null);
        }
        setMobileOpen(!mobileOpen);
    };


    useEffect(() => {
        if (!mobileOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onResize = () => window.innerWidth > MOBILE_BREAKPOINT && setMobileOpen(false);
        window.addEventListener("resize", onResize);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("resize", onResize);
        };
    }, [mobileOpen]);

    
    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const diff = y - last;
            if (y < 40 || diff < -6) setCollapsed(false);
            else if (diff > 6) setCollapsed(true);
            else return;
            last = y;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => () => clearTimeout(closeTimer.current), []);

    return (
        <header className={collapsed ? "nb nb--collapsed" : "nb"}>
            <div className="nb__row">
                <NavLogo onDone={onIntroDone} />
                <nav className="nb__glass">
                    <ul className="nb__list" key={pathname}>
                        {NAV.map((item) =>
                            item.children ? (
                                <li
                                    key={item.label}
                                    className="nb__item"
                                    onMouseEnter={() => handleEnter(item.label)}
                                    onMouseLeave={handleLeave}
                                >
                                    <button
                                        type="button"
                                        className={`nb__link ${isActive(item) ? "active" : ""}`}
                                        onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                                    >
                                        <span className="nb__label">{item.label}</span>
                                        <ChevronDown className="nb__chev" size={14} strokeWidth={2.5} />
                                    </button>

                                    {openMenu === item.label && (
                                        <div className="nb__dropwrap">
                                            <ul className="nb__dropdown" role="menu">
                                                {item.children.map((child) => (
                                                    <li key={child.to} role="none">
                                                        <Link
                                                            to={child.to}
                                                            role="menuitem"
                                                            className={`nb__dlink ${isChildActive(child) ? "active" : ""}`} onClick={handleNavigation}
                                                        >
                                                            <span className="nb__label">{child.label}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ) : (
                                <li key={item.label} className="nb__item">
                                    <Link
                                        to={item.to}
                                        className={`nb__link ${isActive(item) ? "active" : ""}`}
                                        onClick={handleNavigation}
                                    >
                                        <span className="nb__label">{item.label}</span>
                                    </Link>
                                </li>
                            )
                        )}
                    </ul>
                </nav>

                <div className="nb__actions">
                    <button type="button" className="nb__icon">
                        <SlidersHorizontal size={18} />
                    </button>
                    <button type="button" className="nb__icon" onClick={() => dispatch(toggleTheme())}>
                        <SunMoon size={18} />
                    </button>
                    <button type="button" className="nb__icon nb__burger" onClick={toggleMobile}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <>
                    <div className="nb__scrim" onClick={() => setMobileOpen(false)} />

                    <div id="nb-menu" className="nb__menu">
                        <ul className="nb__mlist" key={pathname}>
                            {NAV.map((item) =>
                                item.children ? (
                                    <li key={item.label} className={`nb__mgroup ${mobileGroup === item.label ? "is-open" : ""}`}>
                                        <button
                                            type="button"
                                            className={`nb__mrow ${isActive(item) ? "active" : ""}`} onClick={() => setMobileGroup(mobileGroup === item.label ? null : item.label)}
                                        >
                                            <span className="nb__label">{item.label}</span>
                                            <ChevronDown className="nb__mchev" size={18} strokeWidth={2.5}/>
                                        </button>

                                        <div className="nb__msubwrap">
                                            <ul className="nb__msub">
                                                {item.children.map((child) => (
                                                    <li key={child.to}>
                                                        <Link
                                                            to={child.to}
                                                            className={`nb__mchild ${isChildActive(child) ? "active" : ""}`} onClick={handleNavigation}
                                                        >
                                                            <span className="nb__label">{child.label}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                ) : (
                                    <li key={item.label}>
                                        <Link
                                            to={item.to}
                                            className={`nb__mrow ${isActive(item) ? "active" : ""}`}
                                            onClick={handleNavigation}
                                        >
                                            <span className="nb__label">{item.label}</span>
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </>
            )}
        </header>
    );
};

export default NavBar;