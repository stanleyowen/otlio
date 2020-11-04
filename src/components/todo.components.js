import React, { Component } from 'react';
import cookie from 'react-cookies';
import axios from 'axios';

const Todos = props => (
    <tr>
        <td>{props.todo.description}</td>
        <td>{props.todo.date.substring(0, 10)}</td>
        <td>
            <a href="#" onClick={()=> {props.deleteTodo(props.todo._id)}}><i class="fas fa-trash-alt"></i></a>
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
            <div className="container" style={{ marginTop: '20vh', fontFamily:'Itim' }}>
                <div className="row">
                    <h1>Activity List</h1>
                    <a href="/add" className="btn btn-outline-primary" style={{ width: '100%', marginBottom: '10px' }}>Add Activity</a>
                    <a href="#" className="btn btn-outline-danger" style={{ width: '100%', marginBottom: '10px' }}>Logout</a>
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