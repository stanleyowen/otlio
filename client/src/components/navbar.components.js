/* eslint-disable */
import React, { useEffect, useState } from 'react';
import getUserToken from '../library/getUserToken';
import { useLocation } from 'react-router-dom';
import { setNotification, NOTIFICATION_TYPES, setWarning } from '../library/setNotification';

const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

const redirectRoute = ['welcome', 'login', 'get-started'];
const privateRoute = ['', 'edit'];

const Navbar = () => {
    const location = useLocation();
    const [value_a, setValue_a] = useState([]);
    const [value_b, setValue_b] = useState([]);
    const [value_c, setValue_c] = useState();
    const [value_d, setValue_d] = useState(false);
    
    useEffect(() => {
        async function getToken() {
            const token = localStorage.getItem('__token');
            const userId = localStorage.getItem('__id');
            if(token && userId){
                getUserToken(token, userId)
                .then(res => {
                    if(res){
                        localStorage.setItem('__email', res.email);
                        setValue_a(['Dashboard',`${CLIENT_URL}`]);
                        setValue_b(['Logout','#!',Logout]);
                        setValue_c('/')
                        setValue_d(<i className="fas fa-plus" style={{fontSize: "2.2em"}}></i>)
                        redirectRoute.forEach(a => {
                            if(location.pathname.split('/')[1] === a) window.location='/';
                        });
                    }else {
                        setValue_a(['Login',`${CLIENT_URL}/login`]);
                        setValue_b(['Get Started',`${CLIENT_URL}/get-started`]);
                        setValue_c('/welcome');
                        localStorage.removeItem('__id');
                        localStorage.removeItem('__token');
                        localStorage.removeItem('__email');
                        privateRoute.forEach(a => {
                            if(location.pathname.split('/')[1] === a) window.location='/welcome';
                        });
                    }
                })
            }else {
                setValue_a(['Login',`${CLIENT_URL}/login`]);
                setValue_b(['Get Started',`${CLIENT_URL}/get-started`]);
                setValue_c('/welcome');
                privateRoute.forEach(a => {
                    if(location.pathname.split('/')[1] === a) window.location='/welcome';
                });
            }
        }
        getToken();
        setWarning();
    },[]);

    const Logout = (e) => {
        e.preventDefault();
        let itemsToRemove = ["__token", "__email", "__id"];
        itemsToRemove.forEach(a => localStorage.removeItem(a));
        window.location = '/login';
    }

    const addTodo = (e) => {
        e.preventDefault();
        const modal = document.getElementById('addTodoModal');
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
    }

    const toggleNavbar = (e) => {
        e.preventDefault();
        var menu = document.getElementById("navbar__menu");
        if(menu.style.display === "block"){ menu.style.display = "none"; }
        else{ menu.style.display = "block"; }
    }

    const changeMode = (e) => {
        /*document.body.classList.toggle("dark");
        let theme = "light";
        if(document.body.classList.contains("dark")){
            theme = "dark";
        }
        localStorage.setItem("__theme", theme);*/
        e.preventDefault();
        setNotification(NOTIFICATION_TYPES.SUCCESS, "Dark Mode is will be available in v0.1.4! Stay Tune!");
    }
    
    return (
        <div>
            <div className="navbar">
                <a className="navbar__logo" href={value_c}>TodoApp</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href={value_a[1]}>{value_a[0]}</a>
                    <a className="animation__underline" id={value_b[0]} href={value_b[1]} onClick={value_b[2]}>{value_b[0]}</a>
                </div>
                <a href="#!" className="toggleNavbar" onClick={toggleNavbar}><i className="fa fa-bars"></i></a>
            </div>
            {value_d !== false ? (<button className="btn__changeMode" aria-label="Add Todo" onClick={addTodo} id="addTodo" style={{bottom: '17vh'}}>{value_d}</button>) : null}
		    <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}><i className="fas fa-adjust" style={{fontSize: '2em'}}></i></button>
            <div className="notifications" id="notifications"></div>
        </div>
    );
}

export default Navbar;