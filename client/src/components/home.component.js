import axios from 'axios'
import DateFnsUtils from '@date-io/date-fns'
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { IconButton, Tooltip, Select, MenuItem } from '@material-ui/core'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons/'

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'
import { labels, validateLabel, getCSRFToken, openModal, closeModal } from '../libraries/validation'

const timestamp = (e) => {
    var data = new Date(e)
    var today = new Date()
    var yesterday = new Date(new Date(today).setDate(today.getDate()-1)).getDate()
    var tomorrow = new Date(new Date(today).setDate(today.getDate()+1)).getDate()
    if(yesterday === data.getDate()) return <b>Yesterday</b>
    else if(today.getDate() === data.getDate()) return <b>Today</b>
    else if(tomorrow === data.getDate()) return <b>Tomorrow</b>
    else {
        var day = data.getDate()
        var month = data.getMonth() + 1
        var year = data.getFullYear()
        if (month <= 9) month = '0' + month
        if (day <= 9) day = '0' + day
        return [day, month, year].join('/')
    }
}

const Home = ({ userData }) => {
    const {email, authenticated, isLoading, server: SERVER_URL} = userData
    const cacheTodo = JSON.parse(localStorage.getItem('todoData'))
    const [todoData, setTodoData] = useState()
    const [data, setData] = useState({
        title: '',
        date: new Date(),
        label: labels[0].toLowerCase(),
        description: ''
    })
    const [properties, setProperties] = useState({
        honeypot: '',
        disabled: false
    })

    const handleData = (a, b) => setData({ ...data, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })

    async function getTodoData() {
        await axios.get(`${SERVER_URL}/todo/data`, { withCredentials: true })
        .then(res => {
            setTodoData(res.data)
            localStorage.setItem('todoData', JSON.stringify(res.data))
        })
        .catch(err => {
            if(err.response.status >= 500) setTimeout(() => getTodoData(), 5000)
            setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
        })
    }

    useEffect(() => {
        const background = document.getElementById('background')
        const modal = document.getElementById('modal')
        window.onclick = e => {
            if(e.target === background && !properties.disabled){
                modal.classList.remove('showModal')
                modal.classList.add('closeModal')
                background.classList.remove('showBackground')
                background.classList.add('hideBackground')
            }
        }
        document.querySelectorAll('[data-autoresize]').forEach((e) => {
            e.style.boxSizing = 'border-box'
            var offset = e.offsetHeight - e.clientHeight
            e.addEventListener('input', (a) => {
              a.target.style.height = '-10px'
              a.target.style.height = a.target.scrollHeight + offset + 'px'
            })
            e.removeAttribute('data-autoresize')
        })
        if(!isLoading && authenticated && SERVER_URL) getTodoData()
    }, [userData, properties.disabled, SERVER_URL])

    const addTodo = (e) => {
        e.preventDefault()
        const btn = document.getElementById('add-todo')
        async function submitData() {
            btn.innerText = "Adding..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true)
            await axios.post(`${SERVER_URL}/todo/data`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('background','modal')
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                setData({ title: '', date: new Date(), label: labels[0].toLowerCase(), description: '' })
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Add"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false)
        }
        if(properties.honeypot) return
        else if(!data.title || !data.date || !data.label) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All the Required Fields !"); document.getElementById(!data.title ? 'title' : !data.date ? 'date' : 'label').focus()}
        else if(data.title.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 60 characters !"); document.getElementById('title').focus()}
        else if(validateLabel(data.label)) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label"); document.getElementById('label').focus()}
        else if(data.description && data.description.length > 200) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 200 characters !"); document.getElementById('description').focus()}
        else submitData()
    }

    const deleteData = async objId => {
        await axios.delete(`${SERVER_URL}/todo/data`, { data: { objId }, headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
        .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
        getTodoData()
    }

    const titleCase = (a) => {
        var sentence = a.toLowerCase().split(' ')
        for (var i = 0; i < sentence.length; i++) sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1)
        return sentence.join(' ')
    }

    const handleOnDragEnd = (res) => {
        const {source, destination} = res
        if (!destination || !source || destination.index === source.index) return;
        const items = Array.from(todoData)
        const [reorderedItem] = items.splice(res.source.index, 1)
        items.splice(res.destination.index, 0, reorderedItem)
        setTodoData(items)
        localStorage.setItem('todoData', JSON.stringify(items))
        const data = []
        items.map((a, index) => data.push({ _id: a._id, index }))
        axios.put(`${SERVER_URL}/todo/index`, {data}, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
        .then().catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
    }
    const todoList = (b = todoData ? todoData : cacheTodo) => {
        if(b) {
            return b.map((a, index) => {
                return (
                    <Draggable key={a._id} draggableId={a._id} index={index}>
                        {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <td><span className={a.description ? 'bold' : ''}>{a.title}</span><br/><div dangerouslySetInnerHTML={{__html: a.description.replace(/\n/g, '<br>')}} /></td>
                                <td><span className={"label "+a.label.split(' ').join('-').toLowerCase()}>{titleCase(a.label)}</span></td>
                                <td>{timestamp(a.date)}</td>
                                <td>
                                    <span className="btn-config">
                                        <Tooltip title="Edit Task"><IconButton href={`/edit/${a._id}`}>
                                            <FontAwesomeIcon icon={faPen} style={{ fontSize: ".8em" }} />
                                        </IconButton></Tooltip>
                                    </span>
                                    <span className="btn-config">
                                        <Tooltip title="Delete Task"><IconButton onClick={SERVER_URL ? () => deleteData(a._id) : null}>
                                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: ".8em" }} />
                                        </IconButton></Tooltip>
                                    </span>
                                </td>
                            </tr>
                        )}
                    </Draggable>
                )
            })
        }
    }

    return (
        <div className="main">
            <p>Hi, Welcome Back <b>{email}</b></p>
            <div className="responsive-table mb-40">
                <table className="main__table">
                    <thead><tr>
                        <th>Activity Name</th>
                        <th>Labels</th>
                        <th>Due Date</th>
                        <th>&nbsp;</th>
                    </tr></thead>
                    <DragDropContext onDragEnd={handleOnDragEnd}><Droppable droppableId="todo">
                        {(provided) => (
                            <tbody {...provided.droppableProps} ref={provided.innerRef} id="todo">
                                { todoList() }
                                { provided.placeholder }
                                { !cacheTodo && !todoData ?
                                (<tr><td colSpan="5" className="no-border"><div className="spin-container"><div className="loading">
                                    <div></div><div></div><div></div>
                                    <div></div><div></div>
                                </div></div></td></tr>) : null }
                            </tbody>
                        )}
                    </Droppable></DragDropContext>
                </table>
            </div>
            
            <Tooltip title="Add Task" placement="top">
                <button className="btn__changeMode" aria-label="Add Todo" onClick={() => authenticated ? openModal('background','modal','title') : null} id="addTodo" style={{bottom: '17vh'}}>
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: "2.2em" }} />
                </button>
            </Tooltip>

            { authenticated ?
            (<div id="background" className="modal hiddenModal">
                <div id="modal" className="modal__container hiddenModal">
                    <IconButton onClick={() => closeModal('background','modal')} className="float-right"><FontAwesomeIcon icon={faTimes} style={{ fontSize: '.8em', color: 'black' }} /></IconButton>
                    <h2 className="modal__title">Add Todo</h2>
                    <div className="modal__body">
                        <form onSubmit={addTodo}>
                            <div className="m-10 no-bot">
                                <div className="contact__infoField">
                                    <label htmlFor="bot-title">Title</label>
                                    <input title="Title" id="bot-title" type="text" className="contact__inputField" onChange={(e) => handleChange('honeypot', e.target.value)} value={properties.honeypot} autoComplete="off" />
                                    <span className="contact__onFocus" />
                                </div>
                            </div>
                            <div className="form__container">
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="title">Title <span className="required">*</span></label>
                                        <input title="Title" id="title" type="text" className="contact__inputField" maxLength="60" onChange={(e) => handleData('title', e.target.value)} value={data.title} required />
                                        <span className="contact__onFocus" />
                                        <p className="length">{data.title.length}/60</p>
                                    </div>
                                </div>
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="date">Date <span className="required">*</span></label>
                                        <div className="datepicker"><MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker margin="normal" format="dd/MM/yyyy" id="date" value={data.date} onChange={(e) => handleData('date', e)} />
                                        </MuiPickersUtilsProvider></div>
                                    </div>
                                </div>
                            </div>
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="label">Label <span className="required">*</span></label>
                                    <Select id="label" value={data.label} onChange={(e) => handleData('label', e.target.value)} className="mt-10 mb-10 full-width">
                                        { labels.map(c => { return (<MenuItem key={c.toLowerCase()} value={c.toLowerCase()}>{c}</MenuItem>) }) }
                                    </Select>
                                </div>
                            </div>
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" className="contact__inputField" data-autoresize rows="2" maxLength="200" onChange={(e) => handleData('description', e.target.value)} value={data.description} />
                                    <span className="contact__onFocus" />
                                    <p className="length">{data.description.length}/200</p>
                                </div>
                            </div>
                            <button className="oauth-box google isCentered block mt-30 p-12 button" id="add-todo">Add</button>
                        </form>
                    </div>
                </div>
            </div>) : null }
       </div>
    )
}

export default Home