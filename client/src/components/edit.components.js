/*import React, { useState, useEffect } from 'react';
import getUserToken from '../library/getUserToken';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const listLabel = ["Priority","Secondary","Important","Do Later"];

const Edit = () => {
    const {id} = useParams();
    const email = localStorage.getItem('__email');
    const token = localStorage.getItem('__token');

    useEffect(() => {
        if(email && token) {
            const postData = { SECRET_KEY, email, token, id }
            axios.post(`${SERVER_URL}/data/todo.update`)
        }else window.location='/welcome';
    })

    return (
        <div className="main__projects">
            <form>
                <div className="form__container">
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="title">Title <span className="required">*</span></label>
                            <input title="Title" id="title" type="text" className="contact__inputField" required />
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="label">Date <span className="required">*</span></label>
                            <input type="date" className="contact__inputField datepicker" required></input>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                </div>

                <div className="contact__formControl">
                    <div className="contact__infoField">
                        <label htmlFor="label">Label <span className="required">*</span></label>
                        <select>
                            { listLabel.map(c => {
                                return (<option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)
                            }) }
                        </select>
                    </div>
                </div>

                <div className="contact__formControl">
                    <div className="contact__infoField">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" className="contact__inputField" data-autoresize rows="2"></textarea>
                        <span className="contact__onFocus"></span>
                    </div>
                </div>
                <button type="submit" id="btn-addTodo" className="btn__outline" style={{outline: 'none'}}>Add</button>
            </form>
        </div>
    )
}

export default Edit;*/