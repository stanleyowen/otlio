import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import cookie from 'react-cookies';
import axios from 'axios';

const Todos = props => (
    <tr>
        <td>{props.todo.description}</td>
        <td>{props.todo.date.substring(0, 10)}</td>
        <td>
            <a href="#" onClick={()=> {props.deleteTodo(props.todo._id)}}>delete</a>
        </td>
    </tr>
)

const token = cookie.load('token');
async function check_token(){
    var logged_in = false
    await axios.get('http://localhost:5000/user')
    .then(res => {
        (res.data).forEach(i=> {
            if(i.token === token){
                logged_in = true;
                return true;
            }
        })
    })
    .catch(err => console.log(err));
    return logged_in;
}

export default class todo extends Component {
    constructor(props){
        super(props);

        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeTodo = this.onChangeTodo.bind(this);
        this.onChangeDueDate = this.onChangeDueDate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);

        this.state = {
            todo : "",
            date : new Date(),
            username : "",
            msg : null,
            todos: [],
        }
    }

    async componentDidMount(){
        if(!check_token){
            window.location = "/login";
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
        await axios.get('http://localhost:5000/todo')
        .then(res => {
            this.setState({
                todos: res.data
            })
        })
        .catch((err) => {console.log(err)});
    }

    onChangeUsername(e){
        this.setState({
            username: e.target.value
        })
    }

    onChangeTodo(e){
        this.setState({
            todo: e.target.value
        })
    }
    onChangeDueDate(date){
        this.setState({
            date: date
        })
    }
    onSubmit(e){
        e.preventDefault();
        if(this.state.todo.length === 0){
            return this.setState({ msg: "Activity Field Is Required" })
        }
        if(this.state.todo.length > 500){
            return this.setState({ msg: "Activity Field Cannot Contain more than 500 words" });
        }
        const newtodo = {
            username: this.state.username,
            description: this.state.todo,
            date: this.state.date,
        }
        console.log(newtodo);
        axios.post('http://localhost:5000/todo/add/', newtodo)
        .then(res => console.log(res.data))
        .catch(err => console.log(err.data));

        this.setState({
            todo: '',
            date: new Date()
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
        return this.state.todos.map(i => {
            return <Todos todo={i} deleteTodo={this.deleteTodo} key={i._id} />; }
        )
    }
    render() { 
        return (
            <div className="container" style={{ marginTop: '20vh' }}>
                <div className="row">
                    <div className="col-lg-12">
                        <h2>Todo List</h2>
                        <br/>
                        {this.state.msg !== null ? (<div className="p-3 mb-2 bg-danger text-white"> {this.state.msg} </div>) : null}
                        <form onSubmit={this.onSubmit}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-notes-medical"></i></span>
                                </div>
                                <input type="text" className="form-control" placeholder="Type Your todo" onChange={this.onChangeTodo} value={this.state.todo} required/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-calendar-day"></i></span>
                                </div>
                                <DatePicker selected={this.state.date} onChange={this.onChangeDueDate} required/>
                            </div>
                            <input type="submit" className="btn btn-outline-primary" value="Add" style={{ width: '100%' }} />
                        </form>
                    </div>
                    
                    <br/>
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
        );
    }
}