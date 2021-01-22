import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const listLabel = ["Priority","Secondary","Important","Do Later"];
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const timestamps = () => {
    var today = new Date();
    var date = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    if(date < 10) date = '0'+date;
    if(month < 10) month = '0'+month;
    return year+'-'+month+'-'+date;
}

const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    DANGER: 'danger'
};

const setNotification = (type, text) => {
    const notifications = document.getElementById('notifications');
    const newNotification = document.createElement('div');
    newNotification.classList.add('notification', `notification-${type}`);
    newNotification.innerHTML = `${text}`;
    notifications.appendChild(newNotification);

    setTimeout(() => {
        newNotification.classList.add('hide');
        setTimeout(() => {
            notifications.removeChild(newNotification);
        }, 1000);
    }, 5000);
    
    return newNotification;
}

const Home = ({ location }) => {
    const email = localStorage.getItem('__email');
    var token = localStorage.getItem('__token');
    const [todoData, setTodoData] = useState([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(timestamps);
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState(listLabel[0].toLowerCase());

    useEffect(() => {
        var token = localStorage.getItem('__token');
        const postData = { SECRET_KEY, email, token }
        axios.post(`${SERVER_URL}/data/todo/getData`, postData)
        .then(res => setTodoData(res.data))
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
    })

    useEffect(() => {
        const modal = document.getElementById('addTodoModal');
        window.onclick = function(event){
            if(event.target === modal){
                modal.style.visibility = "hidden";
                modal.style.opacity = "0";
            }
        }
        document.querySelectorAll('[data-autoresize]').forEach(function (element) {
            element.style.boxSizing = 'border-box';
            var offset = element.offsetHeight - element.clientHeight;
            element.addEventListener('input', function (event) {
              event.target.style.height = '-10px';
              event.target.style.height = event.target.scrollHeight + offset + 'px';
            });
            element.removeAttribute('data-autoresize');
        });
    }, [location]);

    function todoList() {
        if(todoData){
            return todoData.map(a => {
                return (
                <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>{a.label}</td>
                    <td>{a.date}</td>
                </tr>)
            })
        }
    };

    const closeModal = (e) => {
        e.preventDefault();
        const modal = document.getElementById('addTodoModal');
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
    }

    const submitTodo = (e) => {
        e.preventDefault();
        async function submitData() {
            const todoData = { SECRET_KEY, email, token, title, label, description, date };
            await axios.post(`${SERVER_URL}/data/todo/add`, todoData)
            .then(res => {setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)})
            .catch(err => console.log(err)
            );
        }
        if(!SECRET_KEY || !email || !token || EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.") }
        else if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !") }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !") }
        else if(label.length > 20){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Label less than 20 characters !" ) }
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !") }
        else if(date.length !== 10 || DATE_VAL.test(String(date)) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Date !") }
        else { submitData() }
    }
    /*
    constructor(props){
        super(props);

        this.logout = this.logout.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);

        this.state = {
            username : "",
            todos: [],
        }
    }

    async componentDidMount(){
        if(!check_token){
            window.location = "/";
        }
        const token = cookie.load('token');
        await axios.get('http://localhost:5000/user')
        .then(res => {
            (res.data).forEach(i => {
                if(i.token === token){
                    this.setState({
                        username: i.username
                    })
                }
            })
        })
        var userdata = this.state.username;
        await axios.get('http://localhost:5000/todo/'+userdata)
        .then(res => {
            this.setState({
                todos: res.data
            })
        })
        .catch((err) => {console.log(err)});
    }

    logout(e) {
        cookie.remove('token');
        window.location='/';
    }

    onChangeUsername(e){
        this.setState({
            username: e.target.value
        })
    }
    deleteTodo(id){
        axios.delete('http://localhost:5000/todo/'+id)
        .then(res => { console.log(res.data)} );

        this.setState({
            todos: this.state.todos.filter(el => el._id !== id)
        })
    }
    todoList(){
        console.log(this.state.todos);
        if(this.state.todos){
            return this.state.todos.map(i => {
                return <Todos todo={i} deleteTodo={this.deleteTodo} key={i._id} />; }
            )
        }
    }
    */
    return (
       <div className="main__projects">
           <p>Hi, Welcome Back {email}</p>
           <div id="addTodoModal" className="modal">
                <div className="modal__container">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={closeModal}>&times;</span>
                        <h2>Add Todo</h2>
                    </div>
                    <div className="modal__body">
                        <form onSubmit={submitTodo}>
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
                                        <input type="date" className="contact__inputField datepicker" onChange={(event) => setDate(event.target.value)} value={date}></input>
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
                            <button type="submit" className="btn__outline" style={{outline: 'none'}}>Add</button>
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
                    {todoList()}
                </tbody>
           </table>
           <div className="notifications" id="notifications"></div>
       </div>
    );
}

export default Home;