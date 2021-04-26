import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DateFnsUtils from "@date-io/date-fns";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import axios from 'axios';

import { labels, validateLabel, getCSRFToken } from '../libraries/validation';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Edit = ({ userData }) => {
    const {authenticated, isLoading} = userData;
    const [data, setData] = useState({
        _id: useParams().id,
        title: '',
        date: new Date(null),
        label: labels[0].toLowerCase(),
        description: ''
    });
    const [properties, setProperties] = useState({
        honeypot: '',
        isLoading: true
    });

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handleData = (a, b) => setData({ ...data, [a]: b })

    useEffect(() => {
        async function getData() {
            await axios.get(`${SERVER_URL}/todo/data`, { params: {id: data._id}, withCredentials: true })
            .then(res => {
                setData(res.data); handleChange('isLoading', false);
                document.getElementById('title').focus();
            })
            .catch(err => {
                if(err.response.status >= 500){
                    setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
                    setTimeout(() => getData(), 5000)
                }else {
                    localStorage.setItem('info', JSON.stringify(err.response.data));
                    window.location='/';
                }
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
    }, [userData, data.id])

    const updateData = (e) => {
        e.preventDefault();
        const btn = document.getElementById('edit-todo');
        async function submitData() {
            btn.innerHTML = "Updating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.put(`${SERVER_URL}/todo/data`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => { localStorage.setItem('info', JSON.stringify(res.data)); window.location='/'; })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Update"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(properties.honeypot) return;
        else if(!data.title || !data.date || !data.label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All the Required Fields !"); document.getElementById(!data.title ? 'title' : !data.date ? 'date' : 'label').focus(); }
        else if(data.title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !"); document.getElementById('title').focus(); }
        else if(validateLabel(data.label)){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label"); document.getElementById('label').focus(); }
        else if(data.description && data.description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !"); document.getElementById('description').focus(); }
        else submitData();
    }

    return (
        <div>
            { properties.isLoading ?
            (<div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }

            <div className="main__projects">
                <a href="/" className="close" style={{fontSize: '40px', textDecoration: 'none'}}>&times;</a>
                <form onSubmit={updateData} className="mt-20">
                    <div className="m-10 no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-title">Title</label>
                            <input title="Title" id="bot-title" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="form__container">
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="title">Title <span className="required">*</span></label>
                                <input title="Title" id="title" type="text" className="contact__inputField" maxLength="40" onChange={(event) => handleData('title', event.target.value)} value={data.title} required />
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="date">Date <span className="required">*</span></label>
                                <div className="datepicker">
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker
                                            margin="normal"
                                            format="dd/MM/yyyy"
                                            id="date"
                                            value={data.date}
                                            onChange={(event) => handleData('date', event)}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="label">Label <span className="required">*</span></label>
                            <select className="mt-10 mb-10" onChange={(event) => handleData('label', event.target.value)} id="label" value={data.label}>
                                { labels.map(c => {
                                    return (<option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)
                                }) }
                            </select>
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" className="contact__inputField" data-autoresize rows="2" maxLength="120" onChange={(event) => handleData('description', event.target.value)} value={data.description}></textarea>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <button type="submit" id="edit-todo" className="btn__outline">Update</button>
                </form>
            </div>
        </div>
    )
}

export default Edit;