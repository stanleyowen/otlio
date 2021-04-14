import React, { useEffect, useState } from 'react';
import DateFnsUtils from "@date-io/date-fns";
import { IconButton, Tooltip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons/';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import axios from 'axios';

import { labels, validateLabel, getCSRFToken, openModal, closeModal } from '../libraries/validation';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const formatDate = (e) => {
    var d;
    if(e) d = new Date(e);
    else d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var year = d.getFullYear();
    if (month <= 9) month = '0' + month;
    if (day <= 9) day = '0' + day;
    return [day, month, year].join('-');
}

const validateTimestamp = (a, b) => {
    var data = parseInt(a.split('-')[0]);
    var yesterday = parseInt(b.split('-')[0]) - 1;
    var today = parseInt(b.split('-')[0]);
    var tomorrow = parseInt(b.split('-')[0]) + 1;
    if(data === yesterday) return <b>Yesterday</b>;
    else if(data === today) return <b>Today</b>;
    else if(data === tomorrow) return <b>Tomorrow</b>;
    else return a;
}

const labeling = (a) => {
    var _labelClass = null;
    if(a[1]) {if(a[0]+" "+a[1] === labels[3]) _labelClass="do-later"}
    else {
        if(a[0] === labels[0]) _labelClass="priority";
        else if(a[0] === labels[1]) _labelClass="secondary";
        else if(a[0] === labels[2]) _labelClass="important";
    }
    var _label = <span className={"label "+_labelClass}>{a}</span>;
    return _label;
}

const Home = ({ userData }) => {
    var intervalData;
    const {email, authenticated, isLoading} = userData;
    const cacheTodo = JSON.parse(localStorage.getItem('todoData'));
    const [todoData, setTodoData] = useState(null);
    const [honeypot, setHoneypot] = useState();
    const [disabled, setDisabled] = useState(false);
    const [title, setTitle] = useState();
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState();
    const [label, setLabel] = useState(labels[0].toLowerCase());

    async function clearData(){ if(intervalData) clearInterval(intervalData); }
    async function getTodoData() {
        await axios.get(`${SERVER_URL}/todo/data`, { withCredentials: true })
        .then(res => {
            setTodoData(res.data); clearData();
            localStorage.setItem('todoData', JSON.stringify(res.data));
        })
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
    }

    useEffect(() => {
        const background = document.getElementById('background');
        const modal = document.getElementById('modal');
        window.onclick = function(e){
            if(e.target === background && !disabled){
                modal.classList.remove('showModal');
                modal.classList.add('closeModal');
                background.classList.remove('showBackground');
                background.classList.add('hideBackground');
            }
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
        if(!isLoading && authenticated) getTodoData()
    }, [userData, disabled]);

    const todoList = () => {
        let todo = cacheTodo;
        if(todoData) todo = todoData
        if(cacheTodo || todoData){
            return todo.map(a => {
                return(
                    <tr key={a._id}>
                        <td>{a.title}<br/>{a.description}</td>
                        <td>{labeling(titleCase(a.label))}</td>
                        <td>{validateTimestamp(formatDate(a.date), formatDate())}</td>
                        <td>
                            <span className="btn-config">
                                <Tooltip title="Edit Task">
                                    <IconButton href={`/edit/${a._id}`}>
                                        <FontAwesomeIcon icon={faPen} style={{ fontSize: ".8em" }} />
                                    </IconButton>
                                </Tooltip>
                            </span>
                            <span className="btn-config">
                                <Tooltip title="Delete Task">
                                    <IconButton onClick={() => deleteData(a._id)}>
                                        <FontAwesomeIcon icon={faTrash} style={{ fontSize: ".8em" }} />
                                    </IconButton>
                                </Tooltip>
                            </span>
                        </td>
                    </tr>
                )
            })
        }
    }

    const deleteData = async id => {
        await axios.delete(`${SERVER_URL}/todo/data`, { data: { objId: id }, headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
        .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
        getTodoData();
    }

    const titleCase = (a) => {
        var sentence = a.toLowerCase().split(" ");
        for (var i = 0; i < sentence.length; i++) sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
        sentence.join(" ");
        return sentence;
    }

    const addTodo = (e) => {
        e.preventDefault();
        const btn = document.getElementById('add-todo');
        async function submitData() {
            btn.innerHTML = "Adding..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); setDisabled(true);
            const data = { title, label, description, date };
            await axios.post(`${SERVER_URL}/todo/data`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('background','modal')
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
                setTitle(''); setLabel(labels[0].toLowerCase()); setDescription(''); setDate(new Date());
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Add"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); setDisabled(false);
            getTodoData();
        }
        if(honeypot) return;
        else if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All the Required Fields !"); document.getElementById(!title ? 'title' : !date ? 'date' : 'label').focus(); }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !"); document.getElementById('title').focus(); }
        else if(validateLabel(label)){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label"); document.getElementById('label').focus(); }
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !"); document.getElementById('description').focus(); }
        else submitData();
    }

    return (
        <div className="main__projects">
            <p>Hi, Welcome Back {email}</p>
            <div id="background" className="modal hiddenModal">
                <div id="modal" className="modal__container hiddenModal">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('background','modal')}>&times;</span>
                        <h2>Add Todo</h2>
                    </div>
                    <div className="modal__body">
                        <form onSubmit={addTodo}>
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
                                        <label htmlFor="date">Date <span className="required">*</span></label>
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
                                    <textarea id="description" className="contact__inputField" data-autoresize rows="2" maxLength="120" onChange={(event) => setDescription(event.target.value)} value={description}></textarea>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <button type="submit" id="add-todo" className="btn__outline" style={{outline: 'none'}}>Add</button>
                        </form>
                    </div>
                </div>
            </div>
            <table className="main__table">
                <thead>
                    <tr>
                        <th>Activity Name</th>
                        <th>Labels</th>
                        <th>Due Date</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    { todoList() }
                    { !cacheTodo && !todoData ?
                        (<tr><td colSpan="5" className="no-border">
                            <div className="full-width spin-container">
                                <div className="shape shape-1"></div>
                                <div className="shape shape-2"></div>
                                <div className="shape shape-3"></div>
                                <div className="shape shape-4"></div>
                            </div>
                        </td></tr>) : null }
                </tbody>
            </table>
            <Tooltip title="Add Task" placement="top">
                <button className="btn__changeMode" aria-label="Add Todo" onClick={() => openModal('background','modal','title')} id="addTodo" style={{bottom: '17vh'}}>
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: "2.2em" }} />
                </button>
            </Tooltip>
       </div>
    );
}

export default Home;