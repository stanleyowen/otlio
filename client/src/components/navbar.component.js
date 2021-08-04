import React, { useEffect, useState } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faUser, faListUl, faSignInAlt, faUsers, faMoon, faSun } from '@fortawesome/free-solid-svg-icons/'

const Navbar = ({ userData }) => {
    const {authenticated, isLoading} = userData
    const theme = localStorage.getItem('theme')
    const [isDark, setTheme] = useState(false)
    const [value_a, setValue_a] = useState([])
    const [value_b, setValue_b] = useState([])
    const [value_c, setValue_c] = useState()

    useEffect(() => {
        if(((!theme || theme === "system") && window.matchMedia('(prefers-color-scheme: dark)').matches) || theme === "dark") {
            if(!theme) localStorage.setItem('theme', 'system')
            setTheme(true)
            document.body.classList.add("dark")
        }
        if(!isLoading && authenticated) {
            setValue_a(['Dashboard','/app', <FontAwesomeIcon icon={faListUl} style={{ fontSize: "1.5em" }} />])
            setValue_b(['Sign Out','/logout', <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: "1.5em" }} />])
            setValue_c(['Account Settings','/account', <FontAwesomeIcon icon={faUser} style={{ fontSize: "1.4em" }} />])
        }else {
            setValue_a(['Login','/login', <FontAwesomeIcon icon={faSignInAlt} style={{ fontSize: "1.5em" }} />])
            setValue_b(['Get Started','/get-started', <FontAwesomeIcon icon={faUsers} style={{ fontSize: "1.5em" }} />])
        }

        window.addEventListener('scroll', e => {
            const nav = document.querySelector('.navbar')
            if(window.pageYOffset > 0) nav.classList.add('navbar-shade')
            else nav.classList.remove('navbar-shade')
        })
    },[userData, theme])

    const toggleNavbar = (e) => {
        e.preventDefault()
        document.getElementById("navbar__menu").classList.toggle("block")
        document.getElementById("navbar-icon").classList.toggle("closeIcon")
    }

    const changeMode = (e) => {
        e.preventDefault()
        document.body.classList.toggle("dark")
        setTheme(document.body.classList.contains('dark') ? true : false)
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light')
    }

    return (
        <div>
            <div className="navbar">
                <a className="navbar__logo" href={authenticated ? '/app':'/'}>Otlio</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href={value_a[1]}>
                        <span className="icons"><Tooltip title={value_a[0] ? value_a[0] : ''}><span>{value_a[2]}</span></Tooltip></span>
                        <span className="description">{value_a[0]}</span>
                    </a>
                    {value_c ? (
                        <a className="animation__underline" id={value_c[0]} href={value_c[1]}>
                        <span className="icons"><Tooltip title={value_c[0] ? value_c[0] : ''}><span>{value_c[2]}</span></Tooltip></span>
                        <span className="description">{value_c[0]}</span>
                    </a>) : null}
                    <a className="animation__underline" id={value_b[0]} href={value_b[1]} onClick={value_b[3]}>
                        <span className="icons"><Tooltip title={value_b[0] ? value_b[0] : ''}><span>{value_b[2]}</span></Tooltip></span>
                        <span className="description">{value_b[0]}</span>
                    </a>
                </div>
                <div className="toggleNavbar">
                    <Tooltip title="Menu"><IconButton onClick={toggleNavbar}>
                        <div className="container-bar" id="navbar-icon">
                            <div className="bar1" />
                            <div className="bar2" />
                            <div className="bar3" />
                        </div>
                    </IconButton></Tooltip>
                </div>
            </div>
		    <Tooltip title="Change Mode"><button className="btn__changeMode" onClick={changeMode}>
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} size="2x" />
            </button></Tooltip>
        </div>
    )
}

export default Navbar