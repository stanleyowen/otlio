import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const listLabel = ["Priority","Secondary","Important","Do Later"];

const Edit = () => {
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState(listLabel[0].toLowerCase());

    useEffect(() => {
        const email = localStorage.getItem('__email');
        const token = localStorage.getItem('__token');
        if(email && token) {
            const postData = { SECRET_KEY, email, token, id }
            axios.post(`${SERVER_URL}/data/todo/getData/${id}`, postData)
            .then(res => {
                setTitle(res.data.title);
                setDate(res.data.date.substring(0, 10));
                setDescription(res.data.description);
                setLabel(res.data.label);
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
        }else window.location='/welcome';
    },[])

    return (
        <div className="main__projects">
            <form>
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
                <button type="submit" id="btn-addTodo" className="btn__outline" style={{outline: 'none'}}>Add</button>
            </form>
        </div>
    )
}

export default Edit;