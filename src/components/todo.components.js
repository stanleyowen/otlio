import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import cookie from 'react-cookies';
import axios from 'axios';

const List = props =>{
    <tr>
        <td>{props.activity.activity}</td>
        <td>{props.activity.date.substring(0, 10)}</td>
        <td>Hello</td>
    </tr>
}

const token = cookie.load('token');
async function validation(){
    var logged_in = false
    await axios.get('http://localhost:5000/user/')
    .then(res => {
        (res.data).forEach(i=> {
            if(i.token === token){
                logged_in = true
                return true
            }
        })
    })
    .catch(err => console.log(err));
    return logged_in
}

export default class todo extends Component {
    constructor(props){
        super(props);

        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeActivity = this.onChangeActivity.bind(this);
        this.onChangeDueDate = this.onChangeDueDate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            activity : "",
            date : new Date(),
            username : "",
            msg : null,
            todos: [],
        }
    }

    async componentDidMount(){
        if(!validation){
            window.location = '/ ';
        }
        const token = cookie.load('token');
        await axios.get('http://localhost:5000/user/')
        .then(res => {
            res.data.forEach(i => {
                if(i.token === token){
                    this.setState({
                        username: i.username
                    })
                }
            })
        })
        await axios.get('http://localhost:5000/todo/')
        .then(res => {
            this.setState({
                tododata : res.data 
            })
        })
    }

    onChangeUsername(e){
        this.setState({
            username: e.target.value
        })
    }

    onChangeActivity(e){
        this.setState({
            activity: e.target.value
        })
    }
    onChangeDueDate(date){
        this.setStatez({
            date: date
        })
    }
    onSubmit(e){
        e.preventDefault();
        if(this.state.activity.length === 0){
            return this.setState({ msg: "Activity Field Is Required" })
        }
        if(this.state.activity.length > 500){
            return this.setState({ msg: "Activity Field Cannot Contain more than 500 words" });
        }
        const newActivity = {
            username: this.state.username,
            description: this.state.activity,
            date: this.state.date,
        }
        console.log(newActivity);
        axios.post('http://localhost:5000/todo/add/', newActivity)
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }
    todolist(){
        var todos = this.state.todos;
        return todos.map(i => <List activity={i} key={i._id}></List>)
    }
    render() { 
        return (
            <div className="container" style={{ marginTop: '20vh' }}>
                <div className="row">
                    <div className="col-lg-12">
                    {this.state.msg !== null ? (<div className="p-3 mb-2 bg-danger text-white"> {this.state.msg} </div>) : null}
                        <form onSubmit={this.onSubmit}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-notes-medical"></i></span>
                                </div>
                                <input type="text" className="form-control" placeholder="Type Your Activity" onChange={this.onChangeActivity} value={this.state.activity} required/>
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
                            {this.todolist()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}