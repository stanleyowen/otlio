import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DateFnsUtils from "@date-io/date-fns";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import axios from 'axios';

import { labels, validateLabel, getCSRFToken, formatDate } from '../libraries/validation';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;

const Edit = ({ userData }) => {
    let isDiffer = false;
    const {email, id: userId, authenticated, isLoading} = userData;
    const {id} = useParams();
    const [title, setTitle] = useState();
    const [date, setDate] = useState();
    const [description, setDescription] = useState();
    const [data, setData] = useState({});
    const [isFetching, setFetching] = useState(true);
    const [label, setLabel] = useState(labels[0].toLowerCase());

    useEffect(() => {
        async function getData() {
            await axios.get(`${SERVER_URL}/todo/data`, { params: {id, userId, email}, withCredentials: true })
            .then(res => {
                setTitle(res.data.title);
                setDate(formatDate(res.data.date));
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
        document.querySelectorAll('[data-autoresize]').forEach(function (e) {
            e.style.boxSizing = 'border-box';
            var offset = e.offsetHeight - e.clientHeight;
            e.addEventListener('input', function (a) {
              a.target.style.height = '-10px';
              a.target.style.height = a.target.scrollHeight + offset + 'px';
            });
            e.removeAttribute('data-autoresize');
        });
        if(!isLoading && authenticated) getData();
    }, [userData])

    const updateData = (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-addTodo');
        async function submitData() {
            btn.innerHTML = "Updating...";
            const postData = { userId, email, id, title, label, description, date }
            await axios.put(`${SERVER_URL}/todo/data`, postData, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(res => {
                localStorage.setItem('info', JSON.stringify(res.data))
                window.location='/'
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Update";
        }
        if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All the Required Fields !") }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !") }
        else if(validateLabel(label)) setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label")
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !") }
        else if(DATE_VAL.test(String(date)) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Date !") }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }        
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
                    <div className="form__container">
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="title">Title <span className="required">*</span></label>
                                <input title="Title" id="title" type="text" className="contact__inputField" onChange={(event) => setTitle(event.target.value)} value={title} required />
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
                            <select onChange={(event) => setLabel(event.target.value)} value={label}>
                                { labels.map(c => {
                                    return (<option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)
                                }) }
                            </select>
                        </div>
                    </div>
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" className="contact__inputField" data-autoresize rows="2" onChange={(event) => setDescription(event.target.value)} value={description}></textarea>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    { isFetching ? isDiffer = false : data.title === title && formatDate(data.date) === date && data.description === description && data.label === label ? isDiffer = false : isDiffer = true }
                    <button type={isDiffer ? 'submit' : 'disabled'} id="btn-addTodo" className={(isDiffer ? null : 'disabled')+' btn__outline'}  disabled={!isDiffer} style={{outline: 'none'}}>Update</button>
                </form>
            </div>
        </div>
    )
}

export default Edit;