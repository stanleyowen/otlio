import React, { Component } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const Todos = props => {
    <tr>
        <td>{props.todo.username}</td>
        <td>{props.todo.description}</td>
        <td>{props.todo.date.substring(0, 10)}</td>
        <td>
            <a href="#" onClick={()=> {props.deleteTodo(props.todo._id)}}>delete</a>
        </td>
    </tr>
}

export default class Exercise extends Component {
    constructor(props){
        super(props);

        this.deleteTodo = this.deleteTodo.bind(this);

        this.state = {
            todos: [],
        }
    }

    async componentDidMount(){
        await axios.get('http://localhost:5000/todo/')
        .then(res => {
            this.setState({
                todos: res.data
            })
        })
        .catch((err) => {console.log(err)});
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