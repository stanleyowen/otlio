import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DateFnsUtils from "@date-io/date-fns";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import axios from 'axios';

import { labels, validateLabel, getCSRFToken } from '../libraries/validation';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Edit = ({ userData }) => {
    let isDiffer = false;
    const {authenticated, isLoading} = userData;
    const {id} = useParams();
    const [honeypot, setHoneypot] = useState();
    const [data, setData] = useState({});
    const [title, setTitle] = useState();
    const [date, setDate] = useState(new Date(null));
    const [description, setDescription] = useState();
    const [label, setLabel] = useState(labels[0].toLowerCase());
    const [isFetching, setFetching] = useState(true);

    useEffect(() => {
        async function getData() {
            await axios.get(`${SERVER_URL}/todo/data`, { params: {id}, withCredentials: true })
            .then(res => {
                setTitle(res.data.title);
                setDate(res.data.date);
                setDescription(res.data.description);
                setLabel(res.data.label);
                setData(res.data);
                setFetching(false);
            })
            .catch(err => {
                localStorage.setItem('info', JSON.stringify(err.response.data));
                window.location='/';
            });
        }
        document.querySelectorAll('[data-autoresize]').forEach((e) => {
            e.style.boxSizing = 'border-box';
            var offset = e.offsetHeight - e.clientHeight;
            e.addEventListener('input', (a) => {
              a.target.style.height = '-10px';
              a.target.style.height = a.target.scrollHeight + offset + 'px';
            });
            e.removeAttribute('data-autoresize');
        });
        if(!isLoading && authenticated) getData();
    }, [userData, id])

    const updateData = (e) => {
        e.preventDefault();
        const btn = document.getElementById('edit-todo');
        async function submitData() {
            btn.innerHTML = "Updating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.put(`${SERVER_URL}/todo/data`, { id, title, label, description, date }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                localStorage.setItem('info', JSON.stringify(res.data))
                window.location='/'
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Update"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(honeypot) return;
        else if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All the Required Fields !"); document.getElementById(!title ? 'title' : !date ? 'date' : 'label').focus(); }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !"); document.getElementById('title').focus(); }
        else if(validateLabel(label)){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label"); document.getElementById('label').focus(); }
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !"); document.getElementById('description').focus(); }
        else submitData();
    }

    return (
        <div>
            { isFetching ?
            (<div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }
            <div className="main__projects">
                <a href="/" className="close" style={{fontSize: '40px', textDecoration: 'none'}}>&times;</a>
                <form onSubmit={updateData} className="mt-20">
                    <div className="contact__formControl no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-title">Title</label>
                            <input title="Title" id="bot-title" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="form__container">
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="title">Title <span className="required">*</span></label>
                                <input title="Title" id="title" type="text" className="contact__inputField" maxLength="40" onChange={(event) => setTitle(event.target.value)} value={title} required />
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="label">Date <span className="required">*</span></label>
                                <div className="datepicker">
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker
                                            margin="normal"
                                            format="dd/MM/yyyy"
                                            id="date"
                                            value={date}
                                            onChange={(event) => setDate(event)}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="label">Label <span className="required">*</span></label>
                            <select onChange={(event) => setLabel(event.target.value)} id="label" value={label}>
                                { labels.map(c => {
                                    return (<option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)
                                }) }
                            </select>
                        </div>
                    </div>
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" className="contact__inputField" data-autoresize rows="2" maxLength="120" onChange={(event) => setDescription(event.target.value)} value={description}></textarea>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    { isFetching ? isDiffer = false : data.title === title && data.date === date && data.description === description && data.label === label ? isDiffer = false : isDiffer = true }
                    <button type={isDiffer ? 'submit' : 'disabled'} id="edit-todo" className={(isDiffer ? '' : 'disabled ')+'btn__outline'}  disabled={!isDiffer} style={{outline: 'none'}}>Update</button>
                </form>
            </div>
        </div>
    )
}

export default Edit;