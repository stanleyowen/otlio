import React, { Component } from 'react';
import cookie from 'react-cookies';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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
        this.logout = this.logout.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            todo : "",
            date : new Date(),
            username : "",
            msg : null,
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
    logout(e) {
        cookie.remove('token');
        window.location='/';
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
        axios.post('http://localhost:5000/todo/add/', newtodo)
        .then(res => console.log(res.data))
        .catch(err => console.log(err.data));
        window.location='/dashboard';
    }
    render() { 
        return (
            <div className="container" style={{ marginTop: '20vh', fontFamily:'Itim' }}>
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
                            <input type="submit" className="btn btn-outline-primary" value="Add" style={{ width: '100%', marginBottom: '10px' }} />
                            <a href="/dashboard" className="btn btn-outline-warning" style={{ width: '100%', marginBottom: '10px' }}>Discard</a>
                            <a href="#!" onClick={this.logout} className="btn btn-outline-danger" style={{ width: '100%', marginBottom: '10px' }}>Logout</a>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}