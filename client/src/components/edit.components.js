import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const listLabel = ["Priority","Secondary","Important","Do Later"];

const Edit = () => {
    const email = localStorage.getItem('__email');
    const token = localStorage.getItem('__token');
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState(listLabel[0].toLowerCase());

    useEffect(() => {
        const postData = { SECRET_KEY, email, token, id }
        axios.post(`${SERVER_URL}/data/todo/getData/${id}`, postData)
        .then(res => {
            setTitle(res.data.title);
            setDate(res.data.date.substring(0, 10));
            setDescription(res.data.description);
            setLabel(res.data.label);
        })
        .catch(err => {
            setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            setTimeout(() => { window.location='/' }, 2000)
        })
    },[])

    const updateData = (e) => {
        e.preventDefault();
        const postData = { SECRET_KEY, email, token, id, title, label, description, date }
        axios.post(`${SERVER_URL}/data/todo/update/`, postData)
        .then(res => {
            setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
            setTimeout(() => { window.location='/' }, 2000)
        })
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
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
                    <button type="submit" id="btn-addTodo" className="btn__outline" style={{outline: 'none'}}>Update</button>
                </form>
            </div>
        </div>
    )
}

export default Edit;