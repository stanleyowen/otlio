import React, { useEffect, useState } from 'react';

const listLabel = ["Priority","Secondary","Important","Do Later"];
const timestamps = () => {
    var today = new Date();
    var date = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    if(date < 10) date = '0'+date;
    if(month < 10) month = '0'+month;
    return year+'-'+month+'-'+date;
}

/*const Todos = props => (
    <tr>
        <td>{props.todo.description}</td>
        <td>{props.todo.date.substring(0, 10)}</td>
        <td>
            <a href="#" onClick={()=> {props.deleteTodo(props.todo._id)}}><i className="fas fa-trash-alt"></i></a>
        </td>
    </tr>
)*/

const Home = () => {
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(timestamps);
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState(listLabel[0].toLowerCase());

    useEffect(() => {
        setEmail(localStorage.getItem('__email'));
        const modal = document.getElementById('addTodoModal');
        window.onclick = function(event){
            if(event.target == modal){
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
    })
    
    const notifContainer = document.getElementById('notif__container');
    const NOTIFICATION_TYPES = {
        SUCCESS: 'Success',
        DANGER: 'Danger'
    };

    const addNotification = (type, text) => {
        const newNotification = document.createElement('div');
        newNotification.classList.add('notification', `notification-${type.toLowerCase()}`);
        const innerNotification = `<strong>${type}:</strong> ${text}`;
        newNotification.innerHTML = innerNotification;
        notifContainer.appendChild(newNotification);
        return newNotification;
    }

    const closeNotification = (notification) =>{
        notification.classList.add('hide');
        setTimeout(() => {
            notifContainer.removeChild(notification);
        }, 500);
    }

    const closeModal = (e) => {
        e.preventDefault();
        const modal = document.getElementById('addTodoModal');
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
    }

    const submitTodo = (e) => {
        e.preventDefault();
        if(!title || !date || !description){
            const required = addNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All Required Fields');
            setTimeout(() => {
                closeNotification(required);
            }, 5000);
        }
        else {
            const success = addNotification(NOTIFICATION_TYPES.SUCCESS, 'Todo Added Successfully');
            setTimeout(() => {
                closeNotification(success);
            }, 5000);
        }
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
        /*
        <div className="container" style={{ marginTop: '20vh', fontFamily:'Itim' }}>
            <div className="row">
                <h1>Activity List</h1>
                <a href="/add" className="btn btn-outline-primary" style={{ width: '100%', marginBottom: '10px' }}>Add Activity</a>
                <a href="#" onClick={this.logout} className="btn btn-outline-danger" style={{ width: '100%', marginBottom: '10px' }}>Logout</a>
                <table className="table table-stripped">
                    <thead>
                        <tr>
                            <th>Activity Name</th>
                            <th>DueDate</th>
                            <th>Button</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.todoList()}
                    </tbody>
                </table>
            </div>
        </div>
        */
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
                                    <label htmlFor="description">Description <span className="required">*</span></label>
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
                    <tr>
                        <th>
                            Hii<br />hello</th>
                        <th>Hii</th>
                        <th>Hii</th>
                        <th>Hii</th>
                    </tr>
                    <tr>
                        <th>Hii</th>
                        <th>Hii</th>
                        <th>Hii</th>
                        <th>Hii</th>
                    </tr>
                </tbody>
           </table>
           <div className="notif__container" id="notif__container">
           </div>
       </div>
    );
}

export default Home;