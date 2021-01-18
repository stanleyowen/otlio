import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import getUserToken from '../library/getUserToken';
const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

const redirectLocation = ['/welcome', '/login', '/get-started', '/welcome/', '/login/', '/get-started/'];

const Navbar = ({ location }) => {
    const [value_a, setValue_a] = useState([]);
    const [value_b, setValue_b] = useState([]);
    const [value_c, setValue_c] = useState(false);
    const locations = useLocation();
    useEffect(() => {
        async function getToken() {
            const token = localStorage.getItem('__token')
            getUserToken(token)
            .then(res => {
                if(res && !res.status){
                    localStorage.setItem('__token', res.token);
                    localStorage.setItem('__email', res.email);
                    setValue_a(['Dashboard',`${CLIENT_URL}`]);
                    setValue_b(['Logout','#!',Logout]);
                    setValue_c(<i className="fas fa-plus" style={{fontSize: "2.3em"}}></i>)
                    redirectLocation.forEach(a => {
                        if(locations.pathname === a) window.location='/'; 
                    });
                }else {
                    setValue_a(['Login',`${CLIENT_URL}/login`]);
                    setValue_b(['Get Started',`${CLIENT_URL}/get-started`]);
                    if(locations.pathname === "/") window.location='/welcome';
                }
            })
        }
        getToken();
    },[location]);

    const Logout = (e) => {
        e.preventDefault();
        let itemsToRemove = ["__token", "__email"];
        itemsToRemove.forEach(b => localStorage.removeItem(b));
        window.location = '/login';
    }

    const toggleNavbar = (e) => {
        e.preventDefault();
        var menu = document.getElementById("navbar__menu");
        if(menu.style.display === "block"){
            menu.style.display = "none";
        }else {
            menu.style.display = "block";
        }
    }

    const changeMode = (e) => {
        e.preventDefault();
        document.body.classList.toggle("dark");
        let theme = "light";
        if(document.body.classList.contains("dark")){
            theme = "dark";
        }
        localStorage.setItem("__theme", theme);
    }
    
    return (
        <div>
            <div className="navbar">
                <a className="navbar__logo" href="/">TodoApp</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href={value_a[1]}>{value_a[0]}</a>
                    <a className="animation__underline" id={value_b[0]} href={value_b[1]} onClick={value_b[2]}>{value_b[0]}</a>
                </div>
                <a href="#!" className="toggleNavbar" onClick={toggleNavbar}><i className="fa fa-bars"></i></a>
            </div>
            {value_c !== false ? (<button className="btn__changeMode" aria-label="Add Todo" style={{bottom: '17vh'}}>{value_c}</button>) : null}
		    <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}><i className="fas fa-adjust" style={{fontSize: '2em'}}></i></button>
        </div>
    );
}

export default Navbar;