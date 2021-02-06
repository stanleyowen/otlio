import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const listLabel = ["Priority","Secondary","Important","Do Later"];
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Edit = () => {
    const email = localStorage.getItem('__email');
    const token = localStorage.getItem('__token');
    const userId = localStorage.getItem('__id');
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [defaultValue, setDefaultValue] = useState('');
    const [label, setLabel] = useState(listLabel[0].toLowerCase());

    useEffect(() => {
        const getData = { email, id: userId }
        axios.get(`${SERVER_URL}/data/todo/getData/${id}`, { params: getData, headers: { Authorization: `JWT ${token}` } })
        .then(res => {
            setTitle(res.data.title);
            setDate(res.data.date.substring(0, 10));
            setDescription(res.data.description);
            setLabel(res.data.label);
            setDefaultValue(res.data);
        })
        .catch(err => {
            setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            setTimeout(() => { window.location='/' }, 2000)
        })
    }, [id, email, token, userId])

    const updateData = (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-addTodo');
        btn.innerHTML = "Updating";
        async function submitData() {
            const postData = { email, objId: id, id: userId, title, label, description, date }
            await axios.post(`${SERVER_URL}/data/todo/update/`, postData, { headers: { Authorization: `JWT ${token}` } })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
                setTimeout(() => { window.location='/' }, 2000);
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Update";
        }
        if(!SECRET_KEY || !email || !token || EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.") }
        else if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !") }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !") }
        else if(label.length > 20){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Label less than 20 characters !" ) }
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !") }
        else if(date.length !== 10 || DATE_VAL.test(String(date)) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Date !") }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }        
    }
    return (
        <div>
            { !title || !date || !label ?
            (<div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }
            <div className="main__projects">
                <a href="/" className="close"><i className="fas fa-times" style={{'fontSize': '30px'}}></i></a>
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
                                <input type="date" className="contact__inputField datepicker" onChange={(event) => setDate(event.target.value)} value={date} required></input>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                    </div>

                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="label">Label <span className="required">*</span></label>
                            <select onChange={(event) => setLabel(event.target.value)} value={label}>
                                { listLabel.map(c => {
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
                    { defaultValue.title === title && defaultValue.date.substring(0, 10) === date && defaultValue.description === description && defaultValue.label === label ? (<button type="disabled" id="btn-addTodo" className="btn__outline disabled" disabled="true" style={{outline: 'none'}}>Update</button>) : (<button type="submit" id="btn-addTodo" className="btn__outline" style={{outline: 'none'}}>Update</button>)}
                </form>
            </div>
        </div>
    )
}

export default Edit;